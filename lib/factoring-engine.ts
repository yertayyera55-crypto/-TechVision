import { DEMO_PARTNERS } from "@/data/demo-partners";
import { getCategoryConfig, PRODUCT_CATEGORIES } from "@/data/product-categories";
import { ApplicationDocument, ContractAnalysisResult, PartnerOffer, ProductCategory, ReadinessProfile, ReceivableCalculation } from "@/lib/types";

export function classifyProduct(subject: string, profileProducts: string, analysisCategory?: ProductCategory | null) {
  if (analysisCategory) return { category: analysisCategory, confidence: 92 };
  const text = `${subject} ${profileProducts}`.toLocaleLowerCase("ru");
  const category = PRODUCT_CATEGORIES.find((item) => item.id !== "other" && item.keywords.some((keyword) => text.includes(keyword)));
  return { category: category?.id ?? "other", confidence: category ? 84 : 35 } as { category: ProductCategory; confidence: number };
}

export function calculateReceivable(input: { acceptedSupplyAmount: number; returnsAmount: number; holdsAmount: number; desiredFinancingAmount: number; confirmationDate: string; paymentTermDays: number }): ReceivableCalculation {
  const confirmedReceivable = Math.max(0, input.acceptedSupplyAmount - input.returnsAmount - input.holdsAmount);
  const demoUpperLimit = Math.round(confirmedReceivable * 0.95);
  const availableFinancing = Math.min(demoUpperLimit, Math.max(0, input.desiredFinancingAmount || demoUpperLimit));
  const due = input.confirmationDate ? new Date(`${input.confirmationDate}T00:00:00`) : null;
  if (due && Number.isFinite(due.getTime())) due.setDate(due.getDate() + Math.max(0, input.paymentTermDays));
  return { ...input, confirmedReceivable, availableFinancing, dueDate: due ? due.toISOString().slice(0, 10) : null };
}

export function calculateReadiness(category: ProductCategory, documents: ApplicationDocument[], analysis: ContractAnalysisResult | null): ReadinessProfile {
  const config = getCategoryConfig(category);
  const hasContract = documents.some((document) => document.type === "contract");
  const hasAcceptance = documents.some((document) => ["invoice", "acceptance", "esf"].includes(document.type));
  const hasProductDoc = documents.some((document) => document.type === "product_doc");
  const checks = [hasContract, hasAcceptance, config.requiredDocuments.length <= 2 || hasProductDoc];
  const missingDocuments = [!hasContract ? "Договор поставки" : "", !hasAcceptance ? "Подтверждение поставки (накладная, акт или ЭСФ)" : "", config.requiredDocuments.length > 2 && !hasProductDoc ? config.requiredDocuments.slice(2).join(", ") : ""].filter(Boolean);
  const documentCompleteness = Math.round(checks.filter(Boolean).length / checks.length * 100);
  const risks = [...config.risks];
  if (!analysis?.assignmentTerms) risks.push("Уступка требования требует проверки по договору");
  if (!analysis?.acceptanceTerms) risks.push("Не найден порядок подтверждения приёмки");
  const score = Math.max(25, Math.min(95, documentCompleteness - Math.max(0, risks.length - 2) * 4));
  return { score, category, documentCompleteness, missingDocuments, risks, preliminaryConclusion: missingDocuments.length ? "Можно продолжить после уточнения недостающих документов." : "Пакет предварительно готов к подбору демо-предложений." };
}

export function matchDemoPartners(input: { category: ProductCategory; receivable: ReceivableCalculation; termDays: number; documents: ApplicationDocument[] }): PartnerOffer[] {
  const category = getCategoryConfig(input.category);
  const hasAcceptance = input.documents.some((document) => ["invoice", "acceptance", "esf"].includes(document.type));
  return DEMO_PARTNERS.map((partner) => {
    const blockers: string[] = [];
    if (input.termDays > partner.maxTermDays) blockers.push(`срок отсрочки больше ${partner.maxTermDays} дней`);
    if (input.receivable.confirmedReceivable < partner.minReceivable) blockers.push(`требование меньше ${new Intl.NumberFormat("ru-RU").format(partner.minReceivable)} ₸`);
    if (partner.requiresAcceptanceProof && !hasAcceptance) blockers.push("нужно подтверждение приёмки");
    if (category.perishable && !partner.acceptsPerishables) blockers.push("партнёр не рассматривает скоропортящуюся категорию в демо");
    const financingAmount = Math.min(input.receivable.availableFinancing, Math.round(input.receivable.confirmedReceivable * partner.financingPercentage / 100));
    const cost = Math.round(financingAmount * partner.commissionRate * Math.max(1, input.termDays) / 60);
    const preferred = partner.preferredCategories.includes(input.category);
    return { id: partner.id, partnerName: partner.name, description: partner.description, eligible: blockers.length === 0, financingPercentage: partner.financingPercentage, financingAmount, cost, netAmount: Math.max(0, financingAmount - cost), termDays: input.termDays, factoringType: partner.factoringType, requiredDocuments: partner.requiresAcceptanceProof ? ["Договор", "Подтверждение приёмки"] : ["Договор"], reasons: blockers.length ? blockers.map((reason) => `Не подходит: ${reason}`) : [preferred ? "Категория входит в демо-приоритет партнёра" : "Категория допустима по синтетическим правилам", `Отсрочка ${input.termDays} дней укладывается в лимит`, `Требование соответствует минимальной сумме`] };
  });
}
