"use client";

import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  BadgeDollarSign,
  CheckCircle2,
  CreditCard,
  Download,
  FilePlus,
  Landmark,
  Loader2,
  Search,
  TrendingDown,
  TrendingUp,
  UserRound,
  Wallet,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActiveProfile, useAppStore } from "@/store/app-store";
import { useState, useMemo, useEffect } from "react";
import { VisaLogo, MastercardLogo, AmexLogo } from "@/components/ui/network-logos";

const getNetworkLogo = (network: string) => {
  const n = network.toLowerCase();
  if (n.includes("visa")) return <VisaLogo className="h-6 w-auto" />;
  if (n.includes("mastercard")) return <MastercardLogo className="h-8 w-auto" />;
  if (n.includes("amex") || n.includes("american")) return <AmexLogo className="h-6 w-auto" />;
  return <span className="text-[10px] font-bold">{network}</span>;
};

const getIconForTransaction = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("virement") || t.includes("transfer") || t.includes("reçu")) return ArrowDownToLine;
  if (t.includes("fournisseur") || t.includes("supplier") || t.includes("achat") || t.includes("facture")) return Landmark;
  if (t.includes("salaire") || t.includes("salary") || t.includes("paie")) return BadgeDollarSign;
  if (t.includes("carte") || t.includes("card") || t.includes("paiement") || t.includes("pos")) return CreditCard;
  return ArrowDownToLine;
};

const quickRecipients = [
  { initial: "AK", name: "Amina K.", bg: "#C7D2FE" },
  { initial: "SC", name: "Said Consulting", bg: "#FBCFE8" },
  { initial: "MN", name: "Mounia N.", bg: "#BFDBFE" },
  { initial: "FK", name: "Farah K.", bg: "#FDE68A" }
];

const CHART_COLORS = ["#2563EB", "#C26B2F", "#9E7D07", "#15803D", "#4F46E5", "#0891B2", "#BE123C"];
const CHART_BG_COLORS = ["#D9EEFF", "#FFE7D5", "#FFF7CC", "#DCFCE7", "#E0E7FF", "#CFFAFE", "#FFE4E6"];

export function DashboardScreen() {
  const profile = useActiveProfile();
  const { setActiveTab, addTransfer, addCard } = useAppStore();

  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickAmount, setQuickAmount] = useState("0");
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [chartMode, setChartMode] = useState<"debit" | "credit">("debit");

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardNetwork, setNewCardNetwork] = useState<"VISA" | "Mastercard" | "Amex">("VISA");
  const [newCardTheme, setNewCardTheme] = useState<"navy-gold" | "ocean-blue" | "emerald">("ocean-blue");
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const safeTransactions = profile?.transactions || [];

  const sortedTransactions = useMemo(() => {
    return [...safeTransactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [safeTransactions]);

  const filteredTransactions = useMemo(() => {
    const recent = sortedTransactions.slice(0, 4);
    if (!searchQuery) return recent;
    return recent.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.counterparty.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedTransactions, searchQuery]);

  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthNameRaw = typeof Intl !== 'undefined' ? new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(currentDate) : "Mois";
  const currentMonthName = monthNameRaw.charAt(0).toUpperCase() + monthNameRaw.slice(1);
  const currentMonthDisplay = `${currentMonthName} ${currentYear}`;

  const calculatedExpiryDate = `${String(currentMonthIndex + 1).padStart(2, '0')}/${String(currentYear + 3).slice(-2)}`;

  const currentMonthTxns = useMemo(() => {
    return safeTransactions.filter(t => {
      const d = new Date(t.createdAt);
      return d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear;
    });
  }, [safeTransactions, currentMonthIndex, currentYear]);

  const totalDepensesMois = useMemo(() => 
    currentMonthTxns.filter(t => t.kind === "debit").reduce((sum, t) => sum + t.amount, 0),
  [currentMonthTxns]);

  const totalRevenusMois = useMemo(() => 
    currentMonthTxns.filter(t => t.kind === "credit").reduce((sum, t) => sum + t.amount, 0),
  [currentMonthTxns]);

  const { chartGradient, chartTags, chartTotal } = useMemo(() => {
    const targetTxns = currentMonthTxns.filter(t => t.kind === chartMode);
    const total = targetTxns.reduce((sum, t) => sum + t.amount, 0);

    if (total === 0) {
      return { chartGradient: "conic-gradient(#F3F4F6 0% 100%)", chartTags: [], chartTotal: 0 };
    }

    const grouped = targetTxns.reduce((acc, t) => {
      const cat = t.title || "Autre";
      acc[cat] = (acc[cat] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const sortedCategories = Object.entries(grouped).sort((a, b) => b[1] - a[1]);

    let currentPercentage = 0;
    const gradientStops: string[] = [];
    
    const tags = sortedCategories.map(([label, amount], index) => {
      const percentage = (amount / total) * 100;
      const nextPercentage = currentPercentage + percentage;
      
      const color = CHART_COLORS[index % CHART_COLORS.length];
      const bgColor = CHART_BG_COLORS[index % CHART_BG_COLORS.length];
      
      gradientStops.push(`${color} ${currentPercentage}% ${nextPercentage}%`);
      currentPercentage = nextPercentage;
      
      return {
        label: `${label} ${Math.round(percentage)}%`,
        textColor: color,
        bgColor: bgColor
      };
    });

    return {
      chartGradient: `conic-gradient(${gradientStops.join(", ")})`,
      chartTags: tags,
      chartTotal: total
    };
  }, [currentMonthTxns, chartMode]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-MA", { day: "2-digit", month: "short" }) + ", " + d.toLocaleTimeString("fr-MA", { hour: "2-digit", minute: "2-digit" });
  };

  const handleNumpadClick = (key: string) => {
    if (isTransferring || transferSuccess) return;

    if (key === "x") {
      setQuickAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else if (key === ",") {
      if (!quickAmount.includes(",")) {
        setQuickAmount((prev) => prev + ",");
      }
    } else {
      setQuickAmount((prev) => {
        if (prev === "0") return key;
        if (prev.length >= 7) return prev; 
        return prev + key;
      });
    }
  };

  const handleQuickTransferSubmit = async () => {
    const sanitizedAmount = quickAmount.replace(",", ".");
    const numericAmount = Number(sanitizedAmount);

    if (numericAmount > 0 && selectedRecipient) {
      setIsTransferring(true);

      try {
        const recipientObj = quickRecipients.find(r => r.initial === selectedRecipient);
        const beneficiaryName = recipientObj ? recipientObj.name : `Contact ${selectedRecipient}`;

        await addTransfer({
          beneficiary: beneficiaryName,
          ibanRib: "MA00 0000 0000 0000",
          amount: numericAmount,
          currency: profile!.currency,
          bank: "Virement Rapide",
          timing: "immediate",
          reason: "Virement rapide depuis le tableau de bord"
        });

        setIsTransferring(false);
        setTransferSuccess(true);

        setTimeout(() => {
          setTransferSuccess(false);
          setQuickAmount("0");
          setSelectedRecipient(null);
        }, 2500);

      } catch (error) {
        setIsTransferring(false);
      }
    }
  };

  const handleCreateCard = () => {
    if (!newCardName.trim()) return;
    setIsCreatingCard(true);

    setTimeout(() => {
      const randomPan = `•••• ${Math.floor(1000 + Math.random() * 9000)}`;
      const randomBalance = Math.floor(Math.random() * 20000);

      if (addCard) {
        addCard({
          id: `card-${Date.now()}`,
          name: newCardName,
          network: newCardNetwork,
          maskedPan: randomPan,
          balance: randomBalance,
          currency: profile!.currency,
          theme: newCardTheme
        });
      }

      setIsCreatingCard(false);
      setIsCardModalOpen(false);
      setNewCardName("");
    }, 800); 
  };


  if (!isMounted || !profile) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  const welcomeText = profile.gender === "Female" 
    ? `Bon retour, Mme ${profile.firstName}` 
    : `Bon retour, M. ${profile.firstName}`;

  return (
    <section className="animate-floatIn space-y-4 md:space-y-4">
      {/* =========================================
          VUE MOBILE
      ========================================= */}
      <div className="space-y-4 lg:hidden">
        <header className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Bonjour {profile.firstName}</p>
            <h1 className="text-lg font-semibold leading-tight text-foreground">{profile.companyName}</h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#6366F1] text-sm font-semibold text-white">
            {profile.firstName[0]}
          </div>
        </header>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={15} />
          <input 
            type="text"
            placeholder="Rechercher une transaction..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-[#111827] outline-none transition-all focus:border-[#3730A3] focus:ring-1 focus:ring-[#3730A3]"
          />
        </div>

        {/* --- CARTES MOBILE (Carousel) --- */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Vos cartes</h2>
            <p className="text-xs font-medium text-[#6B7280]">Total: {profile.availableBalance.toLocaleString("fr-MA")} {profile.currency}</p>
          </div>
          <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            {profile.cards.map((card) => (
              <div key={card.id} className={`relative shrink-0 w-[260px] snap-center overflow-hidden rounded-2xl p-4 text-white shadow-md ${
                card.theme === "navy-gold" ? "bg-gradient-to-br from-[#111827] via-[#1F2937] to-[#1E3A8A]" :
                card.theme === "ocean-blue" ? "bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8]" :
                "bg-gradient-to-br from-[#34D399] via-[#10B981] to-[#0F766E]"
              }`}>
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-black/10" />
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/90">{card.name}</span>
                  <div className="flex h-6 items-center">{getNetworkLogo(card.network)}</div>
                </div>
                <p className="text-[17px] font-semibold tracking-[0.12em]">{card.maskedPan}</p>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-white/80">Solde alloué</p>
                    <p className="text-lg font-semibold">{card.balance.toLocaleString("fr-MA")} {card.currency}</p>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setIsCardModalOpen(true)}
              className="shrink-0 w-[80px] snap-center rounded-2xl border border-dashed border-border bg-[#F8FAFC] flex flex-col items-center justify-center text-[#6B7280] transition-colors hover:bg-slate-100"
            >
              <span className="text-3xl font-light mb-1">+</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button onClick={() => setActiveTab("transfers")} variant="secondary" className="justify-start text-xs">
            <ArrowUpRight size={14} className="mr-1.5" /> Virement
          </Button>
          <Button onClick={() => setActiveTab("invoices")} variant="secondary" className="justify-start text-xs">
            <FilePlus size={14} className="mr-1.5" /> Facturer
          </Button>
          <Button onClick={() => setActiveTab("invoices")} variant="secondary" className="justify-start text-xs">
            <Wallet size={14} className="mr-1.5" /> Payer
          </Button>
          <Button onClick={() => setActiveTab("documents")} variant="secondary" className="justify-start text-xs">
            <Download size={14} className="mr-1.5" /> Documents
          </Button>
        </div>

        <Card className="space-y-3 bg-white">
          <p className="text-sm font-semibold">Virement rapide</p>
          <p className="text-xs text-[#6B7280]">Sélectionnez un contact</p>
          <div className="flex items-center gap-2">
            {quickRecipients.map((recipient) => (
              <button 
                key={recipient.initial} 
                onClick={() => setSelectedRecipient(recipient.initial)}
                disabled={isTransferring || transferSuccess}
                style={{ backgroundColor: recipient.bg }} 
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-[#111827] transition-all
                  ${selectedRecipient === recipient.initial ? 'ring-2 ring-[#3730A3] ring-offset-2 scale-110' : 'opacity-80'}
                  ${(isTransferring || transferSuccess) ? 'cursor-not-allowed opacity-50' : ''}
                `}
              >
                {recipient.initial}
              </button>
            ))}
          </div>
          
          <div className="flex items-baseline gap-1 py-1">
            <p className={`text-5xl font-semibold tracking-tight transition-colors ${transferSuccess ? 'text-[#16A34A]' : 'text-[#111827]'}`}>
              {quickAmount}
            </p>
            <span className="text-lg font-medium text-[#6B7280]">{profile.currency}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "x"].map((key) => (
              <button 
                key={key} 
                onClick={() => handleNumpadClick(key)}
                disabled={isTransferring || transferSuccess}
                className="rounded-lg bg-[#F3F4F6] py-3 font-medium transition-colors active:bg-slate-300 disabled:opacity-50"
              >
                {key}
              </button>
            ))}
          </div>
          <Button 
            fullWidth 
            onClick={handleQuickTransferSubmit}
            disabled={quickAmount === "0" || !selectedRecipient || isTransferring || transferSuccess}
            className={`transition-all mt-2 ${transferSuccess ? "bg-[#16A34A] hover:bg-[#15803D] text-white" : ""}`}
          >
            {isTransferring ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={16} /> Envoi...
              </span>
            ) : transferSuccess ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 size={16} /> Envoyé !
              </span>
            ) : (
              "Envoyer"
            )}
          </Button>
        </Card>

        <Card className="bg-white">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold">Transactions en {currentMonthName}</p>
            <div className="flex items-center gap-1 rounded-full bg-[#F8FAFC] p-1 border border-border">
              <button 
                onClick={() => setChartMode("debit")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${chartMode === "debit" ? "bg-[#111827] text-white" : "text-[#6B7280]"}`}
              >
                Dépenses
              </button>
              <button 
                onClick={() => setChartMode("credit")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${chartMode === "credit" ? "bg-[#111827] text-white" : "text-[#6B7280]"}`}
              >
                Dépôts
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div 
              className="relative h-40 w-40 rounded-full p-3 shadow-inner transition-all duration-500"
              style={{ background: chartGradient }}
            >
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">
                  {chartMode === "debit" ? "Total dépenses" : "Total dépôts"}
                </p>
                <p className="text-xl font-bold text-[#111827] mt-1">
                  {chartTotal.toLocaleString("fr-MA", { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {chartTags.length > 0 ? (
                chartTags.map((tag) => (
                  <span 
                    key={tag.label} 
                    style={{ backgroundColor: tag.bgColor, color: tag.textColor }}
                    className="rounded-full px-3 py-1 text-xs font-medium border border-black/5"
                  >
                    {tag.label}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[#6B7280]">Aucune donnée.</p>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="space-y-2 bg-white">
            <div className="flex items-center gap-2 text-[#16A34A]">
              <TrendingUp size={16} />
              <p className="text-xs font-semibold text-[#111827]">Revenus totaux</p>
            </div>
            <p className="text-xl font-bold text-[#111827]">{totalRevenusMois.toLocaleString("fr-MA")} <span className="text-sm font-normal text-gray-500">{profile.currency}</span></p>
          </Card>
          <Card className="space-y-2 bg-white">
            <div className="flex items-center gap-2 text-[#EF4444]">
              <TrendingDown size={16} />
              <p className="text-xs font-semibold text-[#111827]">Dépenses totales</p>
            </div>
            <p className="text-xl font-bold text-[#111827]">{totalDepensesMois.toLocaleString("fr-MA")} <span className="text-sm font-normal text-gray-500">{profile.currency}</span></p>
          </Card>
        </div>

        <Card>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Transactions récentes</h2>
          </div>
          <ul className="space-y-2.5">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((item) => {
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
                        <p className="text-[10px] text-[#6B7280]">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={isDebit ? "text-sm font-semibold text-[#B91C1C]" : "text-sm font-semibold text-[#15803D]"}>
                        {isDebit ? "-" : "+"}{item.amount.toLocaleString("fr-MA")} {item.currency}
                      </p>
                      <p className="text-[10px] text-[#6B7280]">{item.counterparty}</p>
                    </div>
                  </li>
                );
              })
            ) : (
              <p className="text-sm text-center text-[#6B7280] py-2">Aucun résultat trouvé.</p>
            )}
          </ul>
        </Card>
      </div>

      {/* =========================================
          VUE DESKTOP
      ========================================= */}
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
            <div className="flex h-11 w-[360px] items-center gap-2 rounded-xl border border-border bg-[#F8FAFC] px-3 text-sm focus-within:border-[#3730A3] focus-within:ring-1 focus-within:ring-[#3730A3] transition-all">
              <Search size={14} className="text-[#6B7280]" />
              <input 
                type="text"
                placeholder="Rechercher une transaction..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-full w-full bg-transparent text-[#111827] outline-none placeholder:text-[#6B7280]"
              />
            </div>
            <button className="rounded-lg border border-border bg-white p-2 text-[#6B7280] transition-colors hover:bg-slate-50">
              <Bell size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3">
          {/* Solde & Cartes Desktop (FIX CAROUSEL) */}
          <Card className="col-span-6 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Solde global</p>
              <span className="rounded-full border border-border bg-[#F8FAFC] px-2.5 py-1 text-xs">{profile.currency}</span>
            </div>
            <p className="text-4xl font-semibold tracking-tight text-[#111827]">{profile.availableBalance.toLocaleString("fr-MA")} {profile.currency}</p>
            
            {/* Nouveau Carrousel Desktop (Ne s'écrase plus) */}
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
              {profile.cards.map((card) => (
                <div key={card.id} className={`relative shrink-0 w-[280px] snap-center overflow-hidden rounded-2xl p-4 text-white shadow-md ${
                  card.theme === "navy-gold" ? "bg-gradient-to-br from-[#111827] via-[#1F2937] to-[#1E3A8A]" :
                  card.theme === "ocean-blue" ? "bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8]" :
                  "bg-gradient-to-br from-[#34D399] via-[#10B981] to-[#0F766E]"
                }`}>
                  <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                  <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-black/10" />
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/90">{card.name}</span>
                    <div className="flex h-6 items-center">{getNetworkLogo(card.network)}</div>
                  </div>
                  <p className="text-[17px] font-semibold tracking-[0.12em]">{card.maskedPan}</p>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-white/80">Solde alloué</p>
                      <p className="text-lg font-semibold">{card.balance.toLocaleString("fr-MA")} {card.currency}</p>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setIsCardModalOpen(true)}
                className="shrink-0 w-[80px] snap-center rounded-2xl border border-dashed border-border bg-[#F8FAFC] flex flex-col items-center justify-center text-[#6B7280] transition-colors hover:bg-slate-100 hover:text-[#111827]"
              >
                <span className="text-3xl font-light mb-1">+</span>
                <span className="text-[10px] font-medium">Ajouter</span>
              </button>
            </div>
          </Card>

          {/* Transactions Récentes Desktop */}
          <Card className="col-span-3 space-y-2 bg-white">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Transactions</p>
              <button className="text-xs text-[#6B7280] hover:text-foreground">Voir tout</button>
            </div>
            <ul className="space-y-2">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((item) => {
                  const Icon = getIconForTransaction(item.title);
                  const isDebit = item.kind === "debit";
                  return (
                    <li key={item.id} className="flex items-center justify-between rounded-lg bg-[#F8FAFC] px-2 py-1.5 transition-colors hover:bg-slate-100">
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
                })
              ) : (
                <p className="text-xs text-center text-[#6B7280] py-4">Aucun résultat trouvé.</p>
              )}
            </ul>
          </Card>

          {/* Virement Rapide Desktop */}
          <Card className="col-span-3 space-y-3 bg-white">
            <p className="text-sm font-semibold">Virement rapide</p>
            <p className="text-xs text-[#6B7280]">Sélectionnez un contact</p>
            <div className="flex items-center gap-2">
              {quickRecipients.map((recipient) => (
                <button 
                  key={recipient.initial} 
                  onClick={() => setSelectedRecipient(recipient.initial)}
                  disabled={isTransferring || transferSuccess}
                  style={{ backgroundColor: recipient.bg }} 
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold text-[#111827] transition-all
                    ${selectedRecipient === recipient.initial ? 'ring-2 ring-[#3730A3] ring-offset-2 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}
                    ${(isTransferring || transferSuccess) ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                >
                  {recipient.initial}
                </button>
              ))}
            </div>
            
            <div className="flex items-baseline gap-1 py-1">
              <p className={`text-5xl font-semibold tracking-tight transition-colors ${transferSuccess ? 'text-[#16A34A]' : 'text-[#111827]'}`}>
                {quickAmount}
              </p>
              <span className="text-lg font-medium text-[#6B7280]">{profile.currency}</span>
            </div>
            <p className="text-xs text-[#6B7280]">Solde dispo : {profile.availableBalance.toLocaleString("fr-MA")} {profile.currency}</p>
            
            <div className="grid grid-cols-3 gap-1.5 text-center text-sm">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "x"].map((key) => (
                <button 
                  key={key} 
                  onClick={() => handleNumpadClick(key)}
                  disabled={isTransferring || transferSuccess}
                  className="rounded-lg bg-[#F3F4F6] py-2 font-medium transition-colors hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {key}
                </button>
              ))}
            </div>
            <Button 
              fullWidth 
              onClick={handleQuickTransferSubmit}
              disabled={quickAmount === "0" || !selectedRecipient || isTransferring || transferSuccess}
              className={`transition-all ${transferSuccess ? "bg-[#16A34A] hover:bg-[#15803D] text-white" : ""}`}
            >
              {isTransferring ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Envoi en cours...
                </span>
              ) : transferSuccess ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> Envoyé avec succès !
                </span>
              ) : (
                "Envoyer"
              )}
            </Button>
          </Card>

          {/* Graphique Dynamique Desktop */}
          <Card className="col-span-6 bg-white">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Transactions en {currentMonthName}</p>
              <div className="flex items-center gap-1 rounded-full bg-[#F8FAFC] p-1 border border-border">
                <button 
                  onClick={() => setChartMode("debit")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${chartMode === "debit" ? "bg-[#111827] text-white shadow-sm" : "text-[#6B7280] hover:text-foreground"}`}
                >
                  Dépenses
                </button>
                <button 
                  onClick={() => setChartMode("credit")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${chartMode === "credit" ? "bg-[#111827] text-white shadow-sm" : "text-[#6B7280] hover:text-foreground"}`}
                >
                  Dépôts
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-[180px_1fr] gap-4 items-center">
              <div 
                className="relative mx-auto h-40 w-40 rounded-full p-3 shadow-inner transition-all duration-500"
                style={{ background: chartGradient }}
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">
                    {chartMode === "debit" ? "Total dépenses" : "Total dépôts"}
                  </p>
                  <p className="text-xl font-bold text-[#111827] mt-1">
                    {chartTotal.toLocaleString("fr-MA", { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap content-start gap-2">
                {chartTags.length > 0 ? (
                  chartTags.map((tag) => (
                    <span 
                      key={tag.label} 
                      style={{ backgroundColor: tag.bgColor, color: tag.textColor }}
                      className="rounded-full px-3 py-1 text-xs font-medium shadow-sm border border-black/5"
                    >
                      {tag.label}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-[#6B7280]">Aucune donnée pour ce mois.</p>
                )}
              </div>
            </div>
          </Card>

          {/* Résumé Revenus & Dépenses Desktop */}
          <Card className="col-span-3 space-y-2 bg-white flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#16A34A]">
              <TrendingUp size={16} />
              <p className="text-sm font-semibold text-[#111827]">Revenus totaux</p>
            </div>
            <p className="text-xs text-[#6B7280]">{currentMonthDisplay}</p>
            <p className="text-2xl font-bold text-[#111827]">{totalRevenusMois.toLocaleString("fr-MA")} {profile.currency}</p>
          </Card>

          <Card className="col-span-3 space-y-2 bg-white flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#EF4444]">
              <TrendingDown size={16} />
              <p className="text-sm font-semibold text-[#111827]">Dépenses totales</p>
            </div>
            <p className="text-xs text-[#6B7280]">{currentMonthDisplay}</p>
            <p className="text-2xl font-bold text-[#111827]">{totalDepensesMois.toLocaleString("fr-MA")} {profile.currency}</p>
          </Card>
        </div>
      </div>

      {/* =========================================
          MODAL: CRÉATION DE CARTE (FIX BLUR)
      ========================================= */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="w-full max-w-md space-y-4 bg-white p-5 md:p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsCardModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Nouvelle carte</h2>
              <p className="text-sm text-gray-500">Personnalisez votre nouvelle carte professionnelle.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cardName">Nom de la carte</Label>
                <Input 
                  id="cardName" 
                  placeholder="Ex: Frais de déplacement" 
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Réseau de paiement</Label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {["VISA", "Mastercard", "Amex"].map((network) => (
                    <button
                      key={network}
                      onClick={() => setNewCardNetwork(network as any)}
                      className={`flex h-12 items-center justify-center rounded-xl border ${newCardNetwork === network ? 'border-[#3730A3] bg-[#718696] ring-1 ring-[#3730A3]' : 'border-gray-200 bg-[#061A38] hover:bg-[#27ABFC]'} transition-all`}
                    >
                      <span className="scale-75 origin-center">{getNetworkLogo(network)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Thème (Couleur)</Label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {[
                    { id: "navy-gold", bg: "bg-gradient-to-br from-[#111827] via-[#1F2937] to-[#1E3A8A]", label: "Navy" },
                    { id: "ocean-blue", bg: "bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8]", label: "Océan" },
                    { id: "emerald", bg: "bg-gradient-to-br from-[#34D399] via-[#10B981] to-[#0F766E]", label: "Émeraude" },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setNewCardTheme(theme.id as any)}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all ${newCardTheme === theme.id ? 'border-[#3730A3] bg-[#EEF2FF] ring-1 ring-[#3730A3]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                    >
                      <div className={`h-8 w-full rounded-lg ${theme.bg} shadow-sm`} />
                      <span className="text-[10px] font-medium text-gray-700">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600 border border-gray-100">
                <p>Le numéro de carte, le cryptogramme visuel, et la date d'expiration (<strong>{calculatedExpiryDate}</strong>) seront générés de manière sécurisée et liés à votre solde global.</p>
              </div>

              <div className="pt-2 flex gap-2">
                <Button variant="secondary" fullWidth onClick={() => setIsCardModalOpen(false)}>Annuler</Button>
                <Button fullWidth onClick={handleCreateCard} disabled={!newCardName.trim() || isCreatingCard}>
                  {isCreatingCard ? <Loader2 className="animate-spin" size={16} /> : "Créer la carte"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}