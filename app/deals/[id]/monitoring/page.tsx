import { AppShell } from "@/components/app-shell";
import { DealMonitoringDashboard } from "@/components/deal-monitoring-dashboard";

export default async function DealMonitoringPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell><DealMonitoringDashboard id={id} /></AppShell>;
}
