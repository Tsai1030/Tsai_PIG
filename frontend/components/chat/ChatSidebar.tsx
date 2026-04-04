"use client";

import { MessageSquareIcon, PlusIcon, TrashIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
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
          className="fixed inset-0 z-20 bg-black/30"
          onClick={onClose}
          aria-hidden
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 z-30 w-72 bg-background border-r flex flex-col transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <span className="text-sm font-semibold">對話紀錄</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onNewChat}
              title="新對話"
            >
              <PlusIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onClose}
              title="關閉"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {sessions.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-10">
              尚無對話紀錄
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.threadId}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                  activeThreadId === session.threadId
                    ? "bg-accent"
                    : "hover:bg-muted"
                )}
                onClick={() => onSelectSession(session.threadId)}
              >
                <MessageSquareIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate leading-snug">{session.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(session.updatedAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.threadId);
                  }}
                  title="刪除"
                >
                  <TrashIcon className="size-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
