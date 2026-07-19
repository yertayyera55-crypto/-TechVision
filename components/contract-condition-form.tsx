"use client";

import { AlertTriangle } from "lucide-react";
import { Application, ContractAnswer, ContractConditions } from "@/lib/types";

const questions: Array<{ key: keyof ContractConditions; label: string; riskyYes?: boolean }> = [
  { key: "hasPaymentDelay", label: "Есть ли в договоре отсрочка платежа?" },
  { key: "paymentTermSpecified", label: "Указан ли срок оплаты?" },
  { key: "assignmentRestriction", label: "Есть ли запрет или ограничение уступки требования?", riskyYes: true },
  { key: "buyerConsentRequired", label: "Требуется ли согласие покупателя?" },
  { key: "offsetsAllowed", label: "Может ли покупатель удерживать штрафы, возвраты или встречные требования?" },
  { key: "acceptanceMethodSpecified", label: "Указано ли, как подтверждается приёмка товара?" },
];

const answers: Array<{ value: ContractAnswer; label: string }> = [{ value: "yes", label: "Да" }, { value: "no", label: "Нет" }, { value: "unsure", label: "Не уверен" }];

export function ContractConditionForm({ application, onChange }: { application: Application; onChange: (conditions: ContractConditions) => void }) {
  const restriction = application.contractConditions.assignmentRestriction === "yes";
  return <section aria-labelledby="contract-heading" className="border-y border-line bg-paper px-4 py-6 sm:rounded-lg sm:border sm:p-6"><p className="eyebrow mb-1">Ручная проверка · без AI</p><h2 id="contract-heading" className="text-xl font-semibold">Условия договора</h2><p className="mt-2 text-sm leading-6 text-slate-500">Ответьте по тексту договора. Если сомневаетесь, выберите «Не уверен».</p><div className="mt-6 divide-y divide-line border-y border-line">{questions.map((question) => <fieldset key={question.key} className="py-4"><legend className="text-sm font-semibold leading-5 text-ink">{question.label}</legend><div className="mt-3 flex flex-wrap gap-2">{answers.map((answer) => <label key={answer.value} className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold transition ${application.contractConditions[question.key] === answer.value ? "border-moss-600 bg-moss-50 text-moss-800" : "border-line bg-paper text-slate-600 hover:border-moss-200"}`}><input type="radio" className="sr-only" name={question.key} value={answer.value} checked={application.contractConditions[question.key] === answer.value} onChange={() => onChange({ ...application.contractConditions, [question.key]: answer.value })} />{answer.label}</label>)}</div></fieldset>)}</div>{restriction && <div role="alert" className="mt-5 flex items-start gap-3 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><span><strong className="block">Требуется юридическая проверка</strong>Ограничение в договоре может создать риск нарушения отношений с покупателем. Это не означает автоматический отказ в факторинге.</span></div>}</section>;
}
