"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

export default function AppHeader() {
  const { nickname, role } = useAuth();
  const img = role === "her" ? "/her-pic.png" : "/him-pic.png";
  const accent = role === "her" ? "var(--kawaii-her)" : "var(--kawaii-him)";
  const en = role === "her" ? "La Princesse" : "Le Prince";

  return (
    <header
      className="sticky top-0 z-30 px-4 sm:px-6 pt-4 pb-3"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.24 0.07 295 / 0.85) 0%, oklch(0.24 0.07 295 / 0.6) 70%, transparent 100%)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div
            className="relative shrink-0"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              padding: 2,
              background: `linear-gradient(135deg, ${accent}, var(--kawaii-mid))`,
              boxShadow: `0 4px 16px ${accent}`,
            }}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white/10">
              <Image
                src={img}
                alt={role ?? "user"}
                width={120}
                height={120}
                className="w-full h-full object-cover"
                style={{ objectPosition: "top" }}
              />
            </div>
          </div>
          <div>
            <p className="font-display italic" style={{ color: accent, fontSize: 12, lineHeight: 1 }}>
              {en}
            </p>
            <p className="font-serif font-bold text-white" style={{ fontSize: 16, lineHeight: 1.2 }}>
              {nickname ?? "—"}
            </p>
          </div>
        </div>

        <div className="font-display italic tracking-[0.3em] hidden sm:block" style={{ color: "var(--kawaii-glow)", fontSize: 11, opacity: 0.6 }}>
          SWEET · FOOD · DIARY
        </div>
      </div>
    </header>
  );
}
