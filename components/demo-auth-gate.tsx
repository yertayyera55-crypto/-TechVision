"use client";

import { Building2, CheckCircle2, Mail, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/logo";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { DEFAULT_COMPANY_PROFILE } from "@/lib/company-profile";
import { useDemoAuth } from "@/lib/demo-auth";

export function DemoAuthGate({ children }: { children: React.ReactNode }) {
  const { user, hydrated, register, continueWithDemo } = useDemoAuth();
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  if (!hydrated) return <main className="min-h-screen bg-canvas" />;
  if (user) return <>{children}</>;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!company.trim() || !contact.trim() || !email.trim()) { setError("Заполните название компании, контакт и email."); return; }
    register({ company: company.trim(), contact: contact.trim(), email: email.trim() });
  };

  return <main className="min-h-screen bg-canvas px-4 py-6 sm:flex sm:items-center sm:py-10"><section className="mx-auto w-full max-w-2xl animate-rise"><div className="mb-8 text-center"><div className="inline-flex rounded-xl border border-line bg-paper px-5 py-4 shadow-soft"><Logo /></div><p className="eyebrow mt-7 mb-2">Кабинет поставщика</p><h1 className="font-display text-4xl font-medium tracking-tight text-ink md:text-5xl">Начните работу с FlowFactor</h1><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">Создайте учебный кабинет или сразу откройте готовый демосценарий для показа команде.</p></div><div className="grid border-y border-line bg-paper sm:rounded-xl sm:border md:grid-cols-[1.15fr_.85fr]"><form onSubmit={submit} className="px-5 py-7 sm:px-8"><p className="eyebrow mb-1">Регистрация</p><h2 className="text-xl font-semibold text-ink">Создать демо-кабинет</h2><p className="mt-2 text-sm leading-6 text-slate-600">Данные сохраняются только в этом браузере и автоматически заполнят анкету FlowFactor.</p><div className="mt-6 grid gap-4"><AuthField icon={<Building2 className="h-4 w-4" />} label="Название компании" id="auth-company" value={company} onChange={setCompany} placeholder="ТОО «Arman Tea»" /><AuthField icon={<UserRound className="h-4 w-4" />} label="Контактное лицо" id="auth-contact" value={contact} onChange={setContact} placeholder="Имя и фамилия" /><AuthField icon={<Mail className="h-4 w-4" />} label="Email" id="auth-email" value={email} onChange={setEmail} placeholder="name@company.kz" type="email" />{error && <p role="alert" className="text-xs font-medium text-red-700">{error}</p>}</div><PrimaryButton type="submit" className="mt-6 w-full">Создать кабинет</PrimaryButton></form><aside className="border-t border-line bg-moss-50/55 px-5 py-7 sm:px-8 md:border-l md:border-t-0"><p className="eyebrow mb-1 !text-moss-700">Быстрый старт</p><h2 className="text-xl font-semibold text-ink">Показать демо</h2><p className="mt-2 text-sm leading-6 text-slate-600">Откройте готовый профиль поставщика и синтетическую сделку без повторной регистрации.</p><dl className="mt-6 space-y-3 text-sm"><DemoRow label="Компания" value={DEFAULT_COMPANY_PROFILE.company} /><DemoRow label="Покупатель" value="ТОО «Aspan Market»" /><DemoRow label="Сумма требования" value="10 000 000 ₸" /></dl><SecondaryButton type="button" className="mt-6 w-full" onClick={continueWithDemo}><CheckCircle2 className="h-4 w-4" /> Продолжить с демо-профилем</SecondaryButton><p className="mt-4 text-xs leading-5 text-slate-500">Это учебный режим: настоящая авторизация, пароли и финансовые операции не реализованы.</p></aside></div></section></main>;
}

function AuthField({ icon, label, id, value, onChange, placeholder, type = "text" }: { icon: React.ReactNode; label: string; id: string; value: string; onChange: (value: string) => void; placeholder: string; type?: "text" | "email" }) {
  return <label htmlFor={id} className="block"><span className="mb-2 block text-sm font-semibold text-ink">{label}</span><span className="relative block"><span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">{icon}</span><input id={id} className="control pl-10" value={value} onChange={(event) => { onChange(event.target.value); }} placeholder={placeholder} type={type} /></span></label>;
}

function DemoRow({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-moss-100 pb-3 last:border-0"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-ink">{value}</dd></div>;
}
