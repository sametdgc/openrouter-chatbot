import { type Message } from "@/api";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
      
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
          <Bot size={16} className="text-blue-600" />
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        "flex flex-col max-w-[80%] md:max-w-[70%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed overflow-hidden break-words w-full",
          isUser 
            ? "bg-blue-600 text-white rounded-br-none" 
            : "bg-white text-slate-800 border rounded-bl-none"
        )}>
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown
              components={{
                p: ({node, ...props}: any) => <p className="mb-2 last:mb-0 whitespace-pre-wrap" {...props} />,
                ul: ({node, ...props}: any) => <ul className="list-disc pl-4 mb-2" {...props} />,
                ol: ({node, ...props}: any) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                li: ({node, ...props}: any) => <li className="mb-1" {...props} />,
                h1: ({node, ...props}: any) => <h1 className="text-lg font-bold mb-2" {...props} />,
                h2: ({node, ...props}: any) => <h2 className="text-base font-bold mb-2" {...props} />,
                h3: ({node, ...props}: any) => <h3 className="text-sm font-bold mb-2" {...props} />,
                blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-slate-300 pl-4 italic mb-2" {...props} />,
                code: ({node, ...props}: any) => {
                    const isInline = props.inline || !String(props.children).includes('\n');
                    return isInline 
                        ? <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs text-slate-800 border border-slate-200 break-all" {...props} />
                        : <code className="block bg-slate-900 text-slate-50 p-3 rounded-lg font-mono text-xs overflow-x-auto my-2 whitespace-pre" {...props} />
                },
                pre: ({node, ...props}: any) => <pre className="m-0 p-0 bg-transparent max-w-full overflow-x-auto" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        
        {/* Model Info (Optional) */}
        {!isUser && message.model_used && (
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {message.model_used.split(':')[0]}
          </span>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0">
          <User size={16} className="text-slate-600" />
        </div>
      )}
    </div>
  );
}