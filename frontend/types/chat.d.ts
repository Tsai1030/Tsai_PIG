export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatSession {
  threadId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
