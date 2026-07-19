import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PaymentsMonitoringDashboard } from "@/components/payments-monitoring-dashboard";

export const metadata: Metadata = { title: "Контроль оплат" };

export default function PaymentsMonitoringPage() {
  return <AppShell><PaymentsMonitoringDashboard /></AppShell>;
}
