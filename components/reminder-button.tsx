"use client";

import { BellRing } from "lucide-react";
import { useState } from "react";
import { SecondaryButton } from "@/components/ui/buttons";
import { PaymentMonitoringDeal } from "@/lib/types";

export function ReminderButton({ deal, onRemind, compact = false }: { deal: PaymentMonitoringDeal; onRemind: (deal: PaymentMonitoringDeal) => Promise<void>; compact?: boolean }) {
  const [loading, setLoading] = useState(false);
  const remind = async () => {
    try {
      setLoading(true);
      await onRemind(deal);
      window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Демонстрационное напоминание отправлено покупателю" }));
    } catch (error) {
      console.error("Не удалось сохранить напоминание:", error);
      window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Не удалось сохранить изменения. Попробуйте ещё раз" }));
    } finally {
      setLoading(false);
    }
  };
  return <SecondaryButton type="button" loading={loading} disabled={deal.paymentStatus === "closed"} onClick={remind} className={compact ? "min-h-9 px-3 text-xs" : ""}><BellRing className="h-4 w-4" /> {compact ? "Напомнить" : "Отправить напоминание"}</SecondaryButton>;
}
