"use client";

import { RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { useApplications } from "@/lib/application-store";

const SETTINGS_KEY = "mighty-miners-settings-v1";
const defaults = { email: true, status: true, reminders: true, analytics: false };

export function SettingsPanel() {
  const { resetDemo } = useApplications();
  const [settings, setSettings] = useState(defaults);
  const [saving, setSaving] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect -- settings hydrate from browser storage after SSR. */
  useEffect(() => { const saved = window.localStorage.getItem(SETTINGS_KEY); if (saved) { try { setSettings(JSON.parse(saved)); } catch { /* use defaults */ } } }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  const save = async () => { setSaving(true); await new Promise((resolve) => setTimeout(resolve, 450)); window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); setSaving(false); window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Настройки сохранены" })); };
  const reset = () => {
    if (!window.confirm("Сбросить все demo-изменения и вернуть исходные заявки?")) return;
    resetDemo();
    window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Demo-данные восстановлены" }));
  };

  return <div className="mx-auto max-w-4xl animate-rise"><header className="mb-8"><p className="eyebrow mb-2">Параметры</p><h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">Настройки</h1><p className="mt-2 text-sm text-muted">Уведомления и параметры демонстрационного кабинета.</p></header><section className="border-y border-line bg-paper sm:rounded-lg sm:border"><div className="border-b border-line px-4 py-5 sm:px-6"><h2 className="text-lg font-semibold">Уведомления</h2><p className="mt-1 text-sm text-slate-500">Выберите, о каких событиях сообщать.</p></div><div className="divide-y divide-line">{[
    ["email", "Email-уведомления", "Получать сводку по заявкам на почту"],
    ["status", "Изменение статуса", "Сообщать при переходе заявки на новый этап"],
    ["reminders", "Напоминания сети", "Напоминать о неподтверждённой поставке"],
    ["analytics", "Аналитическая сводка", "Еженедельный отчёт по срокам и суммам"],
  ].map(([key, title, description]) => <label key={key} className="flex cursor-pointer items-center justify-between gap-5 px-4 py-4 transition hover:bg-moss-50/30 sm:px-6"><span><span className="block text-sm font-semibold text-ink">{title}</span><span className="mt-1 block text-xs text-slate-500">{description}</span></span><input type="checkbox" className="peer sr-only" checked={settings[key as keyof typeof settings]} onChange={(event) => setSettings((current) => ({ ...current, [key]: event.target.checked }))} /><span className="relative h-6 w-11 shrink-0 rounded-full bg-slate-200 transition peer-checked:bg-moss-600 peer-focus-visible:ring-4 peer-focus-visible:ring-moss-100 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" /></label>)}</div><div className="flex justify-end border-t border-line px-4 py-5 sm:px-6"><PrimaryButton type="button" loading={saving} onClick={save}><Save className="h-4 w-4" /> Сохранить настройки</PrimaryButton></div></section><section className="mt-8 border-y border-line bg-paper px-4 py-5 sm:rounded-lg sm:border sm:px-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-sm font-semibold">Сбросить demo-данные</h2><p className="mt-1 text-xs leading-5 text-slate-500">Вернуть исходные четыре заявки. Профиль и настройки не изменятся.</p></div><SecondaryButton type="button" onClick={reset}><RotateCcw className="h-4 w-4" /> Восстановить</SecondaryButton></div></section></div>;
}
