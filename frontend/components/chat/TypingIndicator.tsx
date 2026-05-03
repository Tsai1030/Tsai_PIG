"use client";

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3 bubble-in">
      <div className="text-xl shrink-0 mb-1" style={{ filter: "drop-shadow(0 0 8px var(--primary))" }}>
        ✦
      </div>
      <div className="chat-bubble-bot flex items-center gap-1.5">
        <span className="text-xs opacity-70 mr-1">思考中</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-white animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
