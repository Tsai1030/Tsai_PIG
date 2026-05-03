"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MenuIcon, SendIcon } from "lucide-react";
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

const HER_PROMPTS = ["今晚吃什麼？", "推薦下午茶", "查我的口袋名單", "安排週末約會"];
const HIM_PROMPTS = ["今天行程", "下班吃什麼", "公主排了哪些餐", "推薦快速早午餐"];

export default function ChatWidget({ isHer }: ChatWidgetProps) {
  const { role } = useAuth();
  const roleStr = role ?? (isHer ? "her" : "him");
  const cfgImg = isHer ? "/her-pic.png" : "/him-pic.png";
  const cfgEn = isHer ? "La Princesse" : "Le Prince";
  const cfgName = isHer ? "糖糖" : "阿哲";
  const accent = isHer ? "var(--kawaii-her)" : "var(--kawaii-him)";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(() => getSessions(roleStr));
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const refreshSessions = useCallback(() => setSessions(getSessions(roleStr)), [roleStr]);

  const { messages, isStreaming, activeThreadId, sendMessage, switchThread, newThread } = useChat(
    roleStr,
    refreshSessions
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const resizeInput = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 120);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > 120 ? "auto" : "hidden";
  }, []);

  useEffect(() => resizeInput(), [input, resizeInput]);

  const submitMessage = useCallback(() => {
    const text = input.trim();
    if (!text || isStreaming) return;
    sendMessage(text);
    setInput("");
  }, [input, isStreaming, sendMessage]);

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
    ? "公主殿下～有什麼想吃的嗎？糖糖來幫您推薦 ♥"
    : "您好，有什麼餐飲相關的問題嗎？";

  const prompts = isHer ? HER_PROMPTS : HIM_PROMPTS;

  return (
    <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden">
      <ChatSidebar
        sessions={sessions}
        activeThreadId={activeThreadId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Sticky character header */}
      <div
        className="shrink-0 px-4 sm:px-6 pt-4 pb-3"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.24 0.07 295 / 0.85) 0%, oklch(0.24 0.07 295 / 0.5) 80%, transparent 100%)",
          backdropFilter: "blur(16px)",
          zIndex: 10,
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="size-10 rounded-full glass-kawaii flex items-center justify-center text-white hover:scale-110 transition"
            title="對話紀錄"
          >
            <MenuIcon className="size-4" />
          </button>

          <div className="relative shrink-0" style={{ width: 56, height: 56 }}>
            <div
              className="absolute inset-0 rounded-full glow-pulse"
              style={{ background: `linear-gradient(135deg, ${accent}, var(--kawaii-mid))` }}
            />
            <div className="absolute inset-[3px] rounded-full overflow-hidden bg-white/10">
              <Image
                src={cfgImg}
                alt={cfgName}
                width={120}
                height={120}
                className="w-full h-full object-cover float-y-slow"
                style={{ objectPosition: "top" }}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-display italic" style={{ color: accent, fontSize: 13 }}>
              {cfgEn} · AI
            </p>
            <h1 className="font-serif font-bold text-white truncate" style={{ fontSize: 18 }}>
              {cfgName}
            </h1>
          </div>

          <span
            className="px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
            style={{
              background: "oklch(0.78 0.16 145 / 0.2)",
              color: "oklch(0.85 0.18 145)",
              border: "1px solid oklch(0.78 0.16 145 / 0.4)",
            }}
          >
            ● ONLINE
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pt-4 pb-44"
      >
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <Image
                src={cfgImg}
                alt={cfgName}
                width={200}
                height={250}
                className="float-y mx-auto"
                style={{ height: 200, width: "auto", filter: `drop-shadow(0 12px 32px ${accent})` }}
              />
              <p className="font-serif text-white mt-6 max-w-xs leading-relaxed" style={{ fontSize: 16 }}>
                {greeting}
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-6 max-w-md">
                {prompts.map((p) => (
                  <button key={p} onClick={() => setInput(p)} className="map-chip">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.role === "assistant" && msg.content.trim() === "") return null;
            return <ChatBubble key={msg.id} message={msg} isHer={isHer} />;
          })}

          {isStreaming && messages[messages.length - 1]?.content === "" && <TypingIndicator />}
        </div>
      </div>

      {/* Sticky input bar (fixed within layout) */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pt-3 pb-4"
        style={{
          background:
            "linear-gradient(0deg, oklch(0.24 0.07 295 / 0.95) 0%, oklch(0.24 0.07 295 / 0.6) 80%, transparent 100%)",
          backdropFilter: "blur(20px)",
          zIndex: 10,
        }}
      >
        <div className="max-w-3xl mx-auto">
          {messages.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {prompts.slice(0, 3).map((p) => (
                <button key={p} onClick={() => setInput(p)} className="map-chip shrink-0" style={{ fontSize: 12, padding: "6px 12px" }}>
                  {p}
                </button>
              ))}
            </div>
          )}
          <div
            className="flex gap-2 items-end glass-kawaii rounded-3xl pl-4 pr-2 py-2"
            style={{ border: `1px solid ${accent}40` }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
                e.preventDefault();
                submitMessage();
              }}
              placeholder={isHer ? "跟糖糖說說想吃什麼..." : "輸入您的問題..."}
              disabled={isStreaming}
              className="flex-1 min-h-[36px] max-h-[120px] resize-none bg-transparent outline-none font-serif text-white placeholder:text-white/40 py-2 px-1 disabled:opacity-50"
              style={{ fontSize: 15, lineHeight: 1.5 }}
            />
            <button
              onClick={submitMessage}
              disabled={isStreaming || !input.trim()}
              className="shrink-0 size-10 rounded-full flex items-center justify-center text-white transition hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
              style={{
                background: `linear-gradient(135deg, ${accent}, var(--kawaii-mid))`,
                boxShadow: `0 4px 16px ${accent}60`,
              }}
              title="發送"
            >
              <SendIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
