"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useReveal } from "@/hooks/useReveal";

export default function LandingPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading, role } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  const titleRef = useReveal<HTMLDivElement>();
  const storyRef = useReveal<HTMLDivElement>();
  const featRef1 = useReveal<HTMLDivElement>();
  const featRef2 = useReveal<HTMLDivElement>();
  const featRef3 = useReveal<HTMLDivElement>();
  const ctaRef = useReveal<HTMLDivElement>();

  useEffect(() => {
    if (!isLoading && isLoggedIn && role) {
      router.replace(`/${role}`);
    }
  }, [isLoading, isLoggedIn, role, router]);

  if (isLoggedIn) return null;

  return (
    <div className="relative w-full flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden"
        style={{ background: "oklch(0.16 0.02 30)", scrollBehavior: "smooth" }}
      >
        {/* HERO */}
        <section className="relative" style={{ height: "100vh", minHeight: 720 }}>
          <div
            className="paris-bg"
          />
          <div className="paris-grain" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6" style={{ zIndex: 2 }}>
            <div ref={titleRef} className="reveal-scale">
              <p
                className="font-display tracking-[0.5em] mb-6"
                style={{ color: "var(--paris-gold)", fontSize: 14, letterSpacing: "0.5em" }}
              >
                EST · 2026 · PARIS
              </p>
              <h1
                className="font-display text-shadow-soft m-0 italic"
                style={{
                  color: "var(--paris-cream)",
                  fontSize: "clamp(64px, 11vw, 160px)",
                  lineHeight: 0.95,
                  fontWeight: 400,
                }}
              >
                甜蜜
                <br />
                食記
              </h1>
              <div className="flex items-center justify-center gap-4 mt-8">
                <span style={{ height: 1, width: 60, background: "var(--paris-gold)" }} />
                <p
                  className="font-display tracking-widest"
                  style={{ color: "var(--paris-cream)", fontSize: 18, letterSpacing: "0.3em" }}
                >
                  Sweet Food Diary
                </p>
                <span style={{ height: 1, width: 60, background: "var(--paris-gold)" }} />
              </div>
            </div>

            <div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 sparkle"
              style={{ color: "var(--paris-cream)", opacity: 0.7 }}
            >
              <p className="font-display tracking-[0.4em] text-xs">SCROLL</p>
              <div style={{ width: 1, height: 40, background: "var(--paris-cream)" }} />
            </div>
          </div>
        </section>

        {/* STORY */}
        <section
          className="relative px-8 py-32"
          style={{ background: "linear-gradient(180deg, oklch(0.16 0.02 30) 0%, var(--paris-ink) 100%)" }}
        >
          <div className="max-w-5xl mx-auto">
            <div ref={storyRef} className="reveal text-center mb-20">
              <p className="font-display italic mb-4" style={{ color: "var(--paris-gold)", fontSize: 20 }}>
                — Chapter One —
              </p>
              <h2
                className="font-serif font-bold mb-6"
                style={{ color: "var(--paris-cream)", fontSize: "clamp(36px, 5vw, 64px)" }}
              >
                兩個人的食譜
              </h2>
              <p
                className="font-serif mx-auto"
                style={{ color: "oklch(0.93 0.04 70 / 0.7)", fontSize: 18, lineHeight: 1.9, maxWidth: 600 }}
              >
                從清晨的可頌到深夜的甜湯，每一次一起坐下吃飯，
                <br />
                都是寫在這座城市裡的小章節。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mt-24">
              <div className="reveal-left in">
                <div className="text-5xl font-display italic mb-4" style={{ color: "var(--paris-gold)" }}>
                  她
                </div>
                <h3 className="font-serif font-bold mb-4" style={{ color: "var(--paris-cream)", fontSize: 32 }}>
                  規劃者
                </h3>
                <p className="font-serif" style={{ color: "oklch(0.93 0.04 70 / 0.65)", fontSize: 16, lineHeight: 1.8 }}>
                  尋找新店、收藏夢想清單、安排約會。她讓每一週都有期待。
                </p>
                <div className="flex gap-4 mt-8 text-sm font-display tracking-wider" style={{ color: "var(--paris-rose)" }}>
                  <span>CALENDAR</span>
                  <span>·</span>
                  <span>FAVORITES</span>
                  <span>·</span>
                  <span>MAP</span>
                </div>
              </div>
              <div className="reveal-right in">
                <div className="text-5xl font-display italic mb-4" style={{ color: "var(--paris-gold)" }}>
                  他
                </div>
                <h3 className="font-serif font-bold mb-4" style={{ color: "var(--paris-cream)", fontSize: 32 }}>
                  執行者
                </h3>
                <p className="font-serif" style={{ color: "oklch(0.93 0.04 70 / 0.65)", fontSize: 16, lineHeight: 1.8 }}>
                  收到提醒、確認時間、出發。他把每一份計畫變成現場的擁抱。
                </p>
                <div className="flex gap-4 mt-8 text-sm font-display tracking-wider" style={{ color: "var(--paris-rose)" }}>
                  <span>NOTIFY</span>
                  <span>·</span>
                  <span>EXECUTE</span>
                  <span>·</span>
                  <span>CHAT</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="relative px-8 py-32" style={{ background: "var(--paris-ink)" }}>
          <div className="max-w-4xl mx-auto">
            <p className="font-display italic text-center mb-4" style={{ color: "var(--paris-gold)", fontSize: 20 }}>
              — Chapter Two —
            </p>
            <h2
              className="font-serif font-bold text-center mb-20"
              style={{ color: "var(--paris-cream)", fontSize: "clamp(32px, 4vw, 56px)" }}
            >
              一起記錄的方式
            </h2>

            <div className="space-y-32">
              {[
                {
                  ref: featRef1,
                  num: "01",
                  en: "CALENDAR",
                  tc: "行事曆同步",
                  desc: "她在日曆裡標記下週的法式午茶，他打開就看見了。共享、不打擾，就像放在客廳桌上的便條紙。",
                  dir: "left" as const,
                },
                {
                  ref: featRef2,
                  num: "02",
                  en: "FAVORITES",
                  tc: "心動口袋名單",
                  desc: "看到喜歡的店一鍵收藏，加上心情標籤。「下雨天想去的咖啡」「適合慶生的法餐」，找回憶不再翻聊天紀錄。",
                  dir: "right" as const,
                },
                {
                  ref: featRef3,
                  num: "03",
                  en: "AI · CHAT",
                  tc: "對話式靈感",
                  desc: "不知道吃什麼？問問你們的 AI 美食家。它知道你的收藏、你的口味、你上週去過哪。",
                  dir: "left" as const,
                },
              ].map((f) => (
                <div key={f.num} ref={f.ref} className={f.dir === "left" ? "reveal-left" : "reveal-right"}>
                  <div className="flex items-start gap-8 md:gap-12">
                    <div
                      className="font-display italic"
                      style={{ color: "var(--paris-gold)", fontSize: 80, lineHeight: 1, opacity: 0.4 }}
                    >
                      {f.num}
                    </div>
                    <div className="flex-1">
                      <p
                        className="font-display tracking-[0.3em] text-sm mb-2"
                        style={{ color: "var(--paris-rose)" }}
                      >
                        {f.en}
                      </p>
                      <h3 className="font-serif font-bold mb-4" style={{ color: "var(--paris-cream)", fontSize: 32 }}>
                        {f.tc}
                      </h3>
                      <p
                        className="font-serif"
                        style={{
                          color: "oklch(0.93 0.04 70 / 0.7)",
                          fontSize: 17,
                          lineHeight: 1.9,
                          maxWidth: 520,
                        }}
                      >
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="relative px-8 py-32 text-center"
          style={{ background: "linear-gradient(180deg, var(--paris-ink) 0%, oklch(0.16 0.02 30) 100%)" }}
        >
          <div ref={ctaRef} className="reveal-scale max-w-3xl mx-auto">
            <p className="font-display italic mb-6" style={{ color: "var(--paris-gold)", fontSize: 24 }}>
              The story begins...
            </p>
            <h2
              className="font-serif font-bold mb-12"
              style={{ color: "var(--paris-cream)", fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.2 }}
            >
              準備好
              <br />
              一起寫下今天了嗎
            </h2>
            <button className="btn-paris" onClick={() => router.push("/login")}>
              進入我們的世界
            </button>
            <p
              className="mt-8 font-display tracking-[0.3em] text-xs"
              style={{ color: "oklch(0.93 0.04 70 / 0.4)" }}
            >
              CHAPTER · 003 · BEGIN
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
