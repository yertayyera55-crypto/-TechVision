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
  const checks = [hasContract, Boolean(analysis?.acceptanceTerms), Boolean(analysis?.assignmentTerms)];
  const missingDocuments = [!hasContract ? "Договор поставки" : "", !hasAcceptance ? "Подтверждение поставки (накладная, акт или ЭСФ)" : "", config.requiredDocuments.length > 2 && !hasProductDoc ? config.requiredDocuments.slice(2).join(", ") : ""].filter(Boolean);
  const documentCompleteness = Math.round(checks.filter(Boolean).length / checks.length * 100);
  const risks = [...config.risks];
  if (!analysis?.assignmentTerms) risks.push("Уступка требования требует проверки по договору");
  if (!analysis?.acceptanceTerms) risks.push("Не найден порядок подтверждения приёмки");
  const score = Math.max(25, Math.min(95, documentCompleteness - Math.max(0, risks.length - 2) * 4));
  const preliminaryConclusion = checks.every(Boolean) ? "Договор содержит основные условия для демо-заявки." : "В договоре нужно уточнить основные условия заявки.";
  return { score, category, documentCompleteness, missingDocuments, risks, preliminaryConclusion };
}

export function matchDemoPartners(input: { category: ProductCategory; receivable: ReceivableCalculation; termDays: number; documents: ApplicationDocument[] }): PartnerOffer[] {
  const category = getCategoryConfig(input.category);
  const hasAcceptance = input.documents.some((document) => ["invoice", "acceptance", "esf"].includes(document.type));
  const ranked = DEMO_PARTNERS.map((partner) => {
    const caveats: string[] = [];
    if (input.termDays > partner.maxTermDays) caveats.push(`Срок ${input.termDays} дней выше демо-ориентира партнёра в ${partner.maxTermDays} дней`);
    if (input.receivable.confirmedReceivable < partner.minReceivable) caveats.push(`Сумма ниже демо-ориентира ${new Intl.NumberFormat("ru-RU").format(partner.minReceivable)} ₸`);
    if (partner.requiresAcceptanceProof && !hasAcceptance) caveats.push("Перед рассмотрением понадобится подтверждение приёмки");
    if (category.perishable && !partner.acceptsPerishables) caveats.push("Скоропортящаяся категория потребует отдельного согласования");
    const financingAmount = Math.min(input.receivable.availableFinancing, Math.round(input.receivable.confirmedReceivable * partner.financingPercentage / 100));
    const cost = Math.round(financingAmount * partner.commissionRate * Math.max(1, input.termDays) / 60);
    const preferred = partner.preferredCategories.includes(input.category);
    const reasons = [preferred ? "Категория входит в демо-приоритет партнёра" : "Партнёр работает с этой категорией по демо-правилам", partner.requiresAcceptanceProof ? "Партнёр проверяет подтверждение приёмки" : "Можно начать без отдельного подтверждения приёмки", `Финансирование до ${partner.financingPercentage}% · ${partner.factoringType === "non_recourse" ? "без регресса" : "с регрессом"}`];
    const score = (preferred ? 25 : 0) + partner.financingPercentage - caveats.length * 40 - partner.commissionRate * 100;
    return { score, offer: { id: partner.id, partnerName: partner.name, description: partner.description, eligible: caveats.length === 0, recommendation: "available" as const, financingPercentage: partner.financingPercentage, financingAmount, cost, netAmount: Math.max(0, financingAmount - cost), termDays: input.termDays, factoringType: partner.factoringType, requiredDocuments: partner.requiresAcceptanceProof ? ["Договор", "Подтверждение приёмки"] : ["Договор"], caveats, reasons } };
  });
  const recommendedId = [...ranked].sort((left, right) => right.score - left.score)[0]?.offer.id;
  return ranked.map(({ offer }) => ({ ...offer, recommendation: offer.id === recommendedId ? "recommended" : "available" }));
}
