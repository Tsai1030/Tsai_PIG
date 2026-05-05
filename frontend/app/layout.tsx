import type { Metadata, Viewport } from "next";
import { Mochiy_Pop_One, Noto_Serif_TC, Playfair_Display, Quicksand } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/components/providers";
import ServiceWorkerRegister from "@/components/sw-register";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});

const notoTc = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--font-noto-tc",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-quicksand",
});

const mochiy = Mochiy_Pop_One({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-mochiy",
});

export const metadata: Metadata = {
  title: "甜蜜食記 Sweet Food Diary",
  description: "美食紀錄與收藏 App，支援行事曆與對話助理。",
  applicationName: "甜蜜食記",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "甜蜜食記",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#bca2e6" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1235" },
  ],
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
        playfair.variable,
        notoTc.variable,
        quicksand.variable,
        mochiy.variable,
      )}
    >
      <body className="h-full flex flex-col font-sans overflow-hidden">
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
