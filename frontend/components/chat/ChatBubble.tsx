"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

interface ChatBubbleProps {
  message: ChatMessage;
  isHer: boolean;
}

export default function ChatBubble({ message, isHer }: ChatBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-3 bubble-in">
        <div className="chat-bubble-self whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 mb-3 bubble-in">
      <div
        className="text-xl shrink-0 mb-1"
        style={{ filter: "drop-shadow(0 0 8px var(--primary))" }}
      >
        ✦
      </div>
      <div className={cn("chat-bubble-bot whitespace-pre-wrap text-sm leading-relaxed")}>
        <p className="font-display italic text-xs mb-1 opacity-70">
          {isHer ? "糖糖" : "阿哲"} · AI
        </p>
        {message.content}
      </div>
    </div>
  );
}
