"use client";

import { Building2, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { FormField } from "@/components/form/form-field";
import { PrimaryButton } from "@/components/ui/buttons";

const PROFILE_KEY = "mighty-miners-profile-v1";
const initialProfile = { company: "Tea Local LLP", bin: "230740012345", contact: "Ертай Ерлан", phone: "+7 777 125 25 25", email: "hello@tealocal.kz", iban: "KZ12 125K 0000 0000 0125" };

export function ProfileForm() {
  const [profile, setProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect -- profile hydrates from browser storage after SSR. */
  useEffect(() => { const saved = window.localStorage.getItem(PROFILE_KEY); if (saved) { try { setProfile(JSON.parse(saved)); } catch { /* use defaults */ } } }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  const submit = async (event: FormEvent) => { event.preventDefault(); setSaving(true); await new Promise((resolve) => setTimeout(resolve, 500)); window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); setSaving(false); window.dispatchEvent(new CustomEvent("mm-toast", { detail: "Профиль компании сохранён" })); };
  const field = (key: keyof typeof profile) => ({ value: profile[key], onChange: (event: React.ChangeEvent<HTMLInputElement>) => setProfile((current) => ({ ...current, [key]: event.target.value })) });
  return <div className="mx-auto max-w-4xl animate-rise"><header className="mb-8"><p className="eyebrow mb-2">Компания</p><h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">Профиль</h1><p className="mt-2 text-sm text-muted">Реквизиты и контактное лицо Tea Local LLP.</p></header><form onSubmit={submit} className="border-y border-line bg-paper px-4 py-6 sm:rounded-lg sm:border sm:p-7"><div className="mb-7 flex items-center gap-4 border-b border-line pb-6"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-moss-50 text-moss-700"><Building2 className="h-6 w-6" /></span><div><p className="text-lg font-semibold">Tea Local LLP</p><p className="text-sm text-slate-500">Локальный поставщик · Алматы</p></div></div><div className="grid gap-5 sm:grid-cols-2"><FormField label="Название компании" htmlFor="company"><input id="company" className="control" {...field("company")} /></FormField><FormField label="БИН" htmlFor="bin"><input id="bin" className="control" inputMode="numeric" {...field("bin")} /></FormField><FormField label="Контактное лицо" htmlFor="contact"><input id="contact" className="control" {...field("contact")} /></FormField><FormField label="Телефон" htmlFor="phone"><input id="phone" className="control" type="tel" {...field("phone")} /></FormField><FormField label="Email" htmlFor="email"><input id="email" className="control" type="email" {...field("email")} /></FormField><FormField label="IBAN для справки" htmlFor="iban" hint="Финальные реквизиты проверит финансовый партнёр"><input id="iban" className="control" {...field("iban")} /></FormField></div><div className="mt-7 flex justify-end border-t border-line pt-6"><PrimaryButton type="submit" loading={saving}><Save className="h-4 w-4" /> Сохранить изменения</PrimaryButton></div></form></div>;
}
