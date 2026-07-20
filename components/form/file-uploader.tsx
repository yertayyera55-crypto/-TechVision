"use client";

import { CheckCircle2, FileText, LoaderCircle, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { DocumentActions } from "@/components/document-actions";
import { deleteDocumentFile, saveDocumentFile } from "@/lib/document-file-storage";
import { ApplicationDocument, DocumentType } from "@/lib/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function FileUploader({ type, label, optional = false, value, onChange }: { type: DocumentType; label: string; optional?: boolean; value?: ApplicationDocument; onChange: (document?: ApplicationDocument) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const selectFile = () => inputRef.current?.click();

  const storeFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) { setError("Файл больше 10 МБ. Выберите файл меньшего размера."); return; }
    const id = `${type}-${Date.now()}`;
    try {
      setLoading(true);
      setError("");
      await saveDocumentFile(id, file);
      if (value?.storageKind === "indexeddb") await deleteDocumentFile(value.id);
      onChange({ id, type, label, name: file.name, optional, mimeType: file.type, size: file.size, storageKind: "indexeddb" });
      window.dispatchEvent(new CustomEvent("mm-toast", { detail: `Файл «${file.name}» сохранён в браузере` }));
    } catch (storageError) {
      console.error("Не удалось сохранить файл:", storageError);
      setError("Не удалось сохранить файл. Попробуйте выбрать его ещё раз.");
      window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Не удалось сохранить файл. Попробуйте ещё раз" }));
    } finally {
      setLoading(false);
    }
  };

  const removeFile = async () => {
    try {
      setLoading(true);
      setError("");
      if (value?.storageKind === "indexeddb") await deleteDocumentFile(value.id);
      onChange(undefined);
    } catch (deleteError) {
      console.error("Не удалось удалить файл:", deleteError);
      setError("Не удалось удалить файл. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return <div className={`border p-4 transition ${value ? "border-moss-200 bg-moss-50/50" : "border-line bg-paper hover:border-slate-300"}`}>
    <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="sr-only" id={`file-${type}`} onChange={(event) => { const file = event.target.files?.[0]; if (file) void storeFile(file); event.target.value = ""; }} />
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${value ? "bg-white text-moss-700" : "bg-slate-50 text-slate-500"}`}>{loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : value ? <CheckCircle2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}</span><div className="min-w-0"><p className="text-sm font-semibold text-ink">{label}{optional && <span className="ml-1 font-normal text-slate-400">· необязательно</span>}</p><p className={`truncate text-xs ${value ? "text-moss-700" : "text-slate-400"}`}>{value?.name ?? "PDF, PNG или JPG до 10 МБ"}</p>{value?.size !== undefined && <p className="mt-0.5 text-[10px] text-slate-400">{formatFileSize(value.size)} · сохранён в этом браузере</p>}</div></div><div className="flex shrink-0 flex-wrap items-center gap-1"><button type="button" disabled={loading} onClick={selectFile} aria-label={`${value ? "Заменить" : "Выбрать"} файл: ${label}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-paper px-3 text-xs font-semibold text-ink transition hover:border-moss-300 hover:bg-moss-50 disabled:opacity-50">{value ? <RefreshCw className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}<span>{value ? "Заменить" : "Выбрать файл"}</span></button>{value && <button type="button" disabled={loading} onClick={() => void removeFile()} aria-label={`Удалить файл: ${label}`} className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>}</div></div>
    {value && <div className="mt-3 border-t border-moss-100 pt-3"><DocumentActions document={value} compact /></div>}
    {error && <p role="alert" className="mt-3 text-xs font-medium text-red-700">{error}</p>}
  </div>;
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} Б`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} КБ`;
  return `${(size / 1024 / 1024).toFixed(1)} МБ`;
}
