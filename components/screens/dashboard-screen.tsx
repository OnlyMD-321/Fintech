import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  BadgeDollarSign,
  CreditCard,
  Download,
  FilePlus,
  Landmark,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserRound,
  Wallet
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useActiveProfile, useAppStore } from "@/store/app-store";
import { useMemo } from "react";
import { BankingTransaction } from "@/services/mock-data";

type DashboardProps = {
  setActiveTab: (tab: "home" | "transfers" | "invoices" | "documents" | "profile") => void;
};

const getIconForTransaction = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("virement") || t.includes("transfer")) return ArrowDownToLine;
  if (t.includes("fournisseur") || t.includes("supplier")) return Landmark;
  if (t.includes("salaire") || t.includes("salary")) return BadgeDollarSign;
  if (t.includes("carte") || t.includes("card")) return CreditCard;
  return ArrowDownToLine;
};

const spendTags = [
  { label: "Opérations 31%", color: "bg-[#D9EEFF] text-[#2563EB]" },
  { label: "Paie 24%", color: "bg-[#FFE7D5] text-[#C26B2F]" },
  { label: "Juridique 20%", color: "bg-[#FFF7CC] text-[#9E7D07]" },
  { label: "Taxes 16%", color: "bg-[#DCFCE7] text-[#15803D]" },
  { label: "Outils 9%", color: "bg-[#E0E7FF] text-[#4F46E5]" }
];

export function DashboardScreen({ setActiveTab }: DashboardProps) {
  const profile = useActiveProfile();

  if (!profile) return null;

  const welcomeText = profile.gender === "Female" ? `Bon retour, Mme ${profile.firstName}` : `Bon retour, M. ${profile.firstName}`;

  const recentTransactions = profile.transactions.slice(0, 4);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-MA", { day: "2-digit", month: "short" }) + ", " + d.toLocaleTimeString("fr-MA", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <section className="animate-floatIn space-y-3 md:space-y-4">
      <div className="space-y-3 md:hidden">
        <header className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Bonjour {profile.firstName}</p>
            <h1 className="text-lg font-semibold leading-tight text-foreground">{profile.companyName}</h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#6366F1] text-sm font-semibold text-white">
            {profile.firstName[0]}
          </div>
        </header>

        <Card className="bg-gradient-to-br from-[#111827] via-[#1F2937] to-[#1E3A8A] text-white shadow-premium">
          <p className="text-xs uppercase tracking-[0.14em] text-white/70">Solde disponible</p>
          <p className="mt-1.5 text-[2rem] font-semibold leading-none">{profile.availableBalance.toLocaleString("fr-MA")} {profile.currency}</p>
          <p className="mt-3 text-sm text-white/80">Solde en attente : {profile.pendingBalance.toLocaleString("fr-MA")} {profile.currency}</p>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setActiveTab("transfers")} variant="secondary" className="justify-start">
            <ArrowUpRight size={16} />
            Faire un virement
          </Button>
          <Button onClick={() => setActiveTab("invoices")} variant="secondary" className="justify-start">
            <FilePlus size={16} />
            Créer une facture
          </Button>
          <Button onClick={() => setActiveTab("invoices")} variant="secondary" className="justify-start">
            <Wallet size={16} />
            Payer une facture
          </Button>
          <Button onClick={() => setActiveTab("documents")} variant="secondary" className="justify-start">
            <Download size={16} />
            Documents
          </Button>
        </div>

        <Card>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Transactions récentes</h2>
            <span className="text-xs text-[#6B7280]">Dernière activité</span>
          </div>
          <ul className="space-y-2.5">
            {recentTransactions.map((item) => {
              const Icon = getIconForTransaction(item.title);
              const isDebit = item.kind === "debit";
              return (
                <li key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#3730A3]">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-[#6B7280]">{item.counterparty}</p>
                    </div>
                  </div>
                  <p className={isDebit ? "text-sm font-semibold text-[#B91C1C]" : "text-sm font-semibold text-[#15803D]"}>
                    {isDebit ? "-" : "+"}{item.amount.toLocaleString("fr-MA")} {item.currency}
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="hidden rounded-2xl border border-white/70 bg-[#F6F8F5] p-4 shadow-soft lg:block">
        <div className="mb-3 flex items-center rounded-2xl bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#6366F1] text-white shadow-sm">
              <UserRound size={17} />
            </div>
            <div>
              <p className="text-base font-semibold text-[#111827]">{welcomeText}</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex h-11 w-[360px] items-center gap-2 rounded-xl border border-border bg-[#F8FAFC] px-3 text-sm text-[#6B7280]">
              <Search size={14} />
              Rechercher
            </div>
            <button className="rounded-lg border border-border bg-white p-2 text-[#6B7280]">
              <Bell size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3">
          <Card className="col-span-6 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Solde</p>
              <span className="rounded-full border border-border bg-[#F8FAFC] px-2.5 py-1 text-xs">{profile.currency}</span>
            </div>
            <p className="text-4xl font-semibold tracking-tight text-[#111827]">{profile.availableBalance.toLocaleString("fr-MA")} {profile.currency}</p>
            <div className="grid grid-cols-[1fr_1fr_82px] gap-2">
              {profile.cards.map((card) => (
                <div key={card.id} className={`relative overflow-hidden rounded-2xl p-3 text-white shadow-lg ${
                  card.theme === "navy-gold" ? "bg-gradient-to-br from-[#111827] via-[#1F2937] to-[#1E3A8A]" :
                  card.theme === "ocean-blue" ? "bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8]" :
                  "bg-gradient-to-br from-[#34D399] via-[#10B981] to-[#0F766E]"
                }`}>
                  <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                  <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-black/10" />
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/90">{card.name}</span>
                    <p className="text-xs font-semibold tracking-[0.12em]">{card.network}</p>
                  </div>
                  <p className="text-[15px] font-semibold tracking-[0.12em]">{card.maskedPan}</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-white/80">Solde</p>
                      <p className="text-base font-semibold">{card.balance.toLocaleString("fr-MA")} {card.currency}</p>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setActiveTab("transfers")}
                className="rounded-2xl border border-dashed border-border bg-[#F8FAFC] text-sm font-medium text-[#6B7280]"
              >
                + Ajouter
              </button>
            </div>
          </Card>

          <Card className="col-span-3 space-y-2 bg-white">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Transactions</p>
              <button className="text-xs text-[#6B7280]">Voir tout</button>
            </div>
            <ul className="space-y-2">
              {recentTransactions.map((item) => {
                const Icon = getIconForTransaction(item.title);
                const isDebit = item.kind === "debit";
                return (
                  <li key={item.id} className="flex items-center justify-between rounded-lg bg-[#F8FAFC] px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF2FF] text-[#3730A3]">
                        <Icon size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{item.title}</p>
                        <p className="text-[10px] text-[#6B7280]">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                    <p className={isDebit ? "text-xs font-semibold text-[#B91C1C]" : "text-xs font-semibold text-[#15803D]"}>
                      {isDebit ? "-" : "+"}{item.amount.toLocaleString("fr-MA")} {item.currency}
                    </p>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="col-span-3 space-y-3 bg-white">
            <p className="text-sm font-semibold">Virement rapide</p>
            <p className="text-xs text-[#6B7280]">Depuis le portefeuille pro</p>
            <div className="flex items-center gap-2">
              {[
                ["AK", "#C7D2FE"],
                ["SC", "#FBCFE8"],
                ["MN", "#BFDBFE"],
                ["FK", "#FDE68A"]
              ].map(([initial, bg]) => (
                <div key={initial} style={{ backgroundColor: bg }} className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold text-[#111827]">
                  {initial}
                </div>
              ))}
            </div>
            <p className="text-5xl font-semibold tracking-tight">450.00</p>
            <p className="text-xs text-[#6B7280]">En attente : {profile.pendingBalance.toLocaleString("fr-MA")} {profile.currency}</p>
            <div className="grid grid-cols-3 gap-1.5 text-center text-sm">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "x"].map((key) => (
                <div key={key} className="rounded-lg bg-[#F3F4F6] py-2 font-medium">
                  {key}
                </div>
              ))}
            </div>
            <Button fullWidth onClick={() => setActiveTab("transfers")}>Envoyer</Button>
          </Card>

          <Card className="col-span-6 bg-white">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Transactions en Octobre</p>
              <div className="flex items-center gap-1">
                <button className="rounded-full bg-[#111827] px-3 py-1 text-xs text-white">Dépenses</button>
                <button className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs text-[#6B7280]">Dépôts</button>
              </div>
            </div>
            <div className="grid grid-cols-[180px_1fr] gap-3">
              <div className="relative mx-auto h-40 w-40 rounded-full bg-[conic-gradient(#84CC16_0_24%,#60A5FA_24_55%,#F59E0B_55_74%,#A78BFA_74_100%)] p-3">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center">
                  <p className="text-[11px] text-[#6B7280]">Total dépenses</p>
                  <p className="text-2xl font-semibold">2 683.21</p>
                </div>
              </div>
              <div className="flex flex-wrap content-start gap-2">
                {spendTags.map((tag) => (
                  <span key={tag.label} className={`${tag.color} rounded-full px-3 py-1 text-xs font-medium`}>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card className="col-span-3 space-y-2 bg-white">
            <div className="flex items-center gap-2 text-[#16A34A]">
              <TrendingUp size={16} />
              <p className="text-sm font-semibold text-[#111827]">Revenus totaux</p>
            </div>
            <p className="text-xs text-[#6B7280]">Oct 2025</p>
            <p className="text-2xl font-semibold">3 762.11 {profile.currency}</p>
          </Card>

          <Card className="col-span-3 space-y-2 bg-white">
            <div className="flex items-center gap-2 text-[#EF4444]">
              <TrendingDown size={16} />
              <p className="text-sm font-semibold text-[#111827]">Dépenses totales</p>
            </div>
            <p className="text-xs text-[#6B7280]">Oct 2025</p>
            <p className="text-2xl font-semibold">2 683.21 {profile.currency}</p>
          </Card>
        </div>
      </div>
    </section>
  );
}