import axios from 'axios';

// Ensure this matches your FastAPI port
const API_URL = 'http://localhost:8000';

export interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  model_used?: string;
}

export interface Session {
  id: number;
  title: string;
  created_at: string;
}

export const api = {
  // Fetch available AI models
  getModels: async () => {
    const res = await axios.get(`${API_URL}/models`);
    return res.data;
  },

  // Fetch list of past chat sessions
  getSessions: async () => {
    const res = await axios.get(`${API_URL}/sessions`);
    return res.data;
  },

  // Load a specific chat history
  getSessionHistory: async (sessionId: number) => {
    const res = await axios.get(`${API_URL}/sessions/${sessionId}`);
    return res.data;
  },

  // Send a message to the AI
  sendMessage: async (content: string, model: string, sessionId?: number) => {
    const res = await axios.post(`${API_URL}/chat`, {
      content,
      model,
      session_id: sessionId
    });
    return res.data;
  },

  // Send a message to the AI (Streaming)
  streamMessage: async (
    content: string, 
    model: string, 
    sessionId: number | undefined,
    onChunk: (chunk: string) => void,
    onSessionId: (id: number) => void,
    signal: AbortSignal
  ) => {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, model, session_id: sessionId }),
      signal
    });

    if (!response.ok) throw new Error(response.statusText);

    // Get Session ID from header
    const newSessionId = response.headers.get("X-Session-Id");
    if (newSessionId) {
        onSessionId(parseInt(newSessionId));
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  }
};