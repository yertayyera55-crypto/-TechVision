"use client";

import { CheckCircle2, CircleAlert, FileSearch2, LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { DEMO_CONTRACT_ANALYSIS, DEMO_CONTRACT_PDF } from "@/lib/demo-contract-pdf";
import { getDocumentFile, deleteDocumentFile, saveDocumentFile } from "@/lib/document-file-storage";
import { ApplicationDocument, ContractAnalysisResult } from "@/lib/types";

const stages = ["Загружаем документы", "Извлекаем текст", "ИИ анализирует условия договора", "Заполняем заявку"];

interface DocumentAnalysisPanelProps {
  contract?: ApplicationDocument;
  supportingDocuments: ApplicationDocument[];
  onUseDemo: (document: ApplicationDocument) => void;
  onApply: (analysis: ContractAnalysisResult) => void;
}

export function DocumentAnalysisPanel({ contract, supportingDocuments, onUseDemo, onApply }: DocumentAnalysisPanelProps) {
  const [status, setStatus] = useState<"idle" | "analyzing" | "success" | "error">("idle");
  const [stage, setStage] = useState(0);
  const [analysis, setAnalysis] = useState<ContractAnalysisResult | null>(null);
  const [message, setMessage] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const loadDemoContract = async () => {
    try {
      setStatus("analyzing");
      setMessage("");
      const file = new File([DEMO_CONTRACT_PDF], "demo-contract.pdf", { type: "application/pdf" });
      const document: ApplicationDocument = { id: `contract-demo-${Date.now()}`, type: "contract", label: "Договор", name: file.name, mimeType: file.type, size: file.size, storageKind: "indexeddb" };
      await saveDocumentFile(document.id, file);
      if (contract?.storageKind === "indexeddb") await deleteDocumentFile(contract.id);
      onUseDemo(document);
      setStage(stages.length - 1);
      setAnalysis(DEMO_CONTRACT_ANALYSIS);
      onApply(DEMO_CONTRACT_ANALYSIS);
      setMessage("Подготовленный демодоговор проанализирован детерминированным демосценарием.");
      setStatus("success");
    } catch {
      setStatus("error");
      setMessage("Не удалось сохранить демодоговор. Попробуйте загрузить PDF ещё раз.");
    }
  };

  const analyze = async () => {
    if (!contract) { setStatus("error"); setMessage("Сначала загрузите договор."); return; }
    try {
      setStatus("analyzing");
      setMessage("");
      setStage(0);
      timerRef.current = setInterval(() => setStage((current) => Math.min(current + 1, stages.length - 1)), 1_300);
      const contractFile = await getDocumentFile(contract.id);
      if (!contractFile) throw new Error("Содержимое договора не найдено. Загрузите файл заново.");
      const formData = new FormData();
      formData.append("contract", new File([contractFile.blob], contract.name, { type: contract.mimeType || "application/pdf" }));
      for (const supporting of supportingDocuments.filter((document) => document.mimeType === "application/pdf")) {
        const stored = await getDocumentFile(supporting.id);
        if (stored) formData.append("supportingDocuments", new File([stored.blob], supporting.name, { type: "application/pdf" }));
      }
      const response = await fetch("/api/analyze-contract", { method: "POST", body: formData });
      const payload = await response.json() as { analysis?: ContractAnalysisResult; error?: { message?: string } };
      if (!response.ok || !payload.analysis) throw new Error(payload.error?.message || "Анализ не удался.");
      setAnalysis(payload.analysis);
      onApply(payload.analysis);
      setStage(stages.length - 1);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Не удалось анализировать документ.");
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return <section aria-labelledby="document-analysis-heading" className="border border-moss-200 bg-moss-50/55 p-4 sm:p-5">
    <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-moss-700 ring-1 ring-moss-200"><FileSearch2 className="h-5 w-5" /></span><div><p className="eyebrow mb-1 !text-moss-700">Codex CLI · local analysis</p><h3 id="document-analysis-heading" className="text-base font-semibold text-ink">Автозаполнение по договору</h3><p className="mt-1 text-xs leading-5 text-slate-600">Анализ запускает авторизованный Codex CLI на этом компьюте. В MVP не нужен OPENAI_API_KEY.</p></div></div>
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center"><PrimaryButton type="button" disabled={status === "analyzing" || !contract} loading={status === "analyzing"} onClick={() => void analyze()}><Sparkles className="h-4 w-4" /> Проанализировать документы</PrimaryButton><SecondaryButton type="button" disabled={status === "analyzing"} onClick={() => void loadDemoContract()}>Запустить готовое демо</SecondaryButton></div>
    {status === "analyzing" && <div className="mt-4 border-t border-moss-200 pt-4" aria-live="polite"><ol className="grid gap-2 sm:grid-cols-4">{stages.map((item, index) => <li key={item} className={`flex items-center gap-2 text-xs ${index <= stage ? "font-semibold text-moss-800" : "text-slate-400"}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${index < stage ? "bg-moss-600 text-white" : index === stage ? "bg-moss-100 text-moss-800 ring-1 ring-moss-300" : "bg-white text-slate-400 ring-1 ring-line"}`}>{index < stage ? <CheckCircle2 className="h-3.5 w-3.5" /> : index === stage ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : index + 1}</span>{item}</li>)}</ol></div>}
    {status === "success" && analysis && <div className="mt-4 border-t border-moss-200 pt-4" aria-live="polite"><p className="flex items-center gap-2 text-sm font-semibold text-moss-800"><CheckCircle2 className="h-4 w-4" /> Анализ завершён. Поля заявки обновлены.</p><AnalysisSummary analysis={analysis} /></div>}
    {status === "error" && <p role="alert" className="mt-4 flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-3 text-xs leading-5 text-red-800"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{message}</p>}
    {status === "idle" && message && <p className="mt-3 text-xs text-moss-800">{message}</p>}
  </section>;
}

function AnalysisSummary({ analysis }: { analysis: ContractAnalysisResult }) {
  const rows = [["Покупатель", analysis.network || analysis.buyerName || "Не найден"], ["Сумма", analysis.amount ? `${new Intl.NumberFormat("ru-RU").format(analysis.amount)} ₸` : "Не найдена"], ["Срок оплаты", analysis.paymentDueDate || (analysis.paymentTermDays ? `${analysis.paymentTermDays} дней` : "Не найден")], ["Номер договора", analysis.contractNumber || "Не найден"], ["Предмет поставки", analysis.supplySubject || "Не найден"], ["Условия оплаты", analysis.paymentTerms || "Не найдены"]];
  return <><dl className="mt-3 grid gap-2 sm:grid-cols-3">{rows.map(([label, value]) => <div key={label} className="bg-white/70 px-3 py-2"><dt className="text-[10px] uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 text-xs font-semibold text-ink">{value}</dd></div>)}</dl>{!analysis.factoringReady && <p className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950"><strong>AI не может подтвердить готовность:</strong> заполните недостающие поля вручную.</p>}{analysis.missingData.length > 0 && <p className="mt-3 text-xs leading-5 text-amber-900"><strong>Нужно уточнить:</strong> {analysis.missingData.join(", ")}</p>}{analysis.notes.length > 0 && <p className="mt-2 text-xs leading-5 text-slate-600"><strong>Комментарий AI:</strong> {analysis.notes.join(" ")}</p>}</>;
}
