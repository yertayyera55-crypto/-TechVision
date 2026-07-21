import { CompanyProfile } from "@/lib/types";

export const COMPANY_PROFILE_KEY = "flowfactor-company-profile-v2";
const LEGACY_PROFILE_KEY = "mighty-miners-profile-v1";

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  company: "ТОО «Arman Tea»",
  bin: "000000000000",
  industry: "Производство и поставка чая",
  annualTurnover: "120 000 000 ₸ в год",
  yearsInBusiness: "4 года",
  contact: "Демо-профиль",
  phone: "+7 700 000 00 00",
  email: "demo@armantea.example",
  iban: "KZ00 DEMO 0000 0000 0000",
};

export function mergeCompanyProfile(value: unknown): CompanyProfile {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...DEFAULT_COMPANY_PROFILE };
  const saved = value as Partial<CompanyProfile>;
  return Object.fromEntries(Object.entries(DEFAULT_COMPANY_PROFILE).map(([key, fallback]) => [
    key,
    typeof saved[key as keyof CompanyProfile] === "string" ? saved[key as keyof CompanyProfile] : fallback,
  ])) as CompanyProfile;
}

export function readCompanyProfile(): CompanyProfile {
  if (typeof window === "undefined") return { ...DEFAULT_COMPANY_PROFILE };
  try {
    const raw = window.localStorage.getItem(COMPANY_PROFILE_KEY) ?? window.localStorage.getItem(LEGACY_PROFILE_KEY);
    return raw ? mergeCompanyProfile(JSON.parse(raw)) : { ...DEFAULT_COMPANY_PROFILE };
  } catch {
    return { ...DEFAULT_COMPANY_PROFILE };
  }
}

export function saveCompanyProfile(profile: CompanyProfile) {
  if (typeof window !== "undefined") window.localStorage.setItem(COMPANY_PROFILE_KEY, JSON.stringify(profile));
}
