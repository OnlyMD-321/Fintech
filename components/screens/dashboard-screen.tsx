"use client";

import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  BadgeDollarSign,
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  Search,
  UserRound,
  X,
  Plus,
  History,
  ShieldCheck,
  FileText
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActiveProfile, useAppStore } from "@/store/app-store";
import { useState, useMemo, useEffect } from "react";
import { VisaLogo, MastercardLogo, AmexLogo } from "@/components/ui/network-logos";
import { cn } from "@/lib/utils";

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
  
  const [financePeriod, setFinancePeriod] = useState<"thisMonth" | "lastMonth" | "year">("thisMonth");

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
    const recent = sortedTransactions.slice(0, 5);
    if (!searchQuery) return recent;
    return recent.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.counterparty.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedTransactions, searchQuery]);

  const filteredFinanceData = useMemo(() => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const txns = safeTransactions.filter(t => {
      const d = new Date(t.createdAt);
      if (financePeriod === "thisMonth") return d >= startOfThisMonth;
      if (financePeriod === "lastMonth") return d >= startOfLastMonth && d <= endOfLastMonth;
      if (financePeriod === "year") return d >= startOfYear;
      return true;
    });

    const revenues = txns.filter(t => t.kind === "credit").reduce((sum, t) => sum + t.amount, 0);
    const expenses = txns.filter(t => t.kind === "debit").reduce((sum, t) => sum + t.amount, 0);
    
    return { revenues, expenses };
  }, [safeTransactions, financePeriod]);

  const tresorerieAnnuelle = useMemo(() => {
    const revenueYear = safeTransactions.filter(t => t.kind === "credit").reduce((sum, t) => sum + t.amount, 0);
    const expenseYear = safeTransactions.filter(t => t.kind === "debit").reduce((sum, t) => sum + t.amount, 0);
    return revenueYear - expenseYear;
  }, [safeTransactions]);

  const currentDate = new Date();
  const currentMonthName = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(currentDate);

  const { chartGradient, chartTags, chartTotal } = useMemo(() => {
    const targetTxns = safeTransactions.filter(t => {
        const d = new Date(t.createdAt);
        return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear() && t.kind === chartMode;
    });
    const total = targetTxns.reduce((sum, t) => sum + t.amount, 0);

    if (total === 0) return { chartGradient: "conic-gradient(#F3F4F6 0% 100%)", chartTags: [], chartTotal: 0 };

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
      return { label: `${label} ${Math.round(percentage)}%`, textColor: color, bgColor: bgColor };
    });

    return { chartGradient: `conic-gradient(${gradientStops.join(", ")})`, chartTags: tags, chartTotal: total };
  }, [safeTransactions, chartMode, currentDate]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-MA", { day: "2-digit", month: "short" }) + ", " + d.toLocaleTimeString("fr-MA", { hour: "2-digit", minute: "2-digit" });
  };

  const handleNumpadClick = (key: string) => {
    if (isTransferring || transferSuccess) return;
    if (key === "x") setQuickAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    else if (key === ",") { if (!quickAmount.includes(",")) setQuickAmount((prev) => prev + ","); }
    else setQuickAmount((prev) => (prev === "0" ? key : prev.length >= 7 ? prev : prev + key));
  };

  const handleQuickTransferSubmit = async () => {
    const sanitizedAmount = quickAmount.replace(",", ".");
    const numericAmount = Number(sanitizedAmount);
    if (numericAmount > 0 && selectedRecipient) {
      setIsTransferring(true);
      try {
        const recipientObj = quickRecipients.find(r => r.initial === selectedRecipient);
        await addTransfer({
          beneficiary: recipientObj?.name || "Contact",
          ibanRib: "MA00 0000 0000 0000",
          amount: numericAmount,
          currency: profile!.currency,
          bank: "Virement Rapide",
          timing: "immediate"
        });
        setIsTransferring(false);
        setTransferSuccess(true);
        setTimeout(() => { setTransferSuccess(false); setQuickAmount("0"); setSelectedRecipient(null); }, 2500);
      } catch (error) { setIsTransferring(false); }
    }
  };

  const handleCreateCard = () => {
    if (!newCardName.trim()) return;
    setIsCreatingCard(true);
    setTimeout(() => {
      addCard({
        id: `card-${Date.now()}`,
        name: newCardName,
        network: newCardNetwork,
        maskedPan: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
        balance: 0,
        currency: profile!.currency,
        theme: newCardTheme
      });
      setIsCreatingCard(false);
      setIsCardModalOpen(false);
      setNewCardName("");
    }, 800);
  };

  if (!isMounted || !profile) return null;

  const quickAccessButtons = (
    <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 px-1 [&::-webkit-scrollbar]:hidden scroll-smooth">
      <Button onClick={() => setActiveTab("transfers")} variant="outline" className="h-11 rounded-xl px-4 gap-2 whitespace-nowrap bg-white text-sm font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 transition-all">
        <ArrowUpRight size={16} className="text-indigo-600" /> Virement
      </Button>
      <Button onClick={() => setActiveTab("invoices-create")} variant="outline" className="h-11 rounded-xl px-4 gap-2 whitespace-nowrap bg-white text-sm font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 transition-all">
        <Plus size={16} className="text-indigo-600" /> Facture
      </Button>
      <Button onClick={() => setActiveTab("insurances")} variant="outline" className="h-11 rounded-xl px-4 gap-2 whitespace-nowrap bg-white text-sm font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 transition-all">
        <ShieldCheck size={16} className="text-indigo-600" /> Mutuelle
      </Button>
      <Button onClick={() => setActiveTab("documents")} variant="outline" className="h-11 rounded-xl px-4 gap-2 whitespace-nowrap bg-white text-sm font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 transition-all">
        <FileText size={16} className="text-indigo-600" /> RIB
      </Button>
      <Button onClick={() => setActiveTab("home")} variant="outline" className="h-11 rounded-xl px-4 gap-2 whitespace-nowrap bg-white text-sm font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 transition-all">
        <History size={16} className="text-indigo-600" /> Historique
      </Button>
    </div>
  );

  return (
    <section className="animate-floatIn space-y-5 pb-20 md:pb-6">
      
      {/* =========================================
          HEADER UNIFIÉ (S'adapte Desktop / Mobile)
      ========================================= */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-100 md:border-none">
        
        {/* Identité */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#6366F1] text-white shadow-sm font-bold text-lg">
            {profile.firstName[0]}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 md:hidden uppercase tracking-wider">Bienvenue</p>
            <p className="text-xl md:text-base font-black text-slate-900">{profile.companyName}</p>
          </div>
          <button className="ml-auto md:hidden rounded-full border border-slate-100 bg-slate-50 p-2.5 text-slate-500 hover:text-slate-900 transition-colors">
            <Bell size={18} />
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="flex items-center gap-3 md:ml-auto w-full md:w-auto">
          <div className="flex h-12 flex-1 md:w-[320px] lg:w-[380px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 md:bg-white px-4 text-sm focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all shadow-sm">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Rechercher une transaction..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-full w-full bg-transparent outline-none text-slate-700" />
          </div>
          <button className="hidden md:flex rounded-xl border border-slate-200 bg-white p-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-colors">
            <Bell size={18} />
          </button>
        </div>
      </div>

      {/* ACCÈS RAPIDES SOUS LE HEADER */}
      {quickAccessButtons}

      {/* =========================================
          GRILLE PRINCIPALE RESPONSIVE
      ========================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">
        
        {/* --- CARTE : SOLDE & CARTES --- */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-6 space-y-4 bg-white p-5 lg:p-6 border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Solde global disponible</p>
            <span className="rounded-full border border-border bg-[#F8FAFC] px-3 py-1 text-xs font-bold text-slate-600">{profile.currency}</span>
          </div>
          <p className="text-4xl lg:text-5xl font-black tracking-tight text-[#111827] mb-6">{profile.availableBalance.toLocaleString("fr-MA")} {profile.currency}</p>
          
          <div className="-mx-2 flex gap-4 overflow-x-auto px-2 pb-3 pt-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden scroll-smooth">
            {profile.cards.map((card) => (
              <div key={card.id} className={cn("relative shrink-0 w-[270px] sm:w-[290px] snap-center overflow-hidden rounded-2xl p-5 text-white shadow-md", card.theme === "navy-gold" ? "bg-slate-900" : card.theme === "ocean-blue" ? "bg-blue-600" : "bg-emerald-600")}>
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest">{card.name}</span>
                  <div className="flex h-6">{getNetworkLogo(card.network)}</div>
                </div>
                <p className="text-xl font-bold tracking-widest">{card.maskedPan}</p>
                <div className="mt-6">
                  <p className="text-[10px] opacity-80 uppercase tracking-wider mb-1">Solde alloué</p>
                  <p className="text-xl font-bold">{card.balance.toLocaleString()} {card.currency}</p>
                </div>
              </div>
            ))}
            <button onClick={() => setIsCardModalOpen(true)} className="shrink-0 w-[90px] snap-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
              <Plus size={28} className="mb-1"/>
              <span className="text-[11px] font-bold">Ajouter</span>
            </button>
          </div>
        </Card>

        {/* --- CARTE : TRANSACTIONS RÉCENTES --- */}
        <Card className="col-span-1 md:col-span-1 lg:col-span-3 space-y-3 bg-white p-5 lg:p-6 border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Transactions</p>
            <button onClick={() => setActiveTab("home")} className="text-xs text-indigo-600 font-bold hover:underline">Tout voir</button>
          </div>
          <ul className="space-y-3 flex-1 overflow-y-auto pr-1">
            {filteredTransactions.map((item) => {
              const Icon = getIconForTransaction(item.title);
              return (
                <li key={item.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"><Icon size={16} /></div>
                    <div>
                      <p className="text-[13px] font-bold truncate max-w-[120px] text-slate-900">{item.title}</p>
                      <p className="text-[10px] font-medium text-slate-400">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                  <p className={cn("text-sm font-black", item.kind === "debit" ? "text-red-600" : "text-green-600")}>
                    {item.kind === "debit" ? "-" : "+"}{item.amount.toLocaleString()}
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* --- CARTE : VIREMENT RAPIDE --- */}
        <Card className="col-span-1 md:col-span-1 lg:col-span-3 space-y-4 bg-white p-5 lg:p-6 border-slate-100 shadow-sm">
          <div>
            <p className="text-sm font-semibold mb-2">Virement rapide</p>
            <div className="flex items-center gap-2">
              {quickRecipients.map((r) => (
                <button key={r.initial} onClick={() => setSelectedRecipient(r.initial)} style={{ backgroundColor: r.bg }} className={cn("flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm", selectedRecipient === r.initial ? 'ring-2 ring-indigo-600 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100 hover:scale-105')}>{r.initial}</button>
              ))}
            </div>
          </div>
          
          <div className="flex items-baseline gap-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className={cn("text-3xl md:text-4xl font-black", transferSuccess ? 'text-green-600' : 'text-slate-900')}>{quickAmount}</p>
            <span className="text-xs font-bold text-slate-400 uppercase">{profile.currency}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "x"].map((k) => (
              <button key={k} onClick={() => handleNumpadClick(k)} className="rounded-xl bg-slate-50 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors">{k}</button>
            ))}
          </div>
          <Button fullWidth onClick={handleQuickTransferSubmit} disabled={quickAmount === "0" || !selectedRecipient || isTransferring || transferSuccess} className={cn("h-12 text-sm font-bold mt-1", transferSuccess && "bg-green-500 hover:bg-green-600")}>
            {isTransferring ? <Loader2 className="animate-spin" size={16}/> : transferSuccess ? <CheckCircle2 size={16}/> : "Envoyer les fonds"}
          </Button>
        </Card>

        {/* --- CARTE : ANALYTIQUE MENSUELLE (Graphique) --- */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-6 bg-white p-5 lg:p-6 border-slate-100 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Analytique par catégorie ({currentMonthName})</p>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button onClick={() => setChartMode("debit")} className={cn("px-3 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase", chartMode === "debit" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>Dépenses</button>
              <button onClick={() => setChartMode("credit")} className={cn("px-3 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase", chartMode === "credit" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>Revenus</button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row lg:grid lg:grid-cols-[160px_1fr] items-center gap-6 lg:gap-8">
            <div className="relative h-36 w-36 lg:h-40 lg:w-40 shrink-0 rounded-full p-3 shadow-inner" style={{ background: chartGradient }}>
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{chartMode === "debit" ? "Dépenses" : "Revenus"}</p>
                <p className="text-lg lg:text-xl font-black text-slate-900 mt-1">{chartTotal.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 w-full max-h-[140px] overflow-y-auto pr-2">
              {chartTags.map((tag) => (
                <span key={tag.label} style={{ backgroundColor: tag.bgColor, color: tag.textColor }} className="rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase border border-black/5 shadow-sm">{tag.label}</span>
              ))}
            </div>
          </div>
        </Card>

        {/* --- CARTE : RÉSUMÉ DES FLUX & TRÉSORERIE --- */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-6 bg-white p-5 lg:p-6 border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-semibold text-slate-900">Résumé des Flux</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mt-0.5">Performance financière</p>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {(["thisMonth", "lastMonth", "year"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFinancePeriod(p)}
                  className={cn("px-3 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase", financePeriod === p ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                >
                  {p === "thisMonth" ? "Ce mois" : p === "lastMonth" ? "Mois dernier" : "Année"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:grid lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="flex-1 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenus</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">+{filteredFinanceData.revenues.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-400">{profile.currency}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dépenses</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">-{filteredFinanceData.expenses.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-400">{profile.currency}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 relative flex flex-col justify-center border-t-2 sm:border-t-0 sm:border-l-2 border-slate-50 pt-5 sm:pt-0 sm:pl-8">
              <div className="mb-4">
                <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-1.5">Trésorerie Annuelle</p>
                <div className={cn("inline-flex items-center h-6 px-2.5 rounded-md text-[10px] font-black uppercase tracking-wider", tresorerieAnnuelle >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
                  {tresorerieAnnuelle >= 0 ? "Excédentaire" : "Déficitaire"}
                </div>
              </div>
              <div className="space-y-0.5">
                <p className={cn("text-4xl font-black tracking-tighter", tresorerieAnnuelle >= 0 ? "text-slate-900" : "text-red-600")}>
                  {tresorerieAnnuelle >= 0 ? "+" : ""}{tresorerieAnnuelle.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">{profile.currency}</span>
                  <div className={cn("h-1 w-1 rounded-full", tresorerieAnnuelle >= 0 ? "bg-green-500" : "bg-red-500")} />
                  <span className="text-[10px] text-slate-400 font-medium italic">Bilan global</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* =========================================
          MODAL CRÉATION DE CARTE
      ========================================= */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md space-y-5 bg-white p-6 shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setIsCardModalOpen(false)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition-colors"><X size={18} /></button>
            <h2 className="text-xl font-black text-slate-900">Nouvelle carte virtuelle</h2>
            <div className="space-y-5">
              <div>
                <Label className="text-[11px] font-bold uppercase text-slate-500 mb-1 block">Nom de la carte</Label>
                <Input placeholder="Ex: Dépenses Marketing" value={newCardName} onChange={(e) => setNewCardName(e.target.value)} className="h-11 text-sm font-medium" />
              </div>
              <div>
                <Label className="text-[11px] font-bold uppercase text-slate-500 mb-1 block">Réseau de paiement</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["VISA", "Mastercard", "Amex"].map((n) => (
                    <button key={n} onClick={() => setNewCardNetwork(n as any)} className={cn("flex h-12 items-center justify-center rounded-xl border-2 transition-all", newCardNetwork === n ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-white hover:border-slate-200')}><span className="scale-75">{getNetworkLogo(n)}</span></button>
                  ))}
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <Button variant="secondary" fullWidth onClick={() => setIsCardModalOpen(false)} className="h-11 font-bold">Annuler</Button>
                <Button fullWidth onClick={handleCreateCard} disabled={!newCardName.trim() || isCreatingCard} className="h-11 font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isCreatingCard ? <Loader2 className="animate-spin" size={16} /> : "Activer la carte"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}