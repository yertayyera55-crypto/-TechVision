import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ApplicationProvider } from "@/lib/application-store";

export const metadata: Metadata = {
  title: { default: "Mighty Miners", template: "%s · Mighty Miners" },
  description: "Платформа ранней оплаты для локальных поставщиков",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#31542d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>
        <ApplicationProvider>{children}</ApplicationProvider>
      </body>
    </html>
  );
}
