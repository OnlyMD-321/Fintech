export type TabKey = "home" | "transfers" | "invoices" | "invoices-create" | "documents" | "profile" | "insurances" | "insurances-create";

export type CurrencyCode = "MAD" | "EUR" | "USD";

export type TransactionKind = "credit" | "debit";

export type BankingTransaction = {
  id: string;
  title: string;
  counterparty: string;
  amount: number;
  currency: CurrencyCode;
  kind: TransactionKind;
  createdAt: string;
  note?: string;
};

export type BankingInvoiceStatus = "draft" | "paid";

export type BankingInvoice = {
  id: string;
  reference: string;
  clientName: string;
  invoiceObject: string;
  amountHT: number;
  vat: number;
  totalTTC: number;
  dueDate: string;
  status: BankingInvoiceStatus;
  createdAt: string;
};

export type BankingDocumentAction = "download" | "share" | "email";

export type BankingDocument = {
  id: string;
  name: string;
  fileName: string;
  description: string;
};

export type BankingCard = {
  id: string;
  name: string;
  network: string;
  maskedPan: string;
  balance: number;
  currency: CurrencyCode;
  theme: "navy-gold" | "ocean-blue" | "emerald";
};

export type InsuranceCoverage = "basic" | "premium" | "executive";
export type InsuranceStatus = "active" | "pending" | "suspended";

export type EmployeeInsurance = {
  id: string;
  employeeName: string;
  role: string;
  coverageType: InsuranceCoverage;
  premium: number;
  status: InsuranceStatus;
  startDate: string;
};

export type BankingProfile = {
  id: string;
  firstName: string;
  displayName: string;
  greeting: string;
  gender: string | "Male" | "Female";
  companyName: string;
  companyAddress: string;
  companyICE: string;
  accountIBAN: string;
  role: string;
  email: string;
  password: string;
  currency: CurrencyCode;
  availableBalance: number;
  pendingBalance: number;
  cards: BankingCard[];
  transactions: BankingTransaction[];
  invoices: BankingInvoice[];
  documents: BankingDocument[];
  walletNotes: string[];
  employeeInsurances: EmployeeInsurance[];
};

export type TransferPayload = {
  beneficiary: string;
  ibanRib: string;
  amount: number;
  currency: CurrencyCode;
  reason?: string;
  bank?: string;
  timing?: "immediate" | "scheduled";
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type InvoicePayload = {
  clientName: string;
  invoiceObject: string;
  amountHT: number;
  vat: number;
  dueDate: string;
};

export const mockProfiles: BankingProfile[] = [
  {
    id: "younes",
    firstName: "Younes",
    displayName: "Younes",
    gender: "Male",
    companyName: "MyLegal SARL",
    companyAddress: "Tour CFC, Casablanca Finance City, Casa",
    companyICE: "001542369000081",
    accountIBAN: "MA64 0077 8000 0123 4567 8901 0144",
    role: "Directeur Général",
    email: "younes@mylegal.ma",
    password: "mylegal123",
    currency: "MAD",
    greeting: "Bonjour Younes",
    availableBalance: 0, 
    pendingBalance: 18000,
    cards: [
      {
        id: "younes-metal",
        name: "Carte Premium Metal",
        network: "Mastercard",
        maskedPan: "•••• 2456",
        balance: 84120.3,
        currency: "MAD",
        theme: "navy-gold"
      },
      {
        id: "younes-expense",
        name: "Frais Professionnels",
        network: "VISA",
        maskedPan: "•••• 0958",
        balance: 41310.52,
        currency: "MAD",
        theme: "emerald"
      }
    ],
    transactions: [
      { id: "tx-y-1", title: "Virement Reçu", counterparty: "Atlas Consulting", amount: 24500, currency: "MAD", kind: "credit", createdAt: "2026-04-28T09:15:00.000Z", note: "Règlement Facture #014" },
      { id: "tx-y-2", title: "Paiement Fournisseur", counterparty: "OfficePro Maroc", amount: 4500, currency: "MAD", kind: "debit", createdAt: "2026-04-25T14:30:00.000Z" },
      { id: "tx-y-3", title: "Paiement en ligne", counterparty: "Stripe.com", amount: 1250, currency: "MAD", kind: "debit", createdAt: "2026-04-24T18:13:00.000Z" },
      { id: "tx-y-4", title: "Salaire", counterparty: "Salaires Avril 2026", amount: 42000, currency: "MAD", kind: "debit", createdAt: "2026-04-22T10:00:00.000Z" },
      { id: "tx-y-5", title: "Virement Reçu", counterparty: "Holding IMMO", amount: 18000, currency: "MAD", kind: "credit", createdAt: "2026-04-18T11:20:00.000Z" },
      { id: "tx-y-6", title: "Prélèvement automatique", counterparty: "Maroc Telecom", amount: 850, currency: "MAD", kind: "debit", createdAt: "2026-04-15T08:00:00.000Z" },
      { id: "tx-y-7", title: "Abonnement SaaS", counterparty: "Microsoft AWS", amount: 3200, currency: "MAD", kind: "debit", createdAt: "2026-04-10T16:12:00.000Z" },
      { id: "tx-y-8", title: "Frais de déplacement", counterparty: "ONCF Autoroutes", amount: 420, currency: "MAD", kind: "debit", createdAt: "2026-04-05T09:45:00.000Z" }
    ],
    invoices: [
      { id: "inv-y-1", reference: "INV-2026-014", clientName: "Atlas Consulting", invoiceObject: "Mission Audit Juridique", amountHT: 15000, vat: 20, totalTTC: 18000, dueDate: "2026-05-20T00:00:00.000Z", status: "paid", createdAt: "2026-04-11T10:00:00.000Z" },
      { id: "inv-y-2", reference: "INV-2026-015", clientName: "Tech Solutions", invoiceObject: "Rédaction contrats de travail", amountHT: 8000, vat: 20, totalTTC: 9600, dueDate: "2026-05-25T00:00:00.000Z", status: "draft", createdAt: "2026-04-25T14:00:00.000Z" },
      { id: "inv-y-3", reference: "INV-2026-016", clientName: "Bennani & Co", invoiceObject: "Consultation Fiscale", amountHT: 12000, vat: 20, totalTTC: 14400, dueDate: "2026-04-15T00:00:00.000Z", status: "draft", createdAt: "2026-03-15T09:30:00.000Z" }, // Facture en retard (Overdue)
      { id: "inv-y-4", reference: "INV-2026-017", clientName: "Holding IMMO", invoiceObject: "Fusion & Acquisition", amountHT: 45000, vat: 20, totalTTC: 54000, dueDate: "2026-06-10T00:00:00.000Z", status: "draft", createdAt: "2026-04-28T11:00:00.000Z" }
    ],
    documents: [],
    walletNotes: ["Liquidité MAD sécurisée", "Prévoir acompte IS (Juin)", "Contacter conseiller pro"],
    employeeInsurances: [
      { id: "ins-1", employeeName: "Amine Bennani", role: "Développeur Fullstack", coverageType: "premium", premium: 450, status: "active", startDate: "2025-01-15T00:00:00.000Z" },
      { id: "ins-2", employeeName: "Fatima Zahra", role: "Responsable RH", coverageType: "basic", premium: 250, status: "active", startDate: "2025-03-01T00:00:00.000Z" },
      { id: "ins-3", employeeName: "Karim Tazi", role: "UI/UX Designer", coverageType: "basic", premium: 250, status: "active", startDate: "2025-03-01T00:00:00.000Z" },
      { id: "ins-4", employeeName: "Sara Idrissi", role: "Directrice Commerciale", coverageType: "executive", premium: 850, status: "active", startDate: "2024-11-01T00:00:00.000Z" },
      { id: "ins-5", employeeName: "Youssef Alaoui", role: "Support Client", coverageType: "basic", premium: 250, status: "pending", startDate: "2026-05-01T00:00:00.000Z" },
      { id: "ins-11", employeeName: "Nadia Chraibi", role: "Comptable", coverageType: "premium", premium: 450, status: "active", startDate: "2025-08-01T00:00:00.000Z" }
    ]
  },
  {
    id: "kenza",
    firstName: "Kenza",
    displayName: "Kenza",
    companyName: "Tech Solutions",
    companyAddress: "Technopark, Entrée B, Casablanca",
    companyICE: "002241587000032",
    accountIBAN: "MA64 0012 5000 0987 6543 2100 0566",
    gender: "Female",
    role: "Directrice Financière",
    email: "kenza@techsolutions.ma",
    password: "tech2026",
    currency: "USD",
    greeting: "Bonjour Kenza",
    availableBalance: 0,
    pendingBalance: 4250,
    cards: [
      { id: "kenza-digital", name: "Carte Digitale Internationale", network: "VISA", maskedPan: "•••• 4082", balance: 42310.48, currency: "USD", theme: "ocean-blue" },
      { id: "kenza-team", name: "Dépenses Équipe", network: "Mastercard", maskedPan: "•••• 5011", balance: 26109.64, currency: "USD", theme: "emerald" }
    ],
    transactions: [
      { id: "tx-k-1", title: "Paiement Client", counterparty: "Nova SaaS Inc.", amount: 9600, currency: "USD", kind: "credit", createdAt: "2026-04-28T14:05:00.000Z" },
      { id: "tx-k-2", title: "Services Cloud", counterparty: "Amazon Web Services", amount: 2400, currency: "USD", kind: "debit", createdAt: "2026-04-26T12:55:00.000Z" },
      { id: "tx-k-3", title: "Fonds de paie", counterparty: "Virement Salaires", amount: 12500, currency: "USD", kind: "debit", createdAt: "2026-04-25T08:40:00.000Z" },
      { id: "tx-k-4", title: "Dépenses Marketing", counterparty: "Google Ads", amount: 3800, currency: "USD", kind: "debit", createdAt: "2026-04-20T16:20:00.000Z" },
      { id: "tx-k-5", title: "Paiement Client", counterparty: "Global Retail LLC", amount: 15400, currency: "USD", kind: "credit", createdAt: "2026-04-15T09:10:00.000Z" },
      { id: "tx-k-6", title: "Abonnement", counterparty: "Slack / Atlassian", amount: 450, currency: "USD", kind: "debit", createdAt: "2026-04-12T11:00:00.000Z" }
    ],
    invoices: [
      { id: "inv-k-1", reference: "FCT-2026-042", clientName: "Nova SaaS Inc.", invoiceObject: "Développement Application Mobile", amountHT: 8000, vat: 20, totalTTC: 9600, dueDate: "2026-04-25T00:00:00.000Z", status: "paid", createdAt: "2026-04-05T10:00:00.000Z" },
      { id: "inv-k-2", reference: "FCT-2026-043", clientName: "Global Retail LLC", invoiceObject: "Maintenance Serveurs", amountHT: 2000, vat: 20, totalTTC: 2400, dueDate: "2026-05-15T00:00:00.000Z", status: "draft", createdAt: "2026-04-28T14:00:00.000Z" }
    ],
    documents: [],
    walletNotes: ["Focus devises étrangères (USD)", "Phase de croissance"],
    employeeInsurances: [
      { id: "ins-6", employeeName: "Mehdi Chraibi", role: "Lead Developer", coverageType: "executive", premium: 850, status: "active", startDate: "2024-06-15T00:00:00.000Z" },
      { id: "ins-7", employeeName: "Sofia Berrada", role: "Ingénieur QA", coverageType: "premium", premium: 450, status: "active", startDate: "2025-02-10T00:00:00.000Z" },
      { id: "ins-8", employeeName: "Ayman Lahlou", role: "Ingénieur DevOps", coverageType: "premium", premium: 450, status: "active", startDate: "2025-02-10T00:00:00.000Z" },
      { id: "ins-9", employeeName: "Rania Naciri", role: "Responsable Marketing", coverageType: "basic", premium: 250, status: "pending", startDate: "2026-05-01T00:00:00.000Z" },
      { id: "ins-10", employeeName: "Oussama El Fassi", role: "Commercial", coverageType: "basic", premium: 250, status: "suspended", startDate: "2024-01-01T00:00:00.000Z" }
    ]
  }
];

export function createInitialProfiles() {
  return mockProfiles.map((profile) => {
    const computedGlobalBalance = profile.cards.reduce((sum, card) => sum + card.balance, 0);
    return {
      ...profile,
      availableBalance: computedGlobalBalance,
      cards: profile.cards.map((card) => ({ ...card })),
      transactions: profile.transactions.map((transaction) => ({ ...transaction })),
      invoices: profile.invoices.map((invoice) => ({ ...invoice })),
      documents: profile.documents.map((document) => ({ ...document })),
      walletNotes: [...profile.walletNotes],
      employeeInsurances: profile.employeeInsurances.map((ins) => ({ ...ins }))
    };
  });
}

export function findProfileByEmail(email: string) {
  return mockProfiles.find((profile) => profile.email.toLowerCase() === email.toLowerCase());
}

export function getProfileSeed(profileId: string) {
  return mockProfiles.find((profile) => profile.id === profileId);
}