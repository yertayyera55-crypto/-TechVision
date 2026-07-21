"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_COMPANY_PROFILE, saveCompanyProfile } from "@/lib/company-profile";

const AUTH_KEY = "flowfactor-demo-auth-v1";

export interface DemoUser {
  company: string;
  contact: string;
  email: string;
  mode: "demo" | "registered";
}

interface DemoAuthContextValue {
  user: DemoUser | null;
  hydrated: boolean;
  register: (details: Omit<DemoUser, "mode">) => void;
  continueWithDemo: () => void;
  logout: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null);

function persist(user: DemoUser | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(AUTH_KEY);
}

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- демо-сессия гидратируется из browser storage после SSR. */
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(AUTH_KEY);
      if (saved) {
        const candidate = JSON.parse(saved) as Partial<DemoUser>;
        if (typeof candidate.company === "string" && typeof candidate.contact === "string" && typeof candidate.email === "string" && (candidate.mode === "demo" || candidate.mode === "registered")) setUser(candidate as DemoUser);
      }
    } catch {
      window.localStorage.removeItem(AUTH_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const register = useCallback((details: Omit<DemoUser, "mode">) => {
    const next: DemoUser = { ...details, mode: "registered" };
    saveCompanyProfile({ ...DEFAULT_COMPANY_PROFILE, company: details.company || DEFAULT_COMPANY_PROFILE.company, contact: details.contact || DEFAULT_COMPANY_PROFILE.contact, email: details.email || DEFAULT_COMPANY_PROFILE.email });
    persist(next);
    setUser(next);
  }, []);

  const continueWithDemo = useCallback(() => {
    const next: DemoUser = { company: DEFAULT_COMPANY_PROFILE.company, contact: DEFAULT_COMPANY_PROFILE.contact, email: DEFAULT_COMPANY_PROFILE.email, mode: "demo" };
    saveCompanyProfile(DEFAULT_COMPANY_PROFILE);
    persist(next);
    setUser(next);
  }, []);

  const logout = useCallback(() => { persist(null); setUser(null); }, []);
  const value = useMemo(() => ({ user, hydrated, register, continueWithDemo, logout }), [user, hydrated, register, continueWithDemo, logout]);
  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>;
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext);
  if (!context) throw new Error("useDemoAuth должен использоваться внутри DemoAuthProvider");
  return context;
}
