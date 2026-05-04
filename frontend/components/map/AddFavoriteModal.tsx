"use client";

import { useEffect, useState } from "react";
import { HeartIcon, XIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAddFavorite } from "@/hooks/useFavorites";

interface Props {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface Form {
  restaurant_name: string;
  address: string;
  maps_url: string;
}

const EMPTY: Form = { restaurant_name: "", address: "", maps_url: "" };
const inputClass =
  "w-full px-4 py-3 rounded-2xl bg-white/10 text-white border border-white/20 outline-none focus:border-white/50 transition placeholder:text-white/35";

export function AddFavoriteModal({ open, onClose, initialQuery = "" }: Props) {
  const add = useAddFavorite();
  const [form, setForm] = useState<Form>({ ...EMPTY, restaurant_name: initialQuery });

  useEffect(() => {
    if (open) setForm({ ...EMPTY, restaurant_name: initialQuery });
  }, [open, initialQuery]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSave() {
    if (!form.restaurant_name.trim() || !form.address.trim()) return;
    await add.mutateAsync({
      restaurant_name: form.restaurant_name.trim(),
      address: form.address.trim(),
      maps_url: form.maps_url.trim() || undefined,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4 bubble-in"
      style={{ background: "oklch(0 0 0 / 0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg, oklch(0.34 0.10 295), oklch(0.24 0.07 295))",
          border: "1px solid oklch(1 0 0 / 0.18)",
          boxShadow: "var(--shadow-2xl)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 size-9 rounded-full glass-kawaii flex items-center justify-center text-white hover:scale-110 transition"
        >
          <XIcon className="size-4" />
        </button>

        <div className="p-7">
          <div className="flex items-center gap-2 mb-5">
            <HeartIcon className="size-5 fill-current text-[var(--kawaii-pink)]" />
            <p className="font-display italic text-[var(--kawaii-glow)]" style={{ fontSize: 14 }}>
              Add to Favorites
            </p>
          </div>
          <h2 className="font-serif font-black text-white mb-6" style={{ fontSize: 24 }}>
            收藏一家好店
          </h2>

          <div className="space-y-4">
            <label className="block">
              <p className="font-serif font-bold text-white/80 text-sm mb-1.5">餐廳名稱</p>
              <input
                placeholder="例：鼎泰豐"
                value={form.restaurant_name}
                onChange={(e) => setForm((p) => ({ ...p, restaurant_name: e.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <p className="font-serif font-bold text-white/80 text-sm mb-1.5">地址</p>
              <input
                placeholder="例：台北市信義區信義路五段 7 號"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <p className="font-serif font-bold text-white/80 text-sm mb-1.5">Google Maps 連結（選填）</p>
              <input
                placeholder="貼上分享連結…"
                value={form.maps_url}
                onChange={(e) => setForm((p) => ({ ...p, maps_url: e.target.value }))}
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={onClose} disabled={add.isPending} className="btn-kawaii-ghost flex-1">
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={add.isPending || !form.restaurant_name.trim() || !form.address.trim()}
              className="btn-kawaii flex-1 flex items-center justify-center gap-2"
            >
              {add.isPending && <Spinner className="size-4" />}
              儲存收藏
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
