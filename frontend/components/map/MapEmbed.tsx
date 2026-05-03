"use client";

import { useEffect, useState } from "react";

interface Props {
  query: string;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export function MapEmbed({ query }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const src = `https://www.google.com/maps/embed/v1/search?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&language=zh-TW`;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {!mounted && (
        <div className="absolute inset-0 flex items-center justify-center kawaii-bg-solid">
          <div className="font-display italic text-white/70 sparkle">載入地圖中…</div>
        </div>
      )}
      {mounted && (
        <iframe
          key={src}
          src={src}
          className="map-frame absolute inset-0 w-full h-full border-0 transition-opacity duration-500 opacity-0 data-[loaded=true]:opacity-100"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Maps"
          onLoad={(e) => {
            (e.currentTarget as HTMLIFrameElement).dataset.loaded = "true";
          }}
        />
      )}
    </div>
  );
}
