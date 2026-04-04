"use client";

import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
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

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const threadIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const abortController = new AbortController();
      abortRef.current = abortController;
      let hasAssistantText = false;
      let reachedDone = false;

      try {
        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            message: content,
            thread_id: threadIdRef.current,
          }),
          signal: abortController.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (!reachedDone) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            const payload = trimmed.slice(6);
            if (payload === "[DONE]") {
              reachedDone = true;
              break;
            }

            try {
              const parsed: StreamPayload = JSON.parse(payload);

              if (parsed.thread_id) {
                threadIdRef.current = parsed.thread_id;
              }

              const text = extractContentText(parsed.content);
              if (!text) continue;

              hasAssistantText = true;
              flushSync(() => {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id ? { ...m, content: m.content + text } : m
                  )
                );
              });
            } catch {
              // skip malformed JSON chunks
            }
          }
        }

        if (!hasAssistantText) {
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
      }
    },
    [isStreaming]
  );

  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    threadIdRef.current = null;
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, sendMessage, resetChat };
}
