import { BellRing } from "lucide-react";
import { formatDateTime } from "@/lib/format";

export function ReminderHistory({ count, lastReminderAt }: { count: number; lastReminderAt?: string }) {
  return <div className="flex items-start gap-3 border-l-2 border-line pl-4 text-xs leading-5 text-slate-500"><BellRing className="mt-0.5 h-4 w-4 shrink-0" /><div><p><strong className="text-ink">Отправлено напоминаний: {count}</strong></p><p>Последнее: {formatDateTime(lastReminderAt)}</p><p className="mt-1 text-slate-400">Демонстрационное уведомление — SMS и email не отправляются.</p></div></div>;
}
