import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ApplicationProvider } from "@/lib/application-store";
import { PaymentMonitoringProvider } from "@/lib/payment-monitoring-store";

export const metadata: Metadata = {
  title: { default: "Marti", template: "%s · Marti" },
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
        <ApplicationProvider>
          <PaymentMonitoringProvider>{children}</PaymentMonitoringProvider>
        </ApplicationProvider>
      </body>
    </html>
  );
}
