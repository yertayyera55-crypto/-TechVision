import { AlertCircle, AlertTriangle, CheckCircle2, CircleDot, SearchX, ShieldAlert } from "lucide-react";
import { PaymentMonitoringRiskLevel, PaymentMonitoringStatus } from "@/lib/types";

const riskMeta: Record<PaymentMonitoringRiskLevel, { label: string; className: string; icon: typeof AlertCircle }> = {
  none: { label: "Отсутствует", className: "bg-emerald-50 text-emerald-800 ring-emerald-200", icon: CheckCircle2 },
  low: { label: "Низкий риск", className: "bg-moss-50 text-moss-800 ring-moss-200", icon: CircleDot },
  medium: { label: "Средний риск", className: "bg-amber-50 text-amber-900 ring-amber-200", icon: AlertCircle },
  elevated: { label: "Повышенный риск", className: "bg-orange-50 text-orange-900 ring-orange-200", icon: AlertTriangle },
  high: { label: "Высокий риск", className: "bg-red-50 text-red-900 ring-red-200", icon: ShieldAlert },
  critical: { label: "Критический риск", className: "bg-rose-100 text-rose-950 ring-rose-300", icon: ShieldAlert },
  review: { label: "Требуется проверка", className: "bg-slate-100 text-slate-800 ring-slate-300", icon: SearchX },
};

const statusLabels: Record<PaymentMonitoringStatus, string> = {
  scheduled: "Оплата по графику",
  due_soon: "Оплата скоро",
  due_today: "Оплата сегодня",
  overdue: "Просрочено",
  grace_period: "Grace period",
  partial: "Частично оплачено",
  closed: "Сделка закрыта",
  needs_review: "Нужны данные",
};

export function RiskStatusBadge({ riskLevel }: { riskLevel: PaymentMonitoringRiskLevel }) {
  const meta = riskMeta[riskLevel];
  const Icon = meta.icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.className}`}><Icon aria-hidden="true" className="h-3.5 w-3.5" />{meta.label}</span>;
}

export function PaymentStatusText({ status }: { status: PaymentMonitoringStatus }) {
  return <span className="text-xs font-semibold text-slate-700">{statusLabels[status]}</span>;
}

export function getPaymentStatusLabel(status: PaymentMonitoringStatus) {
  return statusLabels[status];
}
