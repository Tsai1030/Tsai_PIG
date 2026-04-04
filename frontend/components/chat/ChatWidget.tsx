"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MenuIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatBubble from "./ChatBubble";
import ChatSidebar from "./ChatSidebar";
import TypingIndicator from "./TypingIndicator";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { deleteSession, getSessions } from "@/lib/chatHistory";
import type { ChatSession } from "@/types/chat";

interface ChatWidgetProps {
  isHer: boolean;
}

export default function ChatWidget({ isHer }: ChatWidgetProps) {
  const { role } = useAuth();
  const roleStr = role ?? (isHer ? "her" : "him");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshSessions = useCallback(() => {
    setSessions(getSessions(roleStr));
  }, [roleStr]);

  const { messages, isStreaming, activeThreadId, sendMessage, switchThread, newThread } =
    useChat(roleStr, refreshSessions);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

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

  const handleSelectSession = useCallback(
    (threadId: string) => {
      switchThread(threadId);
      setSidebarOpen(false);
    },
    [switchThread]
  );

  const handleNewChat = useCallback(() => {
    newThread();
    setSidebarOpen(false);
  }, [newThread]);

  const handleDeleteSession = useCallback(
    (threadId: string) => {
      deleteSession(roleStr, threadId);
      if (activeThreadId === threadId) newThread();
      refreshSessions();
    },
    [roleStr, activeThreadId, newThread, refreshSessions]
  );

  const greeting = isHer
    ? "公主殿下～有什麼想吃的嗎？糖糖來幫您推薦 💕"
    : "您好，有什麼餐飲相關的問題嗎？";

  return (
    <div className="flex flex-1 flex-col relative overflow-hidden">
      <ChatSidebar
        sessions={sessions}
        activeThreadId={activeThreadId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Top bar */}
      <div className="flex items-center gap-2 border-b px-3 py-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setSidebarOpen(true)}
          title="對話紀錄"
        >
          <MenuIcon className="size-4" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {isHer ? "糖糖" : "阿哲"}
        </span>
      </div>

      {/* Messages */}
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

      {/* Input */}
      <div className="border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
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
