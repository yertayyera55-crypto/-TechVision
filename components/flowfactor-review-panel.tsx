import { FileCheck2, ShieldCheck } from "lucide-react";

export function FlowFactorReviewPanel() {
  return <section aria-labelledby="flowfactor-review-heading" className="border-y border-moss-200 bg-moss-50/70 px-4 py-6 sm:rounded-lg sm:border sm:p-6">
    <div className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-moss-700 ring-1 ring-moss-200"><FileCheck2 className="h-5 w-5" /></span>
      <div>
        <p className="eyebrow mb-1">Проверка заявки</p>
        <h2 id="flowfactor-review-heading" className="text-xl font-semibold text-ink">Внутренняя проверка FlowFactor</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Договора достаточно для предварительного предложения. FlowFactor проверяет данные внутри своего процесса; поставщику не нужно запрашивать подтверждение у покупателя.</p>
      </div>
    </div>
    <p className="mt-5 flex items-start gap-2 border-l-2 border-moss-500 pl-3 text-xs leading-5 text-slate-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-moss-700" />Если в реальном процессе потребуется дополнительная проверка, её инициирует FlowFactor по своей процедуре. В демо-заявке покупатель не получает ссылок и уведомлений.</p>
  </section>;
}
