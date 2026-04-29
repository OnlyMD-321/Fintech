export type TabKey = "home" | "transfers" | "invoices" | "invoices-create" | "documents" | "profile" | "cards" | "cards-create";

export type CurrencyCode = "MAD";

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

// NOUVEAU : Les sous-comptes qui remplacent les cartes sur le Dashboard
export type SubAccount = {
  id: string;
  name: string;
  balance: number;
  currency: CurrencyCode;
  theme: "navy-gold" | "ocean-blue" | "emerald";
};

// NOUVEAU : La gestion avancée des cartes (remplace les assurances)
export type CardStatus = "active" | "frozen" | "canceled";

export type BankingCard = {
  id: string;
  name: string;
  cardholder: string;
  network: string;
  maskedPan: string;
  expiry: string;
  limit: number;
  spent: number;
  status: CardStatus;
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
  subAccounts: SubAccount[];
  cards: BankingCard[];
  transactions: BankingTransaction[];
  invoices: BankingInvoice[];
  documents: BankingDocument[];
  walletNotes: string[];
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
    displayName: "Omlil",
    gender: "Male",
    companyName: "MyLegal SARL",
    companyAddress: "Tour CFC, Casablanca Finance City, Casablanca",
    companyICE: "001542369000081",
    accountIBAN: "MA64 0077 8000 0123 4567 8901 0144",
    role: "Gérant Fondateur",
    email: "younes@mylegal.ma",
    password: "mylegal123",
    currency: "MAD",
    greeting: "Bonjour Younes",
    availableBalance: 0, 
    pendingBalance: 18000,
    subAccounts: [
      {
        id: "sub-y-1",
        name: "Compte Principal",
        balance: 145000.50,
        currency: "MAD",
        theme: "navy-gold"
      },
      {
        id: "sub-y-2",
        name: "Provision TVA & Impôts",
        balance: 35400.00,
        currency: "MAD",
        theme: "emerald"
      }
    ],
    cards: [
      { id: "card-y-1", name: "Carte Corporate", cardholder: "Younes Omlil", network: "VISA", maskedPan: "•••• 2456", expiry: "12/28", limit: 50000, spent: 12450, status: "active" },
      { id: "card-y-2", name: "Dépenses Marketing", cardholder: "Younes Omlil", network: "Mastercard", maskedPan: "•••• 8832", expiry: "06/27", limit: 20000, spent: 18500, status: "active" }
    ],
    transactions: [
      { id: "tx-y-1", title: "Virement Reçu", counterparty: "Groupe ONA holding", amount: 45000, currency: "MAD", kind: "credit", createdAt: "2026-04-28T10:15:00.000Z", note: "Paiement facture Conseil" },
      { id: "tx-y-2", title: "Prélèvement DGI", counterparty: "Trésorerie Générale du Royaume", amount: 12500, currency: "MAD", kind: "debit", createdAt: "2026-04-26T08:30:00.000Z", note: "IS 1er Acompte" },
      { id: "tx-y-3", title: "Paiement Fournisseur", counterparty: "Maroc Telecom", amount: 1250, currency: "MAD", kind: "debit", createdAt: "2026-04-25T14:20:00.000Z", note: "Flotte mobile" },
      { id: "tx-y-4", title: "Salaire Avril", counterparty: "Amine Bennani", amount: 8500, currency: "MAD", kind: "debit", createdAt: "2026-04-24T09:00:00.000Z" },
      { id: "tx-y-5", title: "Achat Matériel", counterparty: "Electroplanet Casa", amount: 3499, currency: "MAD", kind: "debit", createdAt: "2026-04-21T16:12:00.000Z" }
    ],
    invoices: [
      { id: "inv-y-1", reference: "F-2026-041", clientName: "Attijariwafa Bank", invoiceObject: "Consultation RGPD", amountHT: 25000, vat: 20, totalTTC: 30000, dueDate: "2026-05-15T00:00:00.000Z", status: "paid", createdAt: "2026-04-10T10:00:00.000Z" },
      { id: "inv-y-2", reference: "F-2026-042", clientName: "Label'Vie SA", invoiceObject: "Audit Contrats", amountHT: 15000, vat: 20, totalTTC: 18000, dueDate: "2026-04-20T00:00:00.000Z", status: "draft", createdAt: "2026-04-12T11:30:00.000Z" },
      { id: "inv-y-3", reference: "F-2026-043", clientName: "ONCF", invoiceObject: "Rédaction Statuts", amountHT: 40000, vat: 20, totalTTC: 48000, dueDate: "2026-05-25T00:00:00.000Z", status: "draft", createdAt: "2026-04-25T09:15:00.000Z" }
    ],
    documents: [],
    walletNotes: ["Liquidité MAD sécurisée", "Préparation bilan 2025"]
  },
  {
    id: "kenza",
    firstName: "Kenza",
    displayName: "Berrada",
    companyName: "Tech Solutions Digital",
    companyAddress: "Technopark, Route de Nouasseur, Casablanca",
    companyICE: "002241587000032",
    accountIBAN: "MA64 0012 5000 0987 6543 2100 0566",
    gender: "Female",
    role: "Directrice Financière",
    email: "kenza@techsolutions.ma",
    password: "tech2026",
    currency: "MAD",
    greeting: "Bonjour Kenza",
    availableBalance: 0,
    pendingBalance: 12500,
    subAccounts: [
      { id: "sub-k-1", name: "Opérations Courantes", balance: 285400.00, currency: "MAD", theme: "ocean-blue" },
      { id: "sub-k-2", name: "Fonds de Roulement", balance: 150000.00, currency: "MAD", theme: "navy-gold" }
    ],
    cards: [
      { id: "card-k-1", name: "Carte Hébergement", cardholder: "Kenza Berrada", network: "Mastercard", maskedPan: "•••• 4082", expiry: "09/29", limit: 100000, spent: 45000, status: "active" },
      { id: "card-k-2", name: "Frais de Déplacement", cardholder: "Mehdi Chraibi", network: "VISA", maskedPan: "•••• 5011", expiry: "03/28", limit: 15000, spent: 2500, status: "active" },
      { id: "card-k-3", name: "Abonnements SaaS", cardholder: "Kenza Berrada", network: "VISA", maskedPan: "•••• 1129", expiry: "01/27", limit: 30000, spent: 29500, status: "frozen" }
    ],
    transactions: [
      { id: "tx-k-1", title: "Virement Reçu", counterparty: "Groupe OCP", amount: 120000, currency: "MAD", kind: "credit", createdAt: "2026-04-28T14:05:00.000Z" },
      { id: "tx-k-2", title: "Paiement en ligne", counterparty: "Amazon Web Services", amount: 15400, currency: "MAD", kind: "debit", createdAt: "2026-04-27T12:55:00.000Z" },
      { id: "tx-k-3", title: "Paiement TPE", counterparty: "Boutique Apple Casablanca", amount: 18500, currency: "MAD", kind: "debit", createdAt: "2026-04-22T08:40:00.000Z" },
      { id: "tx-k-4", title: "Frais Déplacement", counterparty: "Royal Air Maroc", amount: 4200, currency: "MAD", kind: "debit", createdAt: "2026-04-20T10:20:00.000Z" }
    ],
    invoices: [],
    documents: [],
    walletNotes: ["Croissance Q2", "Renouvellement parc IT"]
  }
];

export function createInitialProfiles() {
  return mockProfiles.map((profile) => {
    // Le solde global est la somme des sous-comptes
    const computedGlobalBalance = profile.subAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    return {
      ...profile,
      availableBalance: computedGlobalBalance,
      subAccounts: profile.subAccounts.map((acc) => ({ ...acc })),
      cards: profile.cards.map((card) => ({ ...card })),
      transactions: profile.transactions.map((transaction) => ({ ...transaction })),
      invoices: profile.invoices.map((invoice) => ({ ...invoice })),
      documents: profile.documents.map((document) => ({ ...document })),
      walletNotes: [...profile.walletNotes]
    };
  });
}

export function findProfileByEmail(email: string) {
  return mockProfiles.find((profile) => profile.email.toLowerCase() === email.toLowerCase());
}

export function getProfileSeed(profileId: string) {
  return mockProfiles.find((profile) => profile.id === profileId);
}