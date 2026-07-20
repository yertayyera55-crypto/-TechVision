import { Check, Circle } from "lucide-react";
import { ApplicationStatus } from "@/lib/types";

const timeline = [
  { title: "Заявка создана", note: "Данные поставки сохранены" },
  { title: "Документы загружены", note: "Комплект документов сформирован" },
  { title: "Ожидается подтверждение сети", note: "Одноразовая ссылка отправлена" },
  { title: "Готовность сделки", note: "Документы и условия договора проверены" },
  { title: "Расчёт выгоды", note: "Экономика факторинга сохранена" },
  { title: "Подписание", note: "Выбран тип факторинга и поставлена demo-ЭЦП" },
  { title: "Передано партнёру", note: "Данные отправлены с согласия поставщика" },
  { title: "Мониторинг оплаты", note: "Контроль срока оплаты и регрессного риска" },
];

const currentIndex: Record<ApplicationStatus, number> = {
  draft: 0,
  awaiting_confirmation: 2,
  clarification_required: 2,
  delivery_confirmed: 3,
  document_review: 3,
  additional_data: 3,
  ready_for_calculation: 4,
  precheck_passed: 4,
  ready_for_signing: 5,
  transferred: 6,
  financing_received: 7,
  awaiting_buyer_payment: 7,
  partially_paid: 7,
  payment_overdue: 7,
  recourse_approaching: 7,
  closed: 7,
  paid: 7,
  rejected: 7,
};

export function ApplicationTimeline({ status }: { status: ApplicationStatus }) {
  const current = currentIndex[status];
  return (
    <ol aria-label="Этапы заявки" className="relative">
      {timeline.map((item, index) => {
        const complete = index < current || status === "paid" || status === "closed";
        const active = index === current;
        return (
          <li key={item.title} className="relative grid grid-cols-[32px_1fr] gap-4 pb-7 last:pb-0">
            {index < timeline.length - 1 && <span aria-hidden="true" className={`absolute left-[15px] top-7 h-[calc(100%-8px)] w-px ${complete ? "bg-moss-500" : "bg-line"}`} />}
            <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${complete ? "border-moss-600 bg-moss-600 text-white" : active ? "border-moss-600 bg-paper text-moss-700 ring-4 ring-moss-50" : "border-line bg-paper text-slate-300"}`}>
              {complete ? <Check className="h-4 w-4" /> : <Circle className={`h-2.5 w-2.5 ${active ? "fill-current" : ""}`} />}
            </span>
            <div className="pt-0.5">
              <div className="flex flex-wrap items-center gap-2"><p className={`text-sm font-semibold ${active ? "text-moss-800" : complete ? "text-ink" : "text-slate-400"}`}>{item.title}</p>{active && <span className="rounded bg-moss-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-moss-700">Текущий этап</span>}</div>
              <p className={`mt-1 text-xs ${active || complete ? "text-slate-500" : "text-slate-300"}`}>{item.note}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
