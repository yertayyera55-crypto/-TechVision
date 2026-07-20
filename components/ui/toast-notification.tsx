"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ToastNotification() {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const show = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      setMessage(detail);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(""), 3800);
    };
    window.addEventListener("mm-toast", show);
    return () => {
      window.removeEventListener("mm-toast", show);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!message) return null;
  return (
    <div role="status" aria-live="polite" className="fixed bottom-24 right-4 z-[70] flex max-w-[calc(100vw-2rem)] animate-scale-in items-center gap-3 rounded-lg border border-moss-200 bg-paper px-4 py-3 text-sm font-medium text-ink shadow-lift lg:bottom-6 lg:right-6">
      <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0 text-moss-600" />
      <span>{message}</span>
      <button type="button" onClick={() => setMessage("")} aria-label="Закрыть уведомление" className="ml-1 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-ink"><X className="h-4 w-4" /></button>
    </div>
  );
}
