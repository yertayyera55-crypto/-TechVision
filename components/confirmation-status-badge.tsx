import { ConfirmationStatus } from "@/lib/types";

const states: Record<ConfirmationStatus, { label: string; className: string }> = {
  not_sent: { label: "Запрос не отправлен", className: "bg-slate-100 text-slate-700 ring-slate-200" },
  waiting: { label: "Ожидается подтверждение", className: "bg-amber-100 text-amber-900 ring-amber-200" },
  reminder_sent: { label: "Напоминание отправлено", className: "bg-amber-100 text-amber-900 ring-amber-200" },
  confirmed: { label: "Поставка подтверждена", className: "bg-emerald-100 text-emerald-900 ring-emerald-200" },
  mismatch: { label: "Данные не совпадают", className: "bg-red-100 text-red-900 ring-red-200" },
  not_received: { label: "Товар не получен", className: "bg-red-100 text-red-900 ring-red-200" },
};

export function ConfirmationStatusBadge({ status }: { status: ConfirmationStatus }) {
  const state = states[status];
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${state.className}`}>{state.label}</span>;
}
