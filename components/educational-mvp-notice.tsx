import { GraduationCap } from "lucide-react";

export function EducationalMvpNotice({ compact = false }: { compact?: boolean }) {
  return <aside aria-label="Статус учебного MVP" className={compact ? "mt-5 border-l-2 border-moss-400 pl-3" : "mb-7 flex items-start gap-3 border border-moss-200 bg-moss-50/70 px-4 py-3.5 sm:rounded-lg"}>
    {!compact && <GraduationCap aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-moss-700" />}
    <div className="min-w-0"><span className="inline-flex rounded-md bg-moss-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">Учебный MVP</span><p className="mt-1.5 text-xs leading-5 text-slate-600">FlowFactor — вымышленная факторинговая компания для демонстрации проекта. Сервис не оказывает финансовые услуги, не переводит деньги и не гарантирует финансирование.</p></div>
  </aside>;
}
