import type { ChatMessage, ChatSession } from "@/types/chat";

const sessionsKey = (role: string) => `chat_sessions_${role}`;
const messagesKey = (threadId: string) => `chat_messages_${threadId}`;

export function getSessions(role: string): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(sessionsKey(role));
    const sessions: ChatSession[] = raw ? JSON.parse(raw) : [];
    return sessions.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch {
    return [];
  }
}

export function upsertSession(role: string, session: ChatSession): void {
  const sessions = getSessions(role);
  const idx = sessions.findIndex((s) => s.threadId === session.threadId);
  if (idx >= 0) sessions[idx] = session;
  else sessions.push(session);
  localStorage.setItem(sessionsKey(role), JSON.stringify(sessions));
}

export function deleteSession(role: string, threadId: string): void {
  const sessions = getSessions(role).filter((s) => s.threadId !== threadId);
  localStorage.setItem(sessionsKey(role), JSON.stringify(sessions));
  localStorage.removeItem(messagesKey(threadId));
}

export function loadMessages(threadId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(messagesKey(threadId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMessages(threadId: string, messages: ChatMessage[]): void {
  localStorage.setItem(messagesKey(threadId), JSON.stringify(messages));
}
