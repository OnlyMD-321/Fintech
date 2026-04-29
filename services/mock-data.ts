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

// NOUVEAUX TYPES POUR L'ASSURANCE
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
  employeeInsurances: EmployeeInsurance[]; // AJOUT ICI
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
    role: "Managing Director",
    email: "younes@mylegal.ma",
    password: "mylegal123",
    currency: "MAD",
    greeting: "Welcome back Younes",
    availableBalance: 125430.82,
    pendingBalance: 18000,
    cards: [
      {
        id: "younes-metal",
        name: "Premium Metal Card",
        network: "Mastercard",
        maskedPan: "•••• 2456",
        balance: 84120.3,
        currency: "MAD",
        theme: "navy-gold"
      },
      {
        id: "younes-expense",
        name: "Expense Credit",
        network: "VISA",
        maskedPan: "•••• 0958",
        balance: 41310.52,
        currency: "MAD",
        theme: "emerald"
      }
    ],
    transactions: [
      {
        id: "tx-y-1",
        title: "Transfer received",
        counterparty: "Client Atlas",
        amount: 12000,
        currency: "MAD",
        kind: "credit",
        createdAt: "2026-04-24T17:27:00.000Z",
        note: "Incoming settlement"
      },
      {
        id: "tx-y-2",
        title: "Supplier payment",
        counterparty: "OfficePro Maroc",
        amount: 4500,
        currency: "MAD",
        kind: "debit",
        createdAt: "2026-04-23T18:13:00.000Z"
      },
      {
        id: "tx-y-3",
        title: "Salary",
        counterparty: "March 2026",
        amount: 8000,
        currency: "MAD",
        kind: "debit",
        createdAt: "2026-04-22T21:42:00.000Z"
      },
      {
        id: "tx-y-4",
        title: "Bank card",
        counterparty: "SaaS subscription",
        amount: 320,
        currency: "MAD",
        kind: "debit",
        createdAt: "2026-04-21T16:12:00.000Z"
      }
    ],
    invoices: [
      {
        id: "inv-y-1",
        reference: "INV-2026-014",
        clientName: "Atlas Legal",
        invoiceObject: "Compliance advisory",
        amountHT: 15000,
        vat: 20,
        totalTTC: 18000,
        dueDate: "2026-05-20T00:00:00.000Z",
        status: "paid",
        createdAt: "2026-04-11T10:00:00.000Z"
      }
    ],
    documents: [
      {
        id: "doc-y-rib",
        name: "RIB",
        fileName: "mylegal-rib.pdf",
        description: "Secure company bank details"
      },
      {
        id: "doc-y-statements",
        name: "Bank statements",
        fileName: "mylegal-statements.pdf",
        description: "Monthly account history"
      },
      {
        id: "doc-y-kyc",
        name: "KYC",
        fileName: "mylegal-kyc.pdf",
        description: "Company verification pack"
      }
    ],
    walletNotes: ["High MAD liquidity", "EUR reserve wallet", "Priority support"],
    // AJOUT DES EMPLOYÉS ASSURÉS POUR YOUNES
    employeeInsurances: [
      { id: "ins-1", employeeName: "Amine Bennani", role: "Développeur", coverageType: "premium", premium: 450, status: "active", startDate: "2025-01-15T00:00:00.000Z" },
      { id: "ins-2", employeeName: "Fatima Zahra", role: "Ressources Humaines", coverageType: "basic", premium: 250, status: "active", startDate: "2025-03-01T00:00:00.000Z" },
      { id: "ins-3", employeeName: "Karim Tazi", role: "Product Designer", coverageType: "basic", premium: 250, status: "active", startDate: "2025-03-01T00:00:00.000Z" },
      { id: "ins-4", employeeName: "Sara Idrissi", role: "Directrice Commerciale", coverageType: "executive", premium: 850, status: "active", startDate: "2024-11-01T00:00:00.000Z" },
      { id: "ins-5", employeeName: "Youssef Alaoui", role: "Support Client", coverageType: "basic", premium: 250, status: "pending", startDate: "2026-05-01T00:00:00.000Z" }
    ]
  },
  {
    id: "kenza",
    firstName: "Kenza",
    displayName: "Kenza",
    companyName: "Tech Solutions",
    gender: "Female",
    role: "Finance Lead",
    email: "kenza@techsolutions.ma",
    password: "tech2026",
    currency: "USD",
    greeting: "Welcome back Kenza",
    availableBalance: 68420.12,
    pendingBalance: 4250,
    cards: [
      {
        id: "kenza-digital",
        name: "Digital Blue Card",
        network: "VISA",
        maskedPan: "•••• 4082",
        balance: 42310.48,
        currency: "USD",
        theme: "ocean-blue"
      },
      {
        id: "kenza-team",
        name: "Team Expense Card",
        network: "Mastercard",
        maskedPan: "•••• 5011",
        balance: 26109.64,
        currency: "USD",
        theme: "emerald"
      }
    ],
    transactions: [
      {
        id: "tx-k-1",
        title: "Client payment",
        counterparty: "Nova SaaS",
        amount: 9600,
        currency: "USD",
        kind: "credit",
        createdAt: "2026-04-24T14:05:00.000Z"
      },
      {
        id: "tx-k-2",
        title: "Cloud services",
        counterparty: "AWS",
        amount: 2400,
        currency: "USD",
        kind: "debit",
        createdAt: "2026-04-23T12:55:00.000Z"
      },
      {
        id: "tx-k-3",
        title: "Payroll reserve",
        counterparty: "April 2026",
        amount: 7000,
        currency: "USD",
        kind: "debit",
        createdAt: "2026-04-22T08:40:00.000Z"
      }
    ],
    invoices: [],
    documents: [
      {
        id: "doc-k-rib",
        name: "RIB",
        fileName: "techsolutions-rib.pdf",
        description: "Bank coordinates for USD flows"
      },
      {
        id: "doc-k-statements",
        name: "Bank statements",
        fileName: "techsolutions-statements.pdf",
        description: "Monthly operating statements"
      },
      {
        id: "doc-k-kyc",
        name: "KYC",
        fileName: "techsolutions-kyc.pdf",
        description: "Updated compliance package"
      }
    ],
    walletNotes: ["USD focus", "Flexible contractor payouts", "Growth stage operations"],
    // AJOUT DES EMPLOYÉS ASSURÉS POUR KENZA
    employeeInsurances: [
      { id: "ins-6", employeeName: "Mehdi Chraibi", role: "Lead Dev", coverageType: "executive", premium: 850, status: "active", startDate: "2024-06-15T00:00:00.000Z" },
      { id: "ins-7", employeeName: "Sofia Berrada", role: "QA Engineer", coverageType: "premium", premium: 450, status: "active", startDate: "2025-02-10T00:00:00.000Z" },
      { id: "ins-8", employeeName: "Ayman Lahlou", role: "DevOps", coverageType: "premium", premium: 450, status: "active", startDate: "2025-02-10T00:00:00.000Z" },
      { id: "ins-9", employeeName: "Rania Naciri", role: "Marketing", coverageType: "basic", premium: 250, status: "pending", startDate: "2026-05-01T00:00:00.000Z" },
      { id: "ins-10", employeeName: "Oussama El Fassi", role: "Sales", coverageType: "basic", premium: 250, status: "suspended", startDate: "2024-01-01T00:00:00.000Z" }
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
      employeeInsurances: profile.employeeInsurances.map((ins) => ({ ...ins })) // AJOUT ICI
    };
  });
}

export function findProfileByEmail(email: string) {
  return mockProfiles.find((profile) => profile.email.toLowerCase() === email.toLowerCase());
}

export function getProfileSeed(profileId: string) {
  return mockProfiles.find((profile) => profile.id === profileId);
}