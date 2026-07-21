"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { demoApplications } from "@/lib/demo-data";
import { Application } from "@/lib/types";
import { LocalApplicationRepository } from "@/lib/repositories/application-repository";

const STORAGE_KEY = "flowfactor-applications-v3";
const repository = new LocalApplicationRepository(STORAGE_KEY);

interface ApplicationContextValue {
  applications: Application[];
  hydrated: boolean;
  addApplication: (application: Application) => void;
  updateApplication: (id: string, update: Partial<Application>) => void;
  resetDemo: () => void;
}

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState<Application[]>(demoApplications);
  const [hydrated, setHydrated] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- repository hydration intentionally synchronizes external browser storage. */
  useEffect(() => {
    try {
      setApplications(repository.list());
    } catch {
      // Повреждённый localStorage не должен блокировать demo: возвращаем исходные данные.
      setApplications(demoApplications);
    } finally {
      setHydrated(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (hydrated) repository.replaceAll(applications);
  }, [applications, hydrated]);

  const addApplication = useCallback((application: Application) => {
    setApplications((current) => [application, ...current.filter((item) => item.id !== application.id)]);
  }, []);

  const updateApplication = useCallback((id: string, update: Partial<Application>) => {
    setApplications((current) => current.map((item) => (item.id === id ? { ...item, ...update } : item)));
  }, []);

  const resetDemo = useCallback(() => setApplications(demoApplications), []);

  const value = useMemo(
    () => ({ applications, hydrated, addApplication, updateApplication, resetDemo }),
    [applications, hydrated, addApplication, updateApplication, resetDemo],
  );

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
}

export function useApplications() {
  const context = useContext(ApplicationContext);
  if (!context) throw new Error("useApplications должен использоваться внутри ApplicationProvider");
  return context;
}
