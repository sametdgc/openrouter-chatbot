import { useState, useRef, useEffect } from "react";
import { type Message } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bot, Square, Menu, Paperclip, X } from "lucide-react";
import { ChatMessage } from "./ChatMessage";

interface ChatWindowProps {
  messages: Message[];
  models: { id: string; name: string }[];
  selectedModel: string;
  isLoading: boolean;
  onModelChange: (val: string) => void;
  onSendMessage: (content: string, imageBase64?: string) => void;
  onAbort?: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ChatWindow({ 
  messages, 
  models, 
  selectedModel, 
  isLoading, 
  onModelChange, 
  onSendMessage,
  onAbort,
  isSidebarOpen,
  onToggleSidebar
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom only when message count changes or loading starts
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;
    onSendMessage(input, selectedImage || undefined);
    setInput("");
    setSelectedImage(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix to get just base64
        const base64Content = base64String.split(',')[1];
        setSelectedImage(base64Content);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-white">
      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
            {!isSidebarOpen && (
                <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="text-slate-500">
                    <Menu size={24} />
                </Button>
            )}
            <span className="font-semibold text-slate-700 md:hidden">Madlen AI</span>
        </div>
        <div className="w-48 md:w-64">
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="w-full border-none shadow-none text-lg font-medium text-slate-600 focus:ring-0 px-0">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 md:p-6 pb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-400 to-red-400 rounded-xl flex items-center justify-center mb-6 shadow-sm opacity-80">
                <Bot size={24} className="text-white" />
              </div>
              <p className="text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-red-500">Hello, Samet</p>
              <p className="text-2xl font-medium text-slate-300">How can I help you today?</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))
          )}

          {/* Loading Indicator */}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div className="flex gap-3 mb-4 animate-pulse">
               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                 <Bot size={16} className="text-blue-600" />
               </div>
               <div className="px-5 py-3">
                 <div className="flex gap-1">
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-0"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></div>
                 </div>
               </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white shrink-0">
        <div className="max-w-3xl mx-auto">
          {selectedImage && (
            <div className="mb-2 relative inline-block">
                <img src={`data:image/jpeg;base64,${selectedImage}`} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200" />
                <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 hover:bg-slate-700"
                >
                    <X size={12} />
                </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="relative bg-[#f0f4f9] rounded-full flex items-center px-2 py-2 focus-within:bg-[#e8eef6] transition-colors">
            <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileSelect}
            />
            <Button 
                type="button"
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-slate-600 rounded-full"
                onClick={() => fileInputRef.current?.click()}
            >
                <Paperclip size={20} />
            </Button>
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Message Madlen AI..." 
              className="flex-1 border-none shadow-none bg-transparent focus-visible:ring-0 px-4 py-3 text-base"
              disabled={isLoading}
            />
            {isLoading ? (
                <Button 
                  type="button" 
                  onClick={onAbort}
                  size="icon" 
                  className="h-10 w-10 rounded-full shrink-0 bg-slate-800 hover:bg-slate-700 text-white mr-1"
                >
                  <Square size={16} fill="currentColor" />
                </Button>
            ) : (
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-10 w-10 rounded-full shrink-0 bg-slate-800 hover:bg-slate-700 text-white mr-1" 
                  disabled={!input.trim() && !selectedImage}
                >
                  <Send size={18} />
                </Button>
            )}
          </form>
          <div className="text-center mt-3 text-[11px] text-slate-400">
            Madlen AI can make mistakes. Check important info.
          </div>
        </div>
      </div>
    </div>
  );
}