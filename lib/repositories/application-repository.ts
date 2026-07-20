import { demoApplications } from "@/lib/demo-data";
import { Application } from "@/lib/types";

/**
 * UI зависит от этого контракта, а не от конкретной базы. При подключении Supabase
 * достаточно реализовать тот же интерфейс через select/upsert — страницы не меняются.
 */
export interface ApplicationRepository {
  list(): Application[];
  replaceAll(applications: Application[]): void;
}

export class LocalApplicationRepository implements ApplicationRepository {
  constructor(private readonly storageKey: string) {}

  list(): Application[] {
    if (typeof window === "undefined") return demoApplications;
    const saved = window.localStorage.getItem(this.storageKey);
    if (!saved) return demoApplications;
    try { return JSON.parse(saved) as Application[]; } catch { return demoApplications; }
  }

  replaceAll(applications: Application[]) {
    if (typeof window !== "undefined") window.localStorage.setItem(this.storageKey, JSON.stringify(applications));
  }
}
