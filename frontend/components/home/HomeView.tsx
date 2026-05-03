"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import type { UserRole } from "@/types/auth";
import type { Favorite } from "@/types/favorite";

interface RoleConfig {
  name: string;
  en: string;
  img: string;
  greet: string;
  accent: string;
  accentDark: string;
  accentLight: string;
}

const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  her: {
    name: "公主",
    en: "La Princesse",
    img: "/her-pic.png",
    greet: "今天想去哪裡？",
    accent: "var(--kawaii-her)",
    accentDark: "var(--kawaii-her-dark)",
    accentLight: "var(--kawaii-glow)",
  },
  him: {
    name: "王子",
    en: "Le Prince",
    img: "/him-pic.png",
    greet: "今天有什麼安排？",
    accent: "var(--kawaii-him)",
    accentDark: "var(--kawaii-him-dark)",
    accentLight: "oklch(0.85 0.07 260)",
  },
};

export default function HomeView({ role }: { role: UserRole }) {
  const cfg = ROLE_CONFIG[role];
  const { data: favorites = [] } = useFavorites();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrollY(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const heroScale = Math.max(0.7, 1 - scrollY * 0.0008);
  const heroOpacity = Math.max(0, 1 - scrollY * 0.003);
  const heroRotate = scrollY * 0.02;

  const recent = favorites.slice(0, 8);
  const totalCount = favorites.length;
  const newThisWeek = favorites.filter((f) => {
    const days = (Date.now() - new Date(f.created_at).getTime()) / 86400000;
    return days <= 7;
  }).length;
  const categoryCount = new Set(favorites.map((f) => f.category)).size;

  const quickLinks = [
    { href: `/${role}/favorites`, en: "FAVORITES", tc: "我的收藏", desc: `${totalCount} 家口袋名單` },
    { href: `/${role}/chat`, en: "AI · CHAT", tc: "美食對話", desc: "想不到吃什麼？問問看" },
    { href: `/${role}/calendar`, en: "CALENDAR", tc: "美食日曆", desc: "這週的約會與下週的計畫" },
    ...(role === "her"
      ? [{ href: `/${role}/map`, en: "MAP", tc: "地圖探索", desc: "找附近還沒去過的店" }]
      : []),
  ];

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
      {/* HERO */}
      <section className="relative px-6" style={{ minHeight: "calc(100vh - 220px)", paddingTop: 24 }}>
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between gap-6">
          <div
            className="flex-1 max-w-md"
            style={{ opacity: heroOpacity, transform: `translateY(${scrollY * -0.3}px)` }}
          >
            <p className="font-display italic mb-4 text-glow" style={{ color: cfg.accent, fontSize: 22 }}>
              Bonjour, {cfg.en}
            </p>
            <h1
              className="font-serif font-black text-glow text-white"
              style={{ fontSize: "clamp(40px, 6vw, 84px)", lineHeight: 1.1, marginBottom: 24 }}
            >
              {cfg.greet}
            </h1>
            <p className="font-serif text-white/75" style={{ fontSize: 17, lineHeight: 1.8 }}>
              你的口袋名單裡有 <span className="font-bold" style={{ color: cfg.accentLight }}>{totalCount}</span> 家收藏，
              本週新增了 <span className="font-bold" style={{ color: cfg.accentLight }}>{newThisWeek}</span> 家。
            </p>
            <div className="flex gap-3 mt-8 flex-wrap">
              <Link href={`/${role}/chat`} className="btn-kawaii">跟 AI 聊聊</Link>
              <Link href={`/${role}/favorites`} className="btn-kawaii-ghost">看我的收藏</Link>
            </div>
          </div>

          <div className="hidden md:block flex-1 relative" style={{ height: 480 }}>
            <Image
              src={cfg.img}
              alt={role}
              width={500}
              height={620}
              priority
              className="absolute float-y"
              style={{
                right: 0,
                bottom: 0,
                height: "100%",
                width: "auto",
                transform: `scale(${heroScale}) rotate(${heroRotate}deg)`,
                filter: `drop-shadow(0 30px 60px ${cfg.accent})`,
                transformOrigin: "bottom center",
              }}
            />
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="px-6 py-12 relative" style={{ zIndex: 2 }}>
        <div className="max-w-6xl mx-auto">
          <p className="font-display italic mb-2" style={{ color: cfg.accent, fontSize: 16 }}>— 今天的小總結 —</p>
          <h2 className="font-serif font-bold mb-8 text-white" style={{ fontSize: "clamp(26px, 3vw, 40px)" }}>
            數字告訴你
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { num: totalCount, label: "口袋名單", sub: "家還想去" },
              { num: newThisWeek, label: "本週新增", sub: "正在累積中" },
              { num: categoryCount, label: "分類數", sub: "各種風格都有" },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-kawaii rounded-3xl p-6 transition-transform hover:scale-105 hover:-rotate-1 cursor-default"
              >
                <div
                  className="font-display italic font-black"
                  style={{ color: cfg.accentLight, fontSize: 80, lineHeight: 1 }}
                >
                  {s.num}
                </div>
                <p className="font-serif font-bold mt-2 text-white" style={{ fontSize: 18 }}>
                  {s.label}
                </p>
                <p className="font-serif mt-1 text-white/60" style={{ fontSize: 13 }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT CAROUSEL */}
      {recent.length > 0 && (
        <section className="py-12 relative" style={{ zIndex: 2 }}>
          <div className="max-w-6xl mx-auto px-6 mb-6 flex items-end justify-between">
            <div>
              <p className="font-display italic" style={{ color: cfg.accent, fontSize: 16 }}>— Recently Saved —</p>
              <h2 className="font-serif font-bold mt-1 text-white" style={{ fontSize: "clamp(26px, 3vw, 40px)" }}>
                最近收藏
              </h2>
            </div>
            <Link href={`/${role}/favorites`} className="font-serif font-bold opacity-60 hover:opacity-100" style={{ color: cfg.accentLight }}>
              查看全部 →
            </Link>
          </div>
          <div
            className="flex gap-4 overflow-x-auto px-6 pb-6"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
          >
            {recent.map((f, i) => (
              <RecentCard key={f.id} fav={f} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* QUICK ACTIONS */}
      <section className="px-6 py-12 pb-24 relative" style={{ zIndex: 2 }}>
        <div className="max-w-6xl mx-auto">
          <p className="font-display italic mb-2" style={{ color: cfg.accent, fontSize: 16 }}>— Jump to —</p>
          <h2 className="font-serif font-bold mb-8 text-white" style={{ fontSize: "clamp(26px, 3vw, 40px)" }}>
            繼續探索
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {quickLinks.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="glass-kawaii rounded-3xl p-6 transition-all hover:scale-[1.02] hover:-translate-y-1 group block"
              >
                <p
                  className="font-display tracking-[0.3em] text-xs mb-2"
                  style={{ color: cfg.accentLight }}
                >
                  {a.en}
                </p>
                <h3 className="font-serif font-bold mb-1 text-white" style={{ fontSize: 24 }}>
                  {a.tc}
                </h3>
                <p className="font-serif text-white/60" style={{ fontSize: 14 }}>
                  {a.desc}
                </p>
                <div
                  className="mt-4 font-display italic transition-transform group-hover:translate-x-2"
                  style={{ color: cfg.accent, fontSize: 16 }}
                >
                  Open →
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center pt-12 font-display italic text-white/30">
            — Sweet Food Diary · {cfg.en} —
          </div>
        </div>
      </section>
    </div>
  );
}

function RecentCard({ fav, index }: { fav: Favorite; index: number }) {
  const gradients = [
    "linear-gradient(135deg, var(--kawaii-her), var(--kawaii-mid))",
    "linear-gradient(135deg, var(--kawaii-pink), var(--kawaii-her))",
    "linear-gradient(135deg, var(--kawaii-mid), var(--kawaii-deep))",
    "linear-gradient(135deg, var(--kawaii-him), var(--kawaii-mid))",
  ];
  return (
    <div
      className="flex-shrink-0 transition-transform hover:scale-105 hover:-translate-y-2"
      style={{ width: 240, scrollSnapAlign: "start" }}
    >
      <div
        className="rounded-3xl overflow-hidden"
        style={{ background: gradients[index % gradients.length], height: 180 }}
      >
        <div className="h-full flex items-end p-5">
          <div>
            <p className="font-serif font-bold text-shadow-soft text-white" style={{ fontSize: 18, lineHeight: 1.2 }}>
              {fav.restaurant_name}
            </p>
            <p className="font-serif text-white/80 mt-1" style={{ fontSize: 12 }}>
              {fav.address.split(" ")[0] || fav.category}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-2 flex gap-1.5 flex-wrap">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/15 text-white">{fav.category}</span>
        {fav.category_tags?.slice(0, 1).map((t) => (
          <span key={t} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-white/70">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
