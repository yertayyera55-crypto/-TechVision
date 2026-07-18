import { AppShell } from "@/components/app-shell";
import { ApplicationDetail } from "@/components/application-detail";

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell><ApplicationDetail id={id} /></AppShell>;
}
