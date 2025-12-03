
import { type Session } from "@/api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, MessageSquare, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  sessions: Session[];
  currentSessionId: number | undefined;
  onSelectSession: (id: number) => void;
  onNewChat: () => void;
}

export function ChatSidebar({ sessions, currentSessionId, onSelectSession, onNewChat }: ChatSidebarProps) {
  return (
    <div className="w-[280px] bg-[#f0f4f9] flex flex-col h-full hidden md:flex overflow-y-auto shrink-0">
      {/* App Header */}
      <div className="p-4 sticky top-0 bg-[#f0f4f9] z-10">
        <div className="flex items-center gap-2 mb-6 font-bold text-xl text-slate-700 px-2">
          <span>Madlen AI</span>
        </div>
        <Button 
          onClick={onNewChat} 
          className="w-full gap-2 shadow-none bg-[#dde3ea] text-slate-700 hover:bg-white rounded-full justify-start px-4 py-6"
        >
          <Plus size={20} className="text-slate-500" /> 
          <span className="text-sm font-medium">New Chat</span>
        </Button>
      </div>

      {/* History List */}
      <div className="px-4 pb-4">
        <div className="px-3 py-2 text-xs font-medium text-slate-500">
          Recent
        </div>
        <div className="space-y-1">
          {sessions.map((session) => (
            <Button
              key={session.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-sm font-normal truncate h-auto py-2 px-3 rounded-full hover:bg-[#dde3ea]",
                currentSessionId === session.id && "bg-[#d3e3fd] text-[#001d35] hover:bg-[#d3e3fd]"
              )}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare size={16} className="mr-2 shrink-0 opacity-70" />
              <span className="truncate">{session.title}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}