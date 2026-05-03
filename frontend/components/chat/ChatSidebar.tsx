"use client";

import { MessageSquareIcon, PlusIcon, TrashIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatSession } from "@/types/chat";

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeThreadId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectSession: (threadId: string) => void;
  onDeleteSession: (threadId: string) => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "昨天";
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function ChatSidebar({
  sessions,
  activeThreadId,
  isOpen,
  onClose,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}: ChatSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity"
          onClick={onClose}
          aria-hidden
          style={{ background: "oklch(0 0 0 / 0.6)", backdropFilter: "blur(8px)" }}
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 w-80 max-w-[88vw] flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "linear-gradient(180deg, oklch(0.34 0.10 295), oklch(0.24 0.07 295))",
          borderRight: "1px solid oklch(1 0 0 / 0.18)",
          boxShadow: "var(--shadow-2xl)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid oklch(1 0 0 / 0.12)" }}>
          <div>
            <p className="font-display italic text-[var(--kawaii-glow)]" style={{ fontSize: 12 }}>Sessions</p>
            <h3 className="font-serif font-bold text-white" style={{ fontSize: 18 }}>對話紀錄</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewChat}
              className="size-9 rounded-full glass-kawaii flex items-center justify-center text-white hover:scale-110 transition"
              title="新對話"
            >
              <PlusIcon className="size-4" />
            </button>
            <button
              onClick={onClose}
              className="size-9 rounded-full glass-kawaii flex items-center justify-center text-white hover:scale-110 transition"
              title="關閉"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          {sessions.length === 0 ? (
            <p className="text-center text-sm text-white/50 py-12 font-serif">
              尚無對話紀錄
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.threadId}
                onClick={() => onSelectSession(session.threadId)}
                className={cn(
                  "group flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer transition-all",
                  activeThreadId === session.threadId
                    ? "bg-white/15 shadow"
                    : "hover:bg-white/8"
                )}
                style={
                  activeThreadId === session.threadId
                    ? { border: "1px solid var(--primary)" }
                    : undefined
                }
              >
                <MessageSquareIcon className="size-4 shrink-0 text-white/50" />
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm text-white truncate leading-snug">{session.title}</p>
                  <p className="font-display italic text-xs text-white/45 mt-0.5">
                    {formatDate(session.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.threadId);
                  }}
                  className="size-7 opacity-0 group-hover:opacity-100 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-[var(--destructive)] transition shrink-0"
                  title="刪除"
                >
                  <TrashIcon className="size-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
