"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ApplicationTable } from "@/components/application-table";
import { MetricCard } from "@/components/metric-card";
import { TopHeader } from "@/components/top-header";
import { metrics } from "@/lib/demo-data";
import { useApplications } from "@/lib/application-store";

export default function HomePage() {
  const { applications } = useApplications();
  return (
    <AppShell>
      <TopHeader />
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
    </AppShell>
  );
}
