"use client";



import { useCallback, useEffect, useRef, useState } from "react";

import { MenuIcon, SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

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

  const [sessions, setSessions] = useState<ChatSession[]>(() => getSessions(roleStr));

  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);



  const refreshSessions = useCallback(() => {

    setSessions(getSessions(roleStr));

  }, [roleStr]);



  const { messages, isStreaming, activeThreadId, sendMessage, switchThread, newThread } =

    useChat(roleStr, refreshSessions);



  useEffect(() => {

    scrollRef.current?.scrollTo({

      top: scrollRef.current.scrollHeight,

      behavior: "smooth",

    });

  }, [messages]);



  const resizeInput = useCallback(() => {

    const el = inputRef.current;

    if (!el) return;



    el.style.height = "0px";

    const nextHeight = Math.min(el.scrollHeight, 140);

    el.style.height = `${nextHeight}px`;

    el.style.overflowY = el.scrollHeight > 140 ? "auto" : "hidden";

  }, []);



  useEffect(() => {

    resizeInput();

  }, [input, resizeInput]);



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

    ? "公主殿下～有什麼想吃的嗎？糖糖來幫您推薦 💕"

    : "您好，有什麼餐飲相關的問題嗎？";



  return (

    <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden bg-background lg:items-center lg:justify-center lg:p-5">

      <ChatSidebar

        sessions={sessions}

        activeThreadId={activeThreadId}

        isOpen={sidebarOpen}

        onClose={() => setSidebarOpen(false)}

        onNewChat={handleNewChat}

        onSelectSession={handleSelectSession}

        onDeleteSession={handleDeleteSession}

      />



      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:h-[min(810px,calc(100vh-8.5rem))] lg:w-[420px] lg:max-w-[calc(100vw-2.5rem)] lg:flex-none lg:rounded-[36px] lg:border lg:border-zinc-700/70 lg:bg-zinc-900/95 lg:shadow-[0_32px_80px_-30px_rgba(0,0,0,0.85)] lg:backdrop-blur">

        <div className="flex items-center gap-2 border-b px-3 py-2 shrink-0 lg:border-zinc-700/80 lg:bg-zinc-900 lg:px-4 lg:py-3">

          <div className="hidden items-center gap-1.5 lg:flex">

            <span className="size-2.5 rounded-full bg-red-500" />

            <span className="size-2.5 rounded-full bg-amber-400" />

            <span className="size-2.5 rounded-full bg-emerald-500" />

          </div>

          <Button

            variant="ghost"

            size="icon"

            className="size-8 lg:text-zinc-200 lg:hover:bg-zinc-800"

            onClick={() => setSidebarOpen(true)}

            title="聊天紀錄"

          >

            <MenuIcon className="size-4" />

          </Button>

          <span className="text-sm font-medium text-muted-foreground lg:text-zinc-300">

            {isHer ? "糖糖" : "阿哲"}

          </span>

        </div>



        <div

          ref={scrollRef}

          className="flex-1 space-y-3 overflow-y-auto p-4 [scrollbar-color:#52525b_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-600/80 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2 lg:bg-zinc-900/70"

        >

          {messages.length === 0 && (

            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground lg:text-zinc-400">

              <span className="mb-3 text-4xl">{isHer ? "🍬" : "🍽️"}</span>

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



         <div className="flex shrink-0 items-end gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">

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

              className="flex-1 min-h-8 max-h-[140px] resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm leading-5 transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 lg:border-zinc-700 lg:bg-zinc-800/70 lg:text-zinc-100 lg:placeholder:text-zinc-500 lg:focus-visible:border-zinc-500 lg:focus-visible:ring-zinc-500/30"

            />

          <Button

            type="button"

            size="icon"

            disabled={isStreaming || !input.trim()}

            className="shrink-0"

            onClick={submitMessage}

          >

            <SendIcon className="size-4" />

          </Button>

        </div>

      </div>

    </div>

  );

}
