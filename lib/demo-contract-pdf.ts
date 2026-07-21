import type { ContractAnalysisResult } from "@/lib/types";

/**
 * Валидный одностраничный ASCII-PDF для стабильного демосценария.
 * XRef и длина stream вычисляются программно, поэтому договор можно менять
 * без ручного пересчёта PDF-смещений.
 */
function buildDemoContractPdf() {
  const lines = [
    "FLOWFACTOR DEMO SUPPLY CONTRACT",
    "Supplier: Arman Tea LLP",
    "Buyer: Aspan Market LLP",
    "Contract number: FF-AT-2026/01",
    "Contract date: 2026-09-01",
    "Supply subject: packaged tea products",
    "Invoice amount: 10000000 KZT",
    "Delivery date: 2026-09-25",
    "Invoice number: AT-DEMO-2026",
    "Payment: within 60 days after delivery; due 2026-11-24",
    "Acceptance: signed delivery note within 1 business day after delivery",
    "Assignment: monetary claim may be assigned after written buyer notice",
    "Additional buyer consent for assignment is not required",
    "Returns: only documented quality or quantity mismatch",
    "Deductions: only if agreed by both parties in writing",
    "Product documents: declaration of conformity for packaged tea",
  ];
  const content = ["BT", "/F1 14 Tf", "72 748 Td", `(${escapePdfText(lines[0])}) Tj`, "/F1 10 Tf", ...lines.slice(1).flatMap((line) => ["0 -24 Td", `(${escapePdfText(line)}) Tj`]), "ET"].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${body}\nendobj\n`; });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return pdf;
}

function escapePdfText(value: string) { return value.replace(/([\\()])/g, "\\$1"); }

export const DEMO_CONTRACT_PDF = buildDemoContractPdf();

export const DEMO_CONTRACT_ANALYSIS: ContractAnalysisResult = {
  supplierName: "ТОО «Arman Tea»",
  buyerName: "ТОО «Aspan Market»",
  network: "ТОО «Aspan Market»",
  invoiceNumber: "AT-DEMO-2026",
  amount: 10_000_000,
  deliveryDate: "2026-09-25",
  paymentDueDate: "2026-11-24",
  paymentTermDays: 60,
  contractNumber: "FF-AT-2026/01",
  contractDate: "2026-09-01",
  paymentTerms: "Оплата в течение 60 дней после поставки",
  supplySubject: "Фасованный чай",
  productCategory: "tea_coffee",
  categoryConfidence: 96,
  deliveryMethod: "Поставка товара покупателю по накладной",
  delayTrigger: "С даты поставки",
  acceptanceTerms: "Приёмка подтверждается подписанной накладной в течение 1 рабочего дня после поставки",
  returnsTerms: "Возврат допускается только при документально подтверждённом расхождении по качеству или количеству",
  deductions: "Удержания допускаются только по письменному соглашению обеих сторон",
  assignmentTerms: "Уступка денежного требования разрешена без отдельного согласия покупателя после письменного уведомления",
  requiredProductDocuments: ["Декларация соответствия на фасованный чай"],
  evidence: [
    { field: "supplySubject", excerpt: "Supply subject: packaged tea products" },
    { field: "paymentTerms", excerpt: "Payment: within 60 days after delivery" },
    { field: "amount", excerpt: "Invoice amount: 10000000 KZT" },
    { field: "acceptanceTerms", excerpt: "Acceptance: signed delivery note within 1 business day after delivery" },
    { field: "assignmentTerms", excerpt: "Additional buyer consent for assignment is not required" },
  ],
  factoringReady: true,
  missingData: [],
  notes: ["Договор содержит условия приёмки и уступки требования. Дополнительные подтверждающие файлы необязательны на этапе демо-заявки и могут быть запрошены выбранным партнёром."],
};
