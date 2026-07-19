"use client";

import { X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { FormField } from "@/components/form/form-field";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { ModalPortal } from "@/components/ui/modal-portal";

export interface PaymentInput { amount: number; date: string; comment: string }

export function PaymentModal({ open, mode, outstandingAmount, onClose, onSubmit }: { open: boolean; mode: "partial" | "full"; outstandingAmount: number; onClose: () => void; onSubmit: (payment: PaymentInput) => Promise<void> }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("2026-09-25");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- modal fields reset when a new payment action opens. */
  useEffect(() => { if (open) { setAmount(mode === "full" ? String(outstandingAmount) : ""); setDate("2026-09-25"); setComment(""); setError(""); } }, [open, mode, outstandingAmount]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handler);
    };
  }, [open, onClose]);

  if (!open) return null;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) { setError("Введите сумму больше нуля."); return; }
    if (value > outstandingAmount) { setError("Сумма не может превышать остаток задолженности."); return; }
    if (!date) { setError("Укажите дату оплаты."); return; }
    setError(""); setLoading(true); await onSubmit({ amount: value, date, comment }); setLoading(false); onClose();
  };
  return <ModalPortal><div className="fixed inset-0 z-[90] flex animate-fade items-end justify-center bg-ink/45 sm:items-center sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div role="dialog" aria-modal="true" aria-labelledby="payment-title" className="w-full max-w-lg animate-scale-in rounded-t-xl border border-line bg-paper p-5 shadow-lift sm:rounded-xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow mb-2">Демонстрационные данные</p><h2 id="payment-title" className="text-xl font-semibold">Зафиксировать оплату покупателя</h2></div><button type="button" onClick={onClose} aria-label="Закрыть окно" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><form onSubmit={submit} className="mt-6 grid gap-5"><FormField label="Сумма оплаты" htmlFor="paymentAmount" required><div className="relative"><input id="paymentAmount" type="number" min="1" max={outstandingAmount} className="control pr-10" value={amount} onChange={(event) => setAmount(event.target.value)} /><span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-500">₸</span></div></FormField><FormField label="Дата оплаты" htmlFor="paymentDate" required><input id="paymentDate" type="date" className="control" value={date} onChange={(event) => setDate(event.target.value)} /></FormField><FormField label="Комментарий" htmlFor="paymentComment" hint="Необязательно"><textarea id="paymentComment" rows={3} className="control py-3" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Например, платёжное поручение №…" /></FormField>{error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}<p className="text-xs leading-5 text-slate-500">Уведомление имитируется. Реальная сверка с банковским счётом не выполняется.</p><div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><SecondaryButton type="button" onClick={onClose}>Отмена</SecondaryButton><PrimaryButton type="submit" loading={loading}>{mode === "full" ? "Зафиксировать полную оплату" : "Зафиксировать оплату"}</PrimaryButton></div></form></div></div></ModalPortal>;
}
