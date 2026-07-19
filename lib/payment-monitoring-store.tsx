"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { demoPaymentMonitoringDeals } from "@/data/demo-payment-monitoring";
import { recalculatePaymentMonitoringDeal } from "@/lib/calculate-payment-monitoring";
import { PaymentMonitoringRepository } from "@/lib/repositories/payment-monitoring-repository";
import { PaymentMonitoringDeal } from "@/lib/types";

const STORAGE_KEY = "mighty-miners-payment-monitoring-v1";
const repository = new PaymentMonitoringRepository(STORAGE_KEY);

interface PaymentMonitoringContextValue {
  deals: PaymentMonitoringDeal[];
  hydrated: boolean;
  error: string | null;
  updateDeal: (id: string, nextDeal: PaymentMonitoringDeal) => void;
  resetDeals: () => void;
  clearError: () => void;
}

const PaymentMonitoringContext = createContext<PaymentMonitoringContextValue | null>(null);

export function PaymentMonitoringProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(
    () => demoPaymentMonitoringDeals.map((deal) => recalculatePaymentMonitoringDeal(deal)),
    [],
  );
  const [deals, setDeals] = useState<PaymentMonitoringDeal[]>(initial);
  const dealsRef = useRef(deals);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- localStorage hydrates after SSR. */
  useEffect(() => {
    try {
      const loaded = repository.list().map((deal) => recalculatePaymentMonitoringDeal(deal));
      dealsRef.current = loaded;
      setDeals(loaded);
    } catch (loadError) {
      console.error("Не удалось загрузить контроль оплат:", loadError);
      dealsRef.current = initial;
      setDeals(initial);
      setError("Сохранённые данные повреждены. Показаны исходные demo-сделки.");
    } finally {
      setHydrated(true);
    }
  }, [initial]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const commit = useCallback((next: PaymentMonitoringDeal[]) => {
    try {
      repository.replaceAll(next);
      dealsRef.current = next;
      setDeals(next);
      setError(null);
    } catch (saveError) {
      console.error("Не удалось сохранить контроль оплат:", saveError);
      setError("Не удалось сохранить изменения. Попробуйте ещё раз");
      throw saveError;
    }
  }, []);

  const updateDeal = useCallback((id: string, nextDeal: PaymentMonitoringDeal) => {
    const exists = dealsRef.current.some((deal) => deal.id === id);
    if (!exists) throw new Error(`Сделка ${id} не найдена.`);
    commit(dealsRef.current.map((deal) => (deal.id === id ? nextDeal : deal)));
  }, [commit]);

  const resetDeals = useCallback(() => {
    const reset = demoPaymentMonitoringDeals.map((deal) => recalculatePaymentMonitoringDeal(deal));
    commit(reset);
  }, [commit]);

  const clearError = useCallback(() => setError(null), []);
  const value = useMemo(
    () => ({ deals, hydrated, error, updateDeal, resetDeals, clearError }),
    [deals, hydrated, error, updateDeal, resetDeals, clearError],
  );
  return <PaymentMonitoringContext.Provider value={value}>{children}</PaymentMonitoringContext.Provider>;
}

export function usePaymentMonitoring() {
  const context = useContext(PaymentMonitoringContext);
  if (!context) throw new Error("usePaymentMonitoring должен использоваться внутри PaymentMonitoringProvider");
  return context;
}
