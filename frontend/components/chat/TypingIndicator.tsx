"use client";

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <span className="text-xs text-muted-foreground mr-1">正在輸入</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}
