"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { ModalPortal } from "@/components/ui/modal-portal";

export function ConfirmationModal({ open, onClose, onConfirm, loading = false }: { open: boolean; onClose: () => void; onConfirm: () => void; loading?: boolean }) {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setConsent(false);
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const close = () => {
    setConsent(false);
    onClose();
  };

  if (!open) return null;
  return <ModalPortal>
    <div className="fixed inset-0 z-[80] flex animate-fade items-end justify-center bg-ink/45 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <div role="dialog" aria-modal="true" aria-labelledby="consent-title" className="w-full max-w-lg animate-scale-in rounded-t-xl border border-line bg-paper p-5 shadow-lift sm:rounded-xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="eyebrow mb-2">Передача партнёру</p><h2 id="consent-title" className="text-xl font-semibold tracking-tight text-ink">Подтвердите согласие</h2></div>
          <button type="button" onClick={close} aria-label="Закрыть окно" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-ink"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">Вы разрешаете передать данные компании и документы выбранному финансовому партнёру для рассмотрения заявки.</p>
        <label className="mt-5 flex cursor-pointer items-start gap-3 border border-line bg-canvas p-4 text-sm leading-6 text-ink transition hover:border-moss-200">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 accent-moss-700" />
          <span>Я согласен на передачу данных для рассмотрения заявки.</span>
        </label>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><SecondaryButton type="button" onClick={close}>Отмена</SecondaryButton><PrimaryButton type="button" disabled={!consent} loading={loading} onClick={onConfirm}>Подтвердить и передать</PrimaryButton></div>
      </div>
    </div>
  </ModalPortal>;
}
