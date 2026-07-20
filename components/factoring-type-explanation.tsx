"use client";

import { FileSignature, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { DemoIntegrationNotice } from "@/components/demo-integration-notice";
import { PrimaryButton } from "@/components/ui/buttons";
import { Application, FactoringType } from "@/lib/types";

const types: Array<{ value: FactoringType; title: string; text: string }> = [
  { value: "recourse", title: "С регрессом", text: "Если покупатель не оплатит долг в срок и льготный период, партнёр может потребовать возврат финансирования от поставщика." },
  { value: "non_recourse", title: "Без регресса", text: "Риск неплатёжеспособности принимает партнёр. Продукт может стоить дороже и доступен не для всех сделок." },
  { value: "partner_decides", title: "Тип определит финансовый партнёр", text: "Финальная структура сделки будет согласована после рассмотрения пакета." },
];

export function FactoringTypeExplanation({ application, onUpdate, onTransfer }: { application: Application; onUpdate: (update: Partial<Application>) => void; onTransfer: () => void }) {
  const selected = application.selectedFactoringType ?? "recourse";
  const [signing, setSigning] = useState(false);
  const canSign = Boolean(application.profitability) && (selected !== "recourse" || application.recourseConsent);
  const sign = async () => {
    setSigning(true);
    await new Promise((resolve) => setTimeout(resolve, 750));
    onUpdate({ signedAt: new Date().toISOString(), status: "ready_for_signing" });
    setSigning(false);
    window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Документы подписаны через demo-ЭЦП" }));
  };
  return <section aria-labelledby="factoring-type-heading" className="border-y border-line bg-paper px-4 py-6 sm:rounded-lg sm:border sm:p-6"><p className="eyebrow mb-1">Перед подписанием</p><h2 id="factoring-type-heading" className="text-xl font-semibold">Тип факторинга и ответственность</h2><div className="mt-5 grid gap-3">{types.map((type) => <label key={type.value} className={`cursor-pointer border p-4 transition ${selected === type.value ? "border-moss-500 bg-moss-50" : "border-line hover:border-moss-200"}`}><div className="flex items-start gap-3"><input type="radio" name="factoringType" value={type.value} checked={selected === type.value} onChange={() => onUpdate({ selectedFactoringType: type.value, recourseConsent: type.value === "recourse" ? false : application.recourseConsent, factoringOffer: application.factoringOffer ? { ...application.factoringOffer, factoringType: type.value } : undefined })} className="mt-1 accent-moss-700" /><span><strong className="block text-sm text-ink">{type.title}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{type.text}</span></span></div></label>)}</div>{selected === "recourse" && <label className="mt-5 flex cursor-pointer items-start gap-3 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><input type="checkbox" checked={Boolean(application.recourseConsent)} onChange={(event) => onUpdate({ recourseConsent: event.target.checked })} className="mt-1 h-4 w-4 accent-moss-700" /><span>Я понимаю, что при факторинге с регрессом мне может потребоваться вернуть полученное финансирование.</span></label>}<div className="mt-5"><DemoIntegrationNotice>Интеграция с ЭЦП не подключена. Подписание ниже является демонстрационным.</DemoIntegrationNotice></div><div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">{application.signedAt ? <div className="mr-auto flex items-center gap-2 text-sm font-semibold text-moss-700"><ShieldCheck className="h-5 w-5" /> Demo-подпись добавлена</div> : <PrimaryButton type="button" disabled={!canSign} loading={signing} onClick={sign}><FileSignature className="h-4 w-4" /> Подписать через demo-ЭЦП</PrimaryButton>}{application.signedAt && <PrimaryButton type="button" onClick={onTransfer}>Передать заявку партнёру</PrimaryButton>}</div></section>;
}
