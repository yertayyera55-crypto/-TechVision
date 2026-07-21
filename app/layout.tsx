import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ApplicationProvider } from "@/lib/application-store";
import { DemoAuthProvider } from "@/lib/demo-auth";
import { PaymentMonitoringProvider } from "@/lib/payment-monitoring-store";
import { DemoAuthGate } from "@/components/demo-auth-gate";

export const metadata: Metadata = {
  title: { default: "FlowFactor", template: "%s · FlowFactor" },
  description: "Учебный MVP вымышленной факторинговой компании для поставщиков",
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
        <DemoAuthProvider>
          <ApplicationProvider>
            <PaymentMonitoringProvider><DemoAuthGate>{children}</DemoAuthGate></PaymentMonitoringProvider>
          </ApplicationProvider>
        </DemoAuthProvider>
      </body>
    </html>
  );
}
