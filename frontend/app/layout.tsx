import type { Metadata, Viewport } from "next";
import { Montserrat, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/components/providers";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "甜食日記 Sweet Food Diary",
  description: "美食紀錄與收藏 App，支援行事曆與對話助理。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={cn(
        "h-full",
        "antialiased",
        montserrat.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
