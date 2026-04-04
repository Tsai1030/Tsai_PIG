"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChatMessage } from "@/types/chat";

interface ChatBubbleProps {
  message: ChatMessage;
  isHer: boolean;
}

export default function ChatBubble({ message, isHer }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isUser && (
        <Avatar size="sm">
          <AvatarFallback className="bg-pink-100 text-pink-600 text-xs">
            {isHer ? "🍬" : "AI"}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
