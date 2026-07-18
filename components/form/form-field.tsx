import { ReactNode } from "react";

export function FormField({ label, htmlFor, hint, error, required, children }: { label: string; htmlFor: string; hint?: string; error?: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-ink">{label}{required && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}</label>
      {children}
      {error ? <p className="mt-1.5 text-xs font-medium text-red-700" role="alert">{error}</p> : hint ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
