"use client";

import { createPortal } from "react-dom";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  BadgeDollarSign,
  CreditCard,
  Landmark,
  Search,
  UserRound,
  Plus,
  History,
  FileText,
  Wallet,
  X,
  Loader2,
  PieChart
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActiveProfile, useAppStore } from "@/store/app-store";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";

// --- PORTAL SÉCURISÉ (HYDRATATION SAFE) ---
function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [wrapper, setWrapper] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const div = document.createElement("div");
    div.setAttribute("data-modal-portal", "true");
    document.body.appendChild(div);
    setWrapper(div);

    return () => {
      if (document.body.contains(div)) {
        document.body.removeChild(div);
      }
    };
  }, []);

  if (!mounted || !wrapper) return null;
  return createPortal(children, wrapper);
}

const getIconForTransaction = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("virement") || t.includes("transfer") || t.includes("reçu")) return ArrowDownToLine;
  if (t.includes("fournisseur") || t.includes("supplier") || t.includes("achat") || t.includes("facture")) return Landmark;
  if (t.includes("salaire") || t.includes("salary") || t.includes("paie")) return BadgeDollarSign;
  if (t.includes("carte") || t.includes("card") || t.includes("paiement") || t.includes("pos")) return CreditCard;
  return ArrowDownToLine;
};

const CHART_COLORS = ["#2563EB", "#C26B2F", "#9E7D07", "#15803D", "#4F46E5", "#0891B2", "#BE123C"];
const CHART_BG_COLORS = ["#D9EEFF", "#FFE7D5", "#FFF7CC", "#DCFCE7", "#E0E7FF", "#CFFAFE", "#FFE4E6"];

export function DashboardScreen() {
  const profile = useActiveProfile();
  const { setActiveTab, showToast } = useAppStore();
  const addSubAccount = (useAppStore(state => (state as any).addSubAccount) as Function | undefined);

  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [txView, setTxView] = useState<"all" | "transfers">("all");
  const [chartMode, setChartMode] = useState<"debit" | "credit">("debit");
  const [financePeriod, setFinancePeriod] = useState<"thisMonth" | "lastMonth" | "year">("thisMonth");

  // --- ÉTATS POUR LA CRÉATION DE SOUS-COMPTE ---
  const [isSubAccountModalOpen, setIsSubAccountModalOpen] = useState(false);
  const [newSubAccountName, setNewSubAccountName] = useState("");
  const [allocationAmount, setAllocationAmount] = useState(""); // NOUVEAU: Montant alloué
  const [newSubAccountTheme, setNewSubAccountTheme] = useState<"navy-gold" | "ocean-blue" | "emerald">("ocean-blue");
  const [isCreatingSubAccount, setIsCreatingSubAccount] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const safeTransactions = profile?.transactions || [];

  const sortedTransactions = useMemo(() => {
    return [...safeTransactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [safeTransactions]);

  const displayedTransactions = useMemo(() => {
    let list = sortedTransactions;
    if (txView === "transfers") list = list.filter(t => t.title.toLowerCase().includes("virement"));
    if (searchQuery) {
      list = list.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.counterparty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list.slice(0, 6);
  }, [sortedTransactions, txView, searchQuery]);

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

  // --- LOGIQUE DE CRÉATION DE SOUS-COMPTE MISE À JOUR ---
  // On identifie le compte principal (soit par le flag isMain, soit le premier de la liste par défaut)
  const mainAccount = profile?.subAccounts?.find((acc: any) => acc.isMain) || profile?.subAccounts?.[0];
  const maxAllocation = mainAccount?.balance || 0;

  const handleCreateSubAccount = () => {
    const amount = Number(allocationAmount);

    if (!newSubAccountName.trim() || isNaN(amount) || amount < 0 || amount > maxAllocation) {
      showToast?.({ title: "Erreur", description: "Veuillez vérifier les informations saisies.", variant: "destructive" });
      return;
    }

    setIsCreatingSubAccount(true);

    setTimeout(() => {
      const newAccount = {
        id: `sub-${Date.now()}`,
        name: newSubAccountName,
        balance: amount, // Le solde initial est maintenant dynamique
        currency: profile!.currency,
        theme: newSubAccountTheme,
        isMain: false
      };

      if (addSubAccount) {
        addSubAccount(newAccount);
      }

      showToast?.({
        title: "Sous-compte ouvert",
        description: `Le compte "${newSubAccountName}" est provisionné avec ${amount.toLocaleString("fr-MA")} ${profile!.currency}.`,
        variant: "success"
      });

      setIsCreatingSubAccount(false);
      setIsSubAccountModalOpen(false);
      setNewSubAccountName("");
      setAllocationAmount("");
    }, 800);
  };

  if (!isMounted || !profile) return null;

  const quickAccessButtons = (
    <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 px-1 [&::-webkit-scrollbar]:hidden scroll-smooth">
      <Button onClick={() => setActiveTab("transfers")} variant={"outline" as any} className="h-11 rounded-xl px-4 gap-2 whitespace-nowrap bg-white text-sm font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 transition-all">
        <ArrowUpRight size={16} className="text-indigo-600" /> Virement
      </Button>
      <Button onClick={() => setActiveTab("invoices-create")} variant={"outline" as any} className="h-11 rounded-xl px-4 gap-2 whitespace-nowrap bg-white text-sm font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 transition-all">
        <Plus size={16} className="text-indigo-600" /> Facture
      </Button>
      <Button onClick={() => setActiveTab("cards")} variant={"outline" as any} className="h-11 rounded-xl px-4 gap-2 whitespace-nowrap bg-white text-sm font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 transition-all">
        <CreditCard size={16} className="text-indigo-600" /> Cartes
      </Button>
      <Button onClick={() => setActiveTab("documents")} variant={"outline" as any} className="h-11 rounded-xl px-4 gap-2 whitespace-nowrap bg-white text-sm font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 transition-all">
        <FileText size={16} className="text-indigo-600" /> RIB
      </Button>
      <Button onClick={() => setActiveTab("home")} variant={"outline" as any} className="h-11 rounded-xl px-4 gap-2 whitespace-nowrap bg-white text-sm font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 transition-all">
        <History size={16} className="text-indigo-600" /> Historique
      </Button>
    </div>
  );

  return (
    <section className="animate-floatIn space-y-5 pb-20 md:pb-6">
      
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-100 md:border-none">
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

      {quickAccessButtons}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">
        
        {/* --- CARTE : SOLDE & SOUS-COMPTES (MAJ Design) --- */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-6 space-y-4 bg-white p-5 lg:p-6 border-slate-100 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Solde global disponible</p>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{profile.currency}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                {profile.availableBalance.toLocaleString("fr-MA")}
              </span>
              <span className="text-sm font-bold text-slate-400 uppercase">{profile.currency}</span>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="-mx-2 flex gap-4 overflow-x-auto px-2 pb-3 pt-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden scroll-smooth">
              {profile.subAccounts?.map((acc) => (
                <div key={acc.id} className={cn("relative shrink-0 w-[270px] sm:w-[290px] snap-center overflow-hidden rounded-2xl p-5 text-white shadow-md", acc.theme === "navy-gold" ? "bg-slate-900" : acc.theme === "ocean-blue" ? "bg-blue-600" : "bg-emerald-600")}>
                  <div className="mb-5 flex items-center justify-between opacity-80">
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {(acc as any).isMain ? "Compte Principal" : "Sous-compte"}
                    </span>
                    <Wallet size={18} />
                  </div>
                  <p className="text-xl font-bold tracking-widest truncate">{acc.name}</p>
                  <div className="mt-6">
                    <p className="text-[10px] opacity-80 uppercase tracking-wider mb-1">
                      {(acc as any).isMain ? "Solde disponible" : "Solde alloué"}
                    </p>
                    <p className="text-xl font-bold">{acc.balance.toLocaleString("fr-MA")} {acc.currency}</p>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setIsSubAccountModalOpen(true)}
                className="shrink-0 w-[90px] snap-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
              >
                <Plus size={28} className="mb-1"/>
                <span className="text-[11px] font-bold">Ouvrir</span>
              </button>
            </div>
          </div>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-6 space-y-3 bg-white p-5 lg:p-6 border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-900">Activité récente</p>
            
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button 
                onClick={() => setTxView("all")} 
                className={cn("px-3 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase", txView === "all" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                Transactions
              </button>
              <button 
                onClick={() => setTxView("transfers")} 
                className={cn("px-3 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase", txView === "transfers" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                Virements
              </button>
            </div>
          </div>

          <ul className="space-y-3 flex-1 overflow-y-auto pr-1">
            {displayedTransactions.length > 0 ? (
              displayedTransactions.map((item) => {
                const Icon = getIconForTransaction(item.title);
                return (
                  <li key={item.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold truncate max-w-[150px] sm:max-w-[200px] text-slate-900">{item.title}</p>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{item.counterparty} • {formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                    <p className={cn("text-sm font-black whitespace-nowrap", item.kind === "debit" ? "text-red-600" : "text-green-600")}>
                      {item.kind === "debit" ? "-" : "+"}{item.amount.toLocaleString("fr-MA")}
                    </p>
                  </li>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <History size={32} className="mb-2 opacity-50" />
                <p className="text-xs font-medium">Aucune opération trouvée.</p>
              </div>
            )}
          </ul>
        </Card>

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
                <p className="text-lg lg:text-xl font-black text-slate-900 mt-1">{chartTotal.toLocaleString("fr-MA")}</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 w-full max-h-[140px] overflow-y-auto pr-2">
              {chartTags.map((tag) => (
                <span key={tag.label} style={{ backgroundColor: tag.bgColor, color: tag.textColor }} className="rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase border border-black/5 shadow-sm">{tag.label}</span>
              ))}
            </div>
          </div>
        </Card>

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
                  <span className="text-3xl font-black text-slate-900">+{filteredFinanceData.revenues.toLocaleString("fr-MA")}</span>
                  <span className="text-xs font-bold text-slate-400">{profile.currency}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dépenses</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">-{filteredFinanceData.expenses.toLocaleString("fr-MA")}</span>
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
                  {tresorerieAnnuelle >= 0 ? "+" : ""}{tresorerieAnnuelle.toLocaleString("fr-MA")}
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

      {/* --- MODAL DE CRÉATION DE SOUS-COMPTE MISE À JOUR --- */}
      {isSubAccountModalOpen && isMounted && (
        <ModalPortal>
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-md space-y-5 bg-white p-6 shadow-2xl relative animate-in zoom-in-95">
              <button 
                onClick={() => {
                  setIsSubAccountModalOpen(false);
                  setAllocationAmount("");
                  setNewSubAccountName("");
                }} 
                className="absolute right-5 top-5 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              
              <div>
                <h2 className="text-xl font-black text-slate-900">Nouveau sous-compte</h2>
                <p className="text-xs font-medium text-slate-500 mt-1">Séparez votre trésorerie pour mieux gérer vos budgets (ex: TVA, Salaires).</p>
              </div>
              
              <div className="space-y-5">
                <div>
                  <Label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 block tracking-wider">Nom du sous-compte</Label>
                  <Input 
                    placeholder="Ex: Provision Impôts" 
                    value={newSubAccountName} 
                    onChange={(e) => setNewSubAccountName(e.target.value)} 
                    className="h-11 text-sm font-medium shadow-sm" 
                  />
                </div>

                {/* NOUVEAU: Champ d'allocation dynamique */}
                <div>
                  <Label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 flex justify-between tracking-wider">
                    <span>Montant alloué ({profile.currency})</span>
                    <span className="text-indigo-600">Max: {maxAllocation.toLocaleString("fr-MA")}</span>
                  </Label>
                  <Input 
                    type="number" 
                    placeholder="Ex: 50000" 
                    value={allocationAmount} 
                    onChange={(e) => setAllocationAmount(e.target.value)} 
                    className={cn(
                      "h-11 text-sm font-medium shadow-sm", 
                      Number(allocationAmount) > maxAllocation ? "border-red-500 focus-visible:ring-red-100" : ""
                    )} 
                  />
                  {Number(allocationAmount) > maxAllocation && (
                    <p className="text-[10px] text-red-500 font-bold mt-1.5">Fonds insuffisants sur le compte principal.</p>
                  )}
                </div>
                
                <div>
                  <Label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 block tracking-wider">Couleur du compte</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "navy-gold", bg: "bg-slate-900", label: "Navy" },
                      { id: "ocean-blue", bg: "bg-blue-600", label: "Océan" },
                      { id: "emerald", bg: "bg-emerald-600", label: "Émeraude" }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setNewSubAccountTheme(theme.id as any)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all", 
                          newSubAccountTheme === theme.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 bg-white hover:bg-slate-50'
                        )}
                      >
                        <div className={cn("h-8 w-full rounded-lg shadow-sm", theme.bg)} />
                        <span className="text-[10px] font-bold text-slate-600">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2 flex gap-3">
                  <Button 
                    variant={"secondary" as any} 
                    className="h-11 font-bold w-full" 
                    onClick={() => {
                      setIsSubAccountModalOpen(false);
                      setAllocationAmount("");
                      setNewSubAccountName("");
                    }}
                  >
                    Annuler
                  </Button>
                  <Button 
                    className="h-11 font-bold bg-indigo-600 hover:bg-indigo-700 text-white w-full" 
                    onClick={handleCreateSubAccount} 
                    disabled={!newSubAccountName.trim() || isCreatingSubAccount || Number(allocationAmount) > maxAllocation || Number(allocationAmount) < 0 || allocationAmount === ""}
                  >
                    {isCreatingSubAccount ? <Loader2 className="animate-spin mr-2" size={16} /> : <PieChart className="mr-2" size={16} />}
                    {isCreatingSubAccount ? "Ouverture..." : "Ouvrir le compte"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </ModalPortal>
      )}
    </section>
  );
}