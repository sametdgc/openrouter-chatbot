import { useState } from "react";
import { type Session } from "@/api";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChatSidebarProps {
  sessions: Session[];
  currentSessionId: number | undefined;
  onSelectSession: (id: number) => void;
  onNewChat: () => void;
  onDeleteSession: (id: number) => void;
}

export function ChatSidebar({ sessions, currentSessionId, onSelectSession, onNewChat, onDeleteSession }: ChatSidebarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setSessionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (sessionToDelete !== null) {
      onDeleteSession(sessionToDelete);
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  return (
    <div className="w-[280px] bg-[#f0f4f9] flex-col h-full hidden md:flex overflow-y-auto shrink-0">
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
            <div key={session.id} className="group relative flex items-center">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sm font-normal truncate h-auto py-2 px-3 rounded-full hover:bg-[#dde3ea] pr-8",
                  currentSessionId === session.id && "bg-[#d3e3fd] text-[#001d35] hover:bg-[#d3e3fd]"
                )}
                onClick={() => onSelectSession(session.id)}
              >
                <MessageSquare size={16} className="mr-2 shrink-0 opacity-70" />
                <span className="truncate">{session.title}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-transparent"
                onClick={(e) => handleDeleteClick(e, session.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat?</DialogTitle>
            <DialogDescription>
              This will permanently delete this chat session. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}