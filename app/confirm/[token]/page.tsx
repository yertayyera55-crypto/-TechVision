import { ConfirmationPage } from "@/components/confirmation-page";

export default async function ConfirmPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ConfirmationPage token={token} />;
}
