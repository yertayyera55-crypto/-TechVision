"use client";

import { useMemo, useState } from "react";
import { MonitoringEmptyState } from "@/components/monitoring-empty-state";
import { MonitoringErrorState } from "@/components/monitoring-error-state";
import { PaymentMonitoringCard } from "@/components/payment-monitoring-card";
import { MonitoringFilter, MonitoringSort, PaymentMonitoringFilters } from "@/components/payment-monitoring-filters";
import { PaymentMonitoringSummary } from "@/components/payment-monitoring-summary";
import { PaymentMonitoringTable } from "@/components/payment-monitoring-table";
import { demoMonitoringRules } from "@/data/demo-monitoring-rules";
import { useApplications } from "@/lib/application-store";
import { requiresPaymentAttention } from "@/lib/calculate-payment-monitoring";
import { paymentMonitoringDealFromApplication } from "@/lib/payment-monitoring-adapter";
import { usePaymentMonitoring } from "@/lib/payment-monitoring-store";
import { PaymentMonitoringDeal } from "@/lib/types";

export function PaymentsMonitoringDashboard() {
  const { deals, hydrated, error, clearError } = usePaymentMonitoring();
  const { applications } = useApplications();
  const [filter, setFilter] = useState<MonitoringFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<MonitoringSort>("payment");

  const allDeals = useMemo(() => {
    const storedIds = new Set(deals.map((deal) => deal.id));
    const applicationDeals = applications
      .filter((application) => application.monitoring && !storedIds.has(application.id))
      .map(paymentMonitoringDealFromApplication)
      .filter((deal): deal is PaymentMonitoringDeal => deal !== null);
    return [...deals, ...applicationDeals];
  }, [applications, deals]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ru");
    return [...allDeals]
      .filter((deal) => matchesFilter(deal, filter))
      .filter((deal) => !normalized || `${deal.buyerName} ${deal.invoiceNumber} ${deal.id}`.toLocaleLowerCase("ru").includes(normalized))
      .sort((a, b) => compareDeals(a, b, sort));
  }, [allDeals, filter, query, sort]);

  const resetFilters = () => {
    setFilter("all");
    setQuery("");
    setSort("payment");
  };

  return <div className="animate-rise"><header className="mb-7 border-b border-line pb-7"><p className="eyebrow mb-2">Информационный раздел</p><h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">Сроки оплаты</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-muted">После демонстрационного финансирования покупатель перечисляет оплату FlowFactor. Здесь поставщик отслеживает срок и статус сделки; в демоверсии статусы сформированы тестовым сценарием и не редактируются вручную.</p></header>{error && <MonitoringErrorState message={error} onDismiss={clearError} />}<PaymentMonitoringSummary deals={allDeals} /><div className="mt-7"><PaymentMonitoringFilters filter={filter} query={query} sort={sort} onFilter={setFilter} onQuery={setQuery} onSort={setSort} /></div><div className="mt-5"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Реестр сделок</h2><p className="text-xs text-slate-500">{hydrated ? `Найдено: ${filtered.length}` : "Загрузка…"}</p></div>{filtered.length ? <><PaymentMonitoringTable deals={filtered} /><div className="grid gap-3 lg:hidden">{filtered.map((deal) => <PaymentMonitoringCard key={deal.id} deal={deal} />)}</div></> : <MonitoringEmptyState onReset={resetFilters} />}</div><p className="mt-6 text-xs leading-5 text-slate-500">При длительной просрочке покупателя FlowFactor может потребовать возврат финансирования в соответствии с условиями договора. Это предупреждение, а не требование возврата.</p></div>;
}

function matchesFilter(deal: PaymentMonitoringDeal, filter: MonitoringFilter) {
  if (filter === "all") return true;
  if (filter === "attention") return requiresPaymentAttention(deal);
  if (filter === "due_soon") return deal.paymentStatus !== "closed" && deal.daysUntilPayment !== null && deal.daysUntilPayment >= 0 && deal.daysUntilPayment <= demoMonitoringRules.dueSoonDays;
  if (filter === "overdue") return deal.paymentStatus !== "closed" && deal.overdueDays > 0;
  if (filter === "grace") return deal.paymentStatus === "grace_period";
  if (filter === "critical") return deal.paymentStatus !== "closed" && deal.riskLevel === "critical";
  if (filter === "partial") return deal.paymentStatus !== "closed" && deal.amountPaidByBuyer > 0;
  return deal.paymentStatus === "closed";
}

function compareDeals(a: PaymentMonitoringDeal, b: PaymentMonitoringDeal, sort: MonitoringSort) {
  if (sort === "amount") return b.outstandingAmount - a.outstandingAmount;
  if (sort === "risk") return demoMonitoringRules.riskOrder[b.riskLevel] - demoMonitoringRules.riskOrder[a.riskLevel];
  if (sort === "buyer") return a.buyerName.localeCompare(b.buyerName, "ru");
  const left = sort === "payment" ? a.paymentDueDate : a.recourseDate;
  const right = sort === "payment" ? b.paymentDueDate : b.recourseDate;
  if (!left) return 1;
  if (!right) return -1;
  return left.localeCompare(right);
}
