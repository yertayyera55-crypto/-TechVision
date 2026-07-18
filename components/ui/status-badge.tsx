import { ApplicationStatus } from "@/lib/types";

const statuses: Record<ApplicationStatus, { label: string; className: string }> = {
  awaiting_confirmation: { label: "Ожидает подтверждения", className: "bg-amber-100 text-amber-900 ring-amber-200" },
  precheck_passed: { label: "Проверка пройдена", className: "bg-lime-100 text-lime-900 ring-lime-200" },
  transferred: { label: "Передано партнёру", className: "bg-blue-100 text-blue-900 ring-blue-200" },
  paid: { label: "Оплачено", className: "bg-emerald-100 text-emerald-900 ring-emerald-200" },
  rejected: { label: "Отклонено", className: "bg-red-100 text-red-900 ring-red-200" },
  draft: { label: "Черновик", className: "bg-slate-100 text-slate-700 ring-slate-200" },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const item = statuses[status];
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${item.className}`}>{item.label}</span>;
}
