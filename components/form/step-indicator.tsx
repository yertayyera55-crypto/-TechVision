import { Check } from "lucide-react";

const labels = ["Поставка", "Даты", "Документы", "Отправка"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <ol aria-label="Шаги создания заявки" className="grid grid-cols-4 gap-1">
      {labels.map((label, index) => {
        const step = index + 1;
        const complete = step < current;
        const active = step === current;
        return (
          <li key={label} aria-current={active ? "step" : undefined} className="relative flex flex-col items-center text-center">
            {index > 0 && <span aria-hidden="true" className={`absolute right-1/2 top-4 -z-10 h-px w-full ${step <= current ? "bg-moss-500" : "bg-line"}`} />}
            <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition ${complete || active ? "border-moss-600 bg-moss-600 text-white" : "border-line bg-paper text-slate-400"}`}>{complete ? <Check className="h-4 w-4" /> : step}</span>
            <span className={`mt-2 hidden text-[11px] font-medium sm:block ${active ? "text-moss-700" : "text-slate-400"}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
