"use client";

import Link from "next/link";
import { BellRing, CheckCheck, FileCheck2, Send } from "lucide-react";
import { useState } from "react";
import { SecondaryButton } from "@/components/ui/buttons";

const initialNotifications = [
  { id: "n1", title: "Поставка подтверждена", text: "ТОО «Aspan Market» подтвердило демонстрационную поставку №125.", time: "26 сентября, 11:00", href: "/applications/125", icon: FileCheck2, unread: true },
  { id: "n2", title: "Демопредложение сформировано", text: "FlowFactor подготовил предварительное демонстрационное предложение для заявки №125.", time: "26 сентября, 11:20", href: "/applications/125", icon: FileCheck2, unread: true },
  { id: "n3", title: "Финансирование оформлено", text: "По условиям демосценария средства перечислены, ожидается оплата покупателя FlowFactor.", time: "27 сентября, 12:00", href: "/payments-monitoring", icon: Send, unread: false },
];

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const markRead = (id: string) => setNotifications((current) => current.map((item) => item.id === id ? { ...item, unread: false } : item));
  const unread = notifications.filter((item) => item.unread).length;
  return <div className="mx-auto max-w-4xl animate-rise"><header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow mb-2">Центр событий</p><h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">Уведомления</h1><p className="mt-2 text-sm text-muted">{unread ? `${unread} новых события` : "Новых событий нет"}</p></div><SecondaryButton type="button" disabled={!unread} onClick={() => setNotifications((current) => current.map((item) => ({ ...item, unread: false })))}><CheckCheck className="h-4 w-4" /> Отметить все прочитанными</SecondaryButton></header><div className="divide-y divide-line border-y border-line bg-paper sm:rounded-lg sm:border">{notifications.map((notification) => { const Icon = notification.icon; return <Link key={notification.id} href={notification.href} onClick={() => markRead(notification.id)} className={`grid grid-cols-[44px_1fr] gap-4 px-4 py-5 transition hover:bg-moss-50/50 sm:px-5 ${notification.unread ? "bg-moss-50/30" : ""}`}><span className={`flex h-11 w-11 items-center justify-center rounded-full ${notification.unread ? "bg-moss-100 text-moss-700" : "bg-slate-50 text-slate-500"}`}><Icon className="h-5 w-5" /></span><div><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-ink">{notification.title}</p><span className="flex items-center gap-2 text-xs text-slate-400">{notification.unread && <span className="h-2 w-2 rounded-full bg-moss-600" />}{notification.time}</span></div><p className="mt-1 text-sm leading-6 text-slate-600">{notification.text}</p></div></Link>; })}</div><div className="mt-6 flex items-center gap-2 text-xs text-slate-400"><BellRing className="h-4 w-4" /> События хранятся локально в demo-режиме.</div></div>;
}
