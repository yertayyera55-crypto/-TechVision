"use client";

import Link from "next/link";
import { ArrowRight, FileSearch2, ListChecks, WalletCards } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ApplicationTable } from "@/components/application-table";
import { MetricCard } from "@/components/metric-card";
import { TopHeader } from "@/components/top-header";
import { metrics } from "@/lib/demo-data";
import { useApplications } from "@/lib/application-store";
import { primaryLinkClass, secondaryLinkClass } from "@/components/ui/buttons";

export default function HomePage() {
  const { applications } = useApplications();
  return (
    <AppShell>
      <TopHeader />
      <section className="mb-10 overflow-hidden border-y border-moss-200 bg-moss-50/55 px-5 py-8 sm:rounded-xl sm:border sm:px-8 md:py-10"><p className="eyebrow mb-3">AI-платформа факторинга для поставщиков продуктов</p><h2 className="max-w-4xl font-display text-[clamp(2.2rem,5vw,4.4rem)] font-medium leading-[1.02] tracking-[-0.045em] text-ink">Получите деньги за поставку, не дожидаясь окончания отсрочки</h2><p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">FlowFactor анализирует договор с торговой сетью, учитывает категорию продукта и автоматически готовит заявку на факторинг.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/applications/new" className={primaryLinkClass}>Получить финансирование <ArrowRight className="h-4 w-4" /></Link><a href="#how-it-works" className={secondaryLinkClass}>Как это работает</a></div><p className="mt-6 text-sm font-semibold text-moss-800">Загрузите договор → проверьте данные → получите предварительные варианты</p></section>
      <section id="how-it-works" className="mb-10 scroll-mt-8"><div className="grid gap-px overflow-hidden border-y border-line bg-line sm:rounded-lg sm:border md:grid-cols-3"><HowStep icon={<FileSearch2 className="h-5 w-5" />} number="01" title="Договор и AI" text="Codex CLI извлекает условия, товар и подтверждённые сведения без догадок." /><HowStep icon={<ListChecks className="h-5 w-5" />} number="02" title="Проверка заявки" text="Вы проверяете категорию, требование и готовую универсальную анкету." /><HowStep icon={<WalletCards className="h-5 w-5" />} number="03" title="Демо-варианты" text="Прозрачные правила сравнивают заявку с критериями вымышленных партнёров." /></div></section>
      <section aria-labelledby="metrics-title" className="mb-10">
        <h2 id="metrics-title" className="sr-only">Ключевые показатели</h2>
        <div className="grid grid-cols-2 gap-x-5 md:grid-cols-4 md:gap-4 xl:gap-5">
          {metrics.map((metric, index) => <MetricCard key={metric.label} {...metric} delay={80 + index * 70} />)}
        </div>
      </section>
      <section aria-labelledby="applications-title" className="animate-rise" style={{ animationDelay: "300ms" }}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div><p className="eyebrow mb-1">Рабочий поток</p><h2 id="applications-title" className="section-title">Мои заявки</h2></div>
          <Link href="/applications" className="inline-flex items-center gap-1 text-sm font-semibold text-moss-700 transition hover:text-moss-800 hover:underline">Посмотреть все <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <ApplicationTable applications={applications.slice(0, 4)} />
      </section>
      <section className="mt-10 border-l-2 border-moss-500 bg-paper px-5 py-5"><p className="eyebrow mb-1">Как работает MVP</p><p className="text-sm leading-6 text-slate-600">Для полноценного запуска потребуются соглашения с банками и факторинговыми компаниями, их актуальные критерии и анкеты, защищённый обмен данными, юридическая проверка, согласие пользователей и интеграция со статусами заявок. В MVP эти внешние процессы представлены прозрачным синтетическим сценарием.</p></section>
    </AppShell>
  );
}

function HowStep({ icon, number, title, text }: { icon: React.ReactNode; number: string; title: string; text: string }) { return <article className="bg-paper p-5"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-moss-50 text-moss-700">{icon}</span><span className="font-display text-2xl text-moss-300">{number}</span></div><h3 className="mt-4 text-base font-semibold text-ink">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></article>; }
