import { useState, useEffect, useRef } from "react";
import { api, type Session, type Message } from "@/api";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatWindow } from "@/components/ChatWindow";

function App() {
  // --- State ---
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.0-flash-exp:free");
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // --- Initial Data ---
  useEffect(() => {
    const init = async () => {
      try {
        const [sessionData, modelData] = await Promise.all([
          api.getSessions(),
          api.getModels()
        ]);
        setSessions(sessionData);
        setModels(modelData);
      } catch (error) {
        console.error("Initialization failed", error);
      }
    };
    init();
  }, []);

  // --- Actions ---
  const loadSession = async (id: number) => {
    setIsLoading(true);
    setCurrentSessionId(id);
    try {
      const history = await api.getSessionHistory(id);
      setMessages(history);
    } catch (error) {
      console.error("Failed to load session", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (isLoading) handleAbort();
    setCurrentSessionId(undefined);
    setMessages([]);
  };

  const handleAbort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    // 1. Optimistic UI
    const tempUserMsg: Message = { role: "user", content };
    const tempAiMsg: Message = { role: "assistant", content: "", model_used: selectedModel };
    
    setMessages((prev) => [...prev, tempUserMsg, tempAiMsg]);
    setIsLoading(true);

    // Create AbortController
    abortControllerRef.current = new AbortController();

    try {
      await api.streamMessage(
        content,
        selectedModel,
        currentSessionId,
        (chunk) => {
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg.role === "assistant") {
                // Create a new object to trigger re-render if needed, 
                // though mutating deep property might work if array ref changes
                newMessages[newMessages.length - 1] = {
                    ...lastMsg,
                    content: lastMsg.content + chunk
                };
            }
            return newMessages;
          });
        },
        (id) => {
            if (!currentSessionId) {
                setCurrentSessionId(id);
                // Refresh sidebar
                api.getSessions().then(setSessions);
            }
        },
        abortControllerRef.current.signal
      );
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error("Chat error", error);
        const errorMsg: Message = { 
            role: "assistant", 
            content: "\n\n⚠️ I'm sorry, I couldn't connect to the server. Is the backend running?" 
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white font-sans">
      <ChatSidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={loadSession}
        onNewChat={handleNewChat}
      />
      <ChatWindow 
        messages={messages}
        models={models}
        selectedModel={selectedModel}
        isLoading={isLoading}
        onModelChange={setSelectedModel}
        onSendMessage={handleSendMessage}
        onAbort={handleAbort}
      />
    </div>
  );
}

export default App;