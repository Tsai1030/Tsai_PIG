"use client";

import { FormEvent, useState } from "react";
import { SearchIcon } from "lucide-react";

interface Props {
  onSearch: (query: string) => void;
  defaultValue?: string;
}

export function SearchBar({ onSearch, defaultValue = "" }: Props) {
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="glass-kawaii-strong rounded-full pl-4 pr-2 py-2 flex-1 flex items-center gap-2">
        <SearchIcon className="size-4 shrink-0" style={{ color: "var(--kawaii-deep)" }} />
        <input
          className="flex-1 bg-transparent outline-none font-serif placeholder:text-[var(--kawaii-deep)]/50 min-w-0"
          style={{ color: "var(--kawaii-deep)", fontSize: 15 }}
          placeholder="搜尋餐廳、地址…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="btn-kawaii shrink-0"
          style={{ padding: "8px 14px", fontSize: 13 }}
        >
          <span className="hidden sm:inline">搜尋</span>
          <SearchIcon className="size-4 sm:hidden" />
        </button>
      </div>
    </form>
  );
}
