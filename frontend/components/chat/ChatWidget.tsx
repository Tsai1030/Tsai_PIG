"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SendIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";
import { useChat } from "@/hooks/useChat";

interface ChatWidgetProps {
  isHer: boolean;
}

export default function ChatWidget({ isHer }: ChatWidgetProps) {
  const { messages, isStreaming, sendMessage, resetChat } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      sendMessage(input.trim());
      setInput("");
    },
    [input, sendMessage]
  );

  const greeting = isHer
    ? "公主殿下～有什麼想吃的嗎？糖糖來幫您推薦 💕"
    : "您好，有什麼餐飲相關的問題嗎？";

  return (
    <div className="flex flex-1 flex-col">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <span className="text-4xl mb-3">{isHer ? "🍬" : "🍽️"}</span>
            <p className="text-sm">{greeting}</p>
          </div>
        )}
        {messages.map((msg) => {
          if (msg.role === "assistant" && msg.content.trim() === "") return null;
          return <ChatBubble key={msg.id} message={msg} isHer={isHer} />;
        })}
        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <TypingIndicator />
        )}
      </div>

      {/* Input area */}
      <div className="border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={resetChat}
            className="shrink-0"
            title="開啟新對話"
          >
            <RotateCcwIcon className="size-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isHer ? "跟糖糖說說想吃什麼..." : "輸入您的問題..."}
            disabled={isStreaming}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isStreaming || !input.trim()}
            className="shrink-0"
          >
            <SendIcon className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
