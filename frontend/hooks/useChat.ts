"use client";

import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  getSessions,
  loadMessages,
  saveMessages,
  upsertSession,
} from "@/lib/chatHistory";
import type { ChatMessage } from "@/types/chat";

type StreamPayload = {
  thread_id?: string;
  content?: unknown;
};

function extractContentText(content: unknown): string {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          const text = (part as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        }
        return "";
      })
      .join("");
  }

  if (content && typeof content === "object" && "text" in content) {
    const text = (content as { text?: unknown }).text;
    return typeof text === "string" ? text : "";
  }

  return "";
}

export function useChat(role: string, onSessionsChanged: () => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Refs for values needed inside async callbacks
  const activeThreadIdRef = useRef<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const switchThread = useCallback(
    (threadId: string) => {
      abortRef.current?.abort();
      const msgs = loadMessages(threadId);
      activeThreadIdRef.current = threadId;
      messagesRef.current = msgs;
      setActiveThreadId(threadId);
      setMessages(msgs);
      setIsStreaming(false);
    },
    []
  );

  const newThread = useCallback(() => {
    abortRef.current?.abort();
    activeThreadIdRef.current = null;
    messagesRef.current = [];
    setActiveThreadId(null);
    setMessages([]);
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };

      const withNew = [...messagesRef.current, userMsg, assistantMsg];
      messagesRef.current = withNew;
      setMessages(withNew);
      setIsStreaming(true);

      const abortController = new AbortController();
      abortRef.current = abortController;
      let hasText = false;

      try {
        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            message: content,
            thread_id: activeThreadIdRef.current,
          }),
          signal: abortController.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let done = false;

        while (!done) {
          const { done: streamDone, value } = await reader.read();
          if (streamDone) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const payload = trimmed.slice(6);
            if (payload === "[DONE]") { done = true; break; }

            try {
              const parsed: StreamPayload = JSON.parse(payload);

              if (parsed.thread_id && !activeThreadIdRef.current) {
                activeThreadIdRef.current = parsed.thread_id;
                setActiveThreadId(parsed.thread_id);
                upsertSession(role, {
                  threadId: parsed.thread_id,
                  title: content.slice(0, 30) + (content.length > 30 ? "…" : ""),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
                onSessionsChanged();
              }

              const text = extractContentText(parsed.content);
              if (!text) continue;

              hasText = true;
              flushSync(() => {
                setMessages((prev) => {
                  const updated = prev.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: m.content + text }
                      : m
                  );
                  messagesRef.current = updated;
                  return updated;
                });
              });
            } catch {
              // skip malformed JSON
            }
          }
        }

        if (!hasText) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: "目前沒有回覆內容，請再試一次。" }
                : m
            )
          );
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: "抱歉，發生錯誤，請稍後再試。" }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;

        // Only persist if this request was not aborted (user didn't switch thread)
        if (!abortController.signal.aborted && activeThreadIdRef.current) {
          const threadId = activeThreadIdRef.current;
          saveMessages(threadId, messagesRef.current);
          const session = getSessions(role).find((s) => s.threadId === threadId);
          if (session) {
            upsertSession(role, { ...session, updatedAt: new Date().toISOString() });
            onSessionsChanged();
          }
        }
      }
    },
    [isStreaming, role, onSessionsChanged]
  );

  return { messages, isStreaming, activeThreadId, sendMessage, switchThread, newThread };
}
