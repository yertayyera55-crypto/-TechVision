import { ApplicationStatus } from "@/lib/types";

const statuses: Record<ApplicationStatus, { label: string; className: string }> = {
  awaiting_confirmation: { label: "Ожидает подтверждения", className: "bg-amber-100 text-amber-900 ring-amber-200" },
  clarification_required: { label: "Нужно уточнение", className: "bg-orange-100 text-orange-900 ring-orange-200" },
  delivery_confirmed: { label: "Поставка подтверждена", className: "bg-emerald-100 text-emerald-900 ring-emerald-200" },
  document_review: { label: "Проверка документов", className: "bg-sky-100 text-sky-900 ring-sky-200" },
  additional_data: { label: "Нужны данные", className: "bg-amber-100 text-amber-900 ring-amber-200" },
  ready_for_calculation: { label: "Готово к расчёту", className: "bg-lime-100 text-lime-900 ring-lime-200" },
  ready_for_signing: { label: "Готово к подписанию", className: "bg-lime-100 text-lime-900 ring-lime-200" },
  precheck_passed: { label: "Проверка пройдена", className: "bg-lime-100 text-lime-900 ring-lime-200" },
  transferred: { label: "Передано партнёру", className: "bg-blue-100 text-blue-900 ring-blue-200" },
  financing_received: { label: "Финансирование получено", className: "bg-indigo-100 text-indigo-900 ring-indigo-200" },
  awaiting_buyer_payment: { label: "Ожидается оплата покупателя", className: "bg-sky-100 text-sky-900 ring-sky-200" },
  partially_paid: { label: "Частично оплачено", className: "bg-amber-100 text-amber-900 ring-amber-200" },
  payment_overdue: { label: "Оплата просрочена", className: "bg-red-100 text-red-900 ring-red-200" },
  recourse_approaching: { label: "Приближается регресс", className: "bg-rose-100 text-rose-900 ring-rose-200" },
  closed: { label: "Сделка закрыта", className: "bg-emerald-100 text-emerald-900 ring-emerald-200" },
  paid: { label: "Оплачено", className: "bg-emerald-100 text-emerald-900 ring-emerald-200" },
  rejected: { label: "Отклонено", className: "bg-red-100 text-red-900 ring-red-200" },
  draft: { label: "Черновик", className: "bg-slate-100 text-slate-700 ring-slate-200" },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const item = statuses[status];
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${item.className}`}>{item.label}</span>;
}
