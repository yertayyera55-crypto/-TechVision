"use client";

import { CheckCircle2, FileText, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useRef } from "react";
import { ApplicationDocument, DocumentType } from "@/lib/types";

export function FileUploader({ type, label, optional = false, value, onChange }: { type: DocumentType; label: string; optional?: boolean; value?: ApplicationDocument; onChange: (document?: ApplicationDocument) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectFile = () => inputRef.current?.click();
  return (
    <div className={`border p-4 transition ${value ? "border-moss-200 bg-moss-50/50" : "border-line bg-paper hover:border-slate-300"}`}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="sr-only"
        id={`file-${type}`}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onChange({ id: `${type}-${Date.now()}`, type, label, name: file.name, optional });
          event.target.value = "";
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${value ? "bg-white text-moss-700" : "bg-slate-50 text-slate-500"}`}>{value ? <CheckCircle2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}</span>
          <div className="min-w-0"><p className="text-sm font-semibold text-ink">{label}{optional && <span className="ml-1 font-normal text-slate-400">· необязательно</span>}</p><p className={`truncate text-xs ${value ? "text-moss-700" : "text-slate-400"}`}>{value?.name ?? "PDF, PNG или JPG до 10 МБ"}</p></div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={selectFile} aria-label={`${value ? "Заменить" : "Выбрать"} файл: ${label}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-paper px-3 text-xs font-semibold text-ink transition hover:border-moss-300 hover:bg-moss-50">
            {value ? <RefreshCw className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}<span className="hidden sm:inline">{value ? "Заменить" : "Выбрать файл"}</span>
          </button>
          {value && <button type="button" onClick={() => onChange(undefined)} aria-label={`Удалить файл: ${label}`} className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>}
        </div>
      </div>
    </div>
  );
}
