import { Application } from "@/lib/types";

const standardDocuments = [
  { id: "invoice", type: "invoice" as const, label: "Накладная", name: "Накладная_125.pdf" },
  { id: "bill", type: "bill" as const, label: "Счёт-фактура", name: "Счет_фактура.pdf" },
  { id: "contract", type: "contract" as const, label: "Договор", name: "Договор_TeaLocal.pdf" },
];

export const demoApplications: Application[] = [
  {
    id: "125",
    network: "Magnum Cash & Carry",
    amount: 2_000_000,
    invoiceNumber: "TL-1807-25",
    deliveryDate: "2026-07-18",
    paymentDate: "2026-10-16",
    termDays: 90,
    status: "awaiting_confirmation",
    remainingDays: 87,
    documents: standardDocuments,
    createdAt: "2026-07-16T10:30:00+06:00",
  },
  {
    id: "121",
    network: "Small",
    amount: 1_500_000,
    invoiceNumber: "TL-0907-21",
    deliveryDate: "2026-07-09",
    paymentDate: "2026-09-09",
    termDays: 60,
    status: "precheck_passed",
    remainingDays: 51,
    documents: standardDocuments.map((doc) => ({ ...doc, id: `121-${doc.id}`, name: doc.name.replace("125", "121") })),
    createdAt: "2026-07-09T09:20:00+06:00",
    confirmedAt: "2026-07-10T12:10:00+06:00",
  },
  {
    id: "118",
    network: "Toimart",
    amount: 2_300_000,
    invoiceNumber: "TL-3006-18",
    deliveryDate: "2026-06-30",
    paymentDate: "2026-09-30",
    termDays: 75,
    status: "transferred",
    remainingDays: 72,
    documents: standardDocuments.map((doc) => ({ ...doc, id: `118-${doc.id}`, name: doc.name.replace("125", "118") })),
    createdAt: "2026-06-30T14:05:00+06:00",
    confirmedAt: "2026-07-01T11:00:00+06:00",
    transferredAt: "2026-07-02T15:40:00+06:00",
  },
  {
    id: "111",
    network: "Magnum Cash & Carry",
    amount: 1_200_000,
    invoiceNumber: "TL-2106-11",
    deliveryDate: "2026-06-21",
    paymentDate: "2026-08-21",
    termDays: 45,
    status: "paid",
    remainingDays: null,
    documents: standardDocuments.map((doc) => ({ ...doc, id: `111-${doc.id}`, name: doc.name.replace("125", "111") })),
    createdAt: "2026-06-21T16:10:00+06:00",
    confirmedAt: "2026-06-22T10:20:00+06:00",
    transferredAt: "2026-06-23T13:00:00+06:00",
  },
];

export const metrics = [
  { label: "Ожидается от сетей", value: "5 800 000 ₸", icon: "clock" },
  { label: "Доступно для предварительного финансирования", value: "3 740 000 ₸", icon: "wallet" },
  { label: "Сэкономлено дней", value: "176", icon: "calendar" },
  { label: "Получено средств", value: "2 160 000 ₸", icon: "card" },
] as const;

export const networkOptions = ["Magnum Cash & Carry", "Small", "Toimart", "Anvar", "Другой контрагент"];
