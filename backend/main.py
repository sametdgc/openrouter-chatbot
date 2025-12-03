from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
import json

from models import Base, ChatSession, ChatMessage
from services import call_openrouter_api, fetch_available_models
from telemetry import setup_telemetry

# --- Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./madlen_chat.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Pydantic Schemas (Input Validation) ---
class MessageCreate(BaseModel):
    session_id: Optional[int] = None
    content: str
    model: str = "google/gemini-2.0-flash-exp:free"
    image_base64: Optional[str] = None

class SessionResponse(BaseModel):
    id: int
    title: str
    created_at: str

# --- App Setup ---
app = FastAPI(title="Madlen Chat API")

# Setup CORS (Allow Frontend to talk to Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup OpenTelemetry
setup_telemetry(app)

# --- Routes ---

@app.get("/hello")
def read_root():
    return {"message": "Hello from Madlen Chat API!"}

@app.get("/models")
def get_models():
    return fetch_available_models()

@app.get("/sessions")
def get_sessions(db: Session = Depends(get_db)):
    # Return sessions sorted by newest first
    sessions = db.query(ChatSession).order_by(desc(ChatSession.created_at)).all()
    return sessions

@app.get("/sessions/{session_id}")
def get_session_history(session_id: int, db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).all()
    return messages

@app.delete("/sessions/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"message": "Session deleted"}

@app.post("/chat")
def chat(request: MessageCreate, db: Session = Depends(get_db)):
    # 1. Create a session if one doesn't exist
    session_id = request.session_id
    if not session_id:
        # Use first few words of message as title
        title = " ".join(request.content.split()[:4]) + "..."
        new_session = ChatSession(title=title)
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        session_id = new_session.id

    # 2. Save User Message
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=request.content
    )
    db.add(user_msg)
    db.commit()

    # 3. Prepare context for AI (Get previous messages for context)
    # Limit context window to last 10 messages to save tokens/complexity
    previous_msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).all()
    
    # Format for OpenRouter API
    formatted_messages = [{"role": m.role, "content": m.content} for m in previous_msgs]

    # 4. Generator Wrapper
    def event_generator():
        full_response = ""
        try:
            for chunk in call_openrouter_api(formatted_messages, request.model, request.image_base64):
                full_response += chunk
                yield chunk
        except Exception as e:
            yield f"\n[ERROR: {str(e)}]"
        finally:
            # 5. Save AI Response (After stream ends)
            new_db = SessionLocal()
            try:
                ai_msg = ChatMessage(
                    session_id=session_id,
                    role="assistant",
                    content=full_response,
                    model_used=request.model
                )
                new_db.add(ai_msg)
                new_db.commit()
            finally:
                new_db.close()

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers={"X-Session-Id": str(session_id)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)