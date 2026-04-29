"use client";

import { createPortal } from "react-dom";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Search, Star, Loader2, Send, Plus, X, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CompactSelect } from "@/components/ui/compact-select";
import { CompactDatePicker } from "@/components/ui/compact-date-picker";
import { useActiveProfile, useAppStore } from "@/store/app-store";
import { CurrencyCode } from "@/services/mock-data";
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

type Beneficiary = {
  id: string;
  name: string;
  initials: string;
  bank: string;
  accountLabel: "IBAN" | "RIB";
  accountValue: string;
  preferredCurrency: string;
  defaultReason: string;
};

// Données d'entreprises Marocaines
const initialBeneficiaries: Beneficiary[] = [
  {
    id: "atlas-consulting",
    name: "Atlas Consulting SARL",
    initials: "AC",
    bank: "Attijariwafa Bank",
    accountLabel: "IBAN",
    accountValue: "MA64 0058 1220 0304",
    preferredCurrency: "MAD",
    defaultReason: "Règlement prestation juridique"
  },
  {
    id: "maroc-telecom",
    name: "Maroc Telecom",
    initials: "MT",
    bank: "BMCE Bank of Africa",
    accountLabel: "RIB",
    accountValue: "021 780 000 124 001 009 31",
    preferredCurrency: "MAD",
    defaultReason: "Paiement facture télécom"
  },
  {
    id: "office-pro",
    name: "OfficePro Equipement",
    initials: "OP",
    bank: "Banque Populaire",
    accountLabel: "IBAN",
    accountValue: "MA78 1370 0012 0555 0160",
    preferredCurrency: "MAD",
    defaultReason: "Fournitures de bureau"
  },
  {
    id: "dgi-tresor",
    name: "Trésorerie Générale",
    initials: "TGR",
    bank: "Bank Al-Maghrib",
    accountLabel: "RIB",
    accountValue: "230 450 000 021 480 195 10",
    preferredCurrency: "MAD",
    defaultReason: "Paiement TVA"
  }
];

export function TransferScreen() {
  const profile = useActiveProfile();
  const { addTransfer, setActiveTab, showToast } = useAppStore();
  const storageReadyRef = useRef(false);
  
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(initialBeneficiaries);

  const [beneficiary, setBeneficiary] = useState("");
  const [ibanRib, setIbanRib] = useState("");
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("Attijariwafa Bank");
  const [timing, setTiming] = useState<"immediate" | "scheduled">("immediate");
  const [reason, setReason] = useState("");
  const currency: CurrencyCode = "MAD"; // Forcé en MAD
  const [executionDate, setExecutionDate] = useState<Date | null>(new Date());
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isAccountSuggestionOpen, setIsAccountSuggestionOpen] = useState(false);
  const [highlightedAccountIndex, setHighlightedAccountIndex] = useState(-1);
  
  const [isAddBeneficiaryModalOpen, setIsAddBeneficiaryModalOpen] = useState(false);
  const [newBenName, setNewBenName] = useState("");
  const [newBenAccount, setNewBenAccount] = useState("");
  const [newBenBank, setNewBenBank] = useState("Attijariwafa Bank");
  const [isAddingBen, setIsAddingBen] = useState(false);

  const suggestionRef = useRef<HTMLDivElement>(null);
  const accountSuggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("fintech.transfer-form");
      if (stored) {
        const parsed = JSON.parse(stored) as any;
        setBeneficiary(parsed.beneficiary ?? "");
        setIbanRib(parsed.ibanRib ?? "");
        setAmount(parsed.amount ?? "");
        setBank(parsed.bank ?? "Attijariwafa Bank");
        setTiming(parsed.timing ?? "immediate");
        setReason(parsed.reason ?? "");
        setExecutionDate(parsed.executionDateIso ? new Date(parsed.executionDateIso) : new Date());
      }
    } catch { } finally { storageReadyRef.current = true; }
  }, []);

  useEffect(() => {
    if (!storageReadyRef.current) return;
    window.localStorage.setItem("fintech.transfer-form", JSON.stringify({
      beneficiary, ibanRib, amount, bank, timing, reason, currency,
      executionDateIso: executionDate ? executionDate.toISOString() : null
    }));
  }, [beneficiary, ibanRib, amount, bank, timing, reason, currency, executionDate]);

  const recentTransfers = useMemo(() => {
    if (!profile) return [];
    return profile.transactions
      .filter((t) => t.kind === "debit")
      .slice(0, 3)
      .map((t) => ({
        name: t.counterparty,
        account: t.note || "Virement bancaire",
        amount: `${t.amount.toLocaleString("fr-MA")} ${t.currency}`
      }));
  }, [profile]);

  const bankValues = useMemo(() => Array.from(new Set([
    "Attijariwafa Bank", "BMCE Bank of Africa", "Banque Populaire", "CIH Bank", "Crédit Agricole du Maroc", "Société Générale Maroc", "Bank Al-Maghrib", ...beneficiaries.map((item) => item.bank)
  ])), [beneficiaries]);

  const filteredBeneficiaries = useMemo(() => {
    const query = beneficiary.trim().toLowerCase();
    if (!query) return beneficiaries;
    return beneficiaries.filter((item) => {
      const byName = item.name.toLowerCase().includes(query);
      const byAccount = item.accountValue.replaceAll(" ", "").includes(query.replaceAll(" ", ""));
      const byBank = item.bank.toLowerCase().includes(query);
      return byName || byAccount || byBank;
    });
  }, [beneficiary, beneficiaries]);

  const normalizedAccountInput = useMemo(() => normalizeAccount(ibanRib), [ibanRib]);

  const accountNature = useMemo(() => {
    if (!normalizedAccountInput) return "UNKNOWN";
    if (normalizedAccountInput.startsWith("MA")) return "IBAN";
    if (/^\d+$/.test(normalizedAccountInput)) return "RIB";
    return "UNKNOWN";
  }, [normalizedAccountInput]);

  const accountSuggestions = useMemo(() => {
    if (!normalizedAccountInput) return [] as Beneficiary[];
    const startsWithMatches = beneficiaries.filter((item) => normalizeAccount(item.accountValue).startsWith(normalizedAccountInput));
    if (startsWithMatches.length) return startsWithMatches;
    return beneficiaries.filter((item) => normalizeAccount(item.accountValue).includes(normalizedAccountInput));
  }, [normalizedAccountInput, beneficiaries]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!suggestionRef.current?.contains(event.target as Node)) setIsSuggestionOpen(false);
      if (!accountSuggestionRef.current?.contains(event.target as Node)) setIsAccountSuggestionOpen(false);
    }
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isSuggestionOpen) { setHighlightedIndex(-1); return; }
    setHighlightedIndex(filteredBeneficiaries.length ? 0 : -1);
  }, [beneficiary, isSuggestionOpen, filteredBeneficiaries.length]);

  useEffect(() => {
    if (!isAccountSuggestionOpen) { setHighlightedAccountIndex(-1); return; }
    setHighlightedAccountIndex(accountSuggestions.length ? 0 : -1);
  }, [isAccountSuggestionOpen, ibanRib, accountSuggestions.length]);

  function applyBeneficiary(item: Beneficiary) {
    setBeneficiary(item.name);
    setIbanRib(item.accountValue);
    setBank(item.bank);
    setReason(item.defaultReason);
    setIsSuggestionOpen(false);
    setIsAccountSuggestionOpen(false);
  }

  function normalizeAccount(value: string) { return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(); }

  function formatIban(raw: string) {
    const normalized = normalizeAccount(raw);
    const head = normalized.slice(0, 4);
    const tail = normalized.slice(4).match(/.{1,4}/g) ?? [];
    return [head, ...tail].filter(Boolean).join(" ").trim();
  }

  function formatRib(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 20);
    const schema = [3, 3, 3, 3, 3, 3, 2];
    const parts: string[] = [];
    let cursor = 0;
    for (const size of schema) {
      const chunk = digits.slice(cursor, cursor + size);
      if (!chunk) break;
      parts.push(chunk);
      cursor += size;
    }
    return parts.join(" ");
  }

  function formatAccountInput(value: string) {
    const normalized = normalizeAccount(value);
    if (!normalized) return "";
    if (normalized.startsWith("MA")) return formatIban(normalized);
    if (/^\d+$/.test(normalized)) return formatRib(normalized);
    return normalized.match(/.{1,4}/g)?.join(" ") ?? normalized;
  }

  function findBeneficiaryByAccount(value: string) {
    const normalized = normalizeAccount(value);
    if (!normalized) return undefined;
    return beneficiaries.find((item) => normalizeAccount(item.accountValue) === normalized);
  }

  function handleAccountKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isAccountSuggestionOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) { setIsAccountSuggestionOpen(true); return; }
    if (!accountSuggestions.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setHighlightedAccountIndex((prev) => (prev + 1) % accountSuggestions.length); }
    if (event.key === "ArrowUp") { event.preventDefault(); setHighlightedAccountIndex((prev) => (prev <= 0 ? accountSuggestions.length - 1 : prev - 1)); }
    if (event.key === "Enter" && highlightedAccountIndex >= 0) { event.preventDefault(); applyBeneficiary(accountSuggestions[highlightedAccountIndex]); }
    if (event.key === "Escape") setIsAccountSuggestionOpen(false);
  }

  function handleBeneficiaryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isSuggestionOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) { setIsSuggestionOpen(true); return; }
    if (!filteredBeneficiaries.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setHighlightedIndex((prev) => (prev + 1) % filteredBeneficiaries.length); }
    if (event.key === "ArrowUp") { event.preventDefault(); setHighlightedIndex((prev) => (prev <= 0 ? filteredBeneficiaries.length - 1 : prev - 1)); }
    if (event.key === "Enter" && highlightedIndex >= 0) { event.preventDefault(); applyBeneficiary(filteredBeneficiaries[highlightedIndex]); }
    if (event.key === "Escape") setIsSuggestionOpen(false);
  }

  const handleAddNewBeneficiary = () => {
    if (!newBenName.trim() || !newBenAccount.trim()) return;

    setIsAddingBen(true);
    setTimeout(() => {
      const newInitials = newBenName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
      const isIban = normalizeAccount(newBenAccount).startsWith("MA");

      const newBen: Beneficiary = {
        id: `ben-${Date.now()}`,
        name: newBenName,
        initials: newInitials || "NA",
        bank: newBenBank,
        accountLabel: isIban ? "IBAN" : "RIB",
        accountValue: formatAccountInput(newBenAccount),
        preferredCurrency: "MAD",
        defaultReason: "Virement"
      };

      setBeneficiaries(prev => [newBen, ...prev]);
      applyBeneficiary(newBen);

      showToast?.({ title: "Bénéficiaire ajouté", description: `${newBenName} a été enregistré avec succès.`, variant: "success" });
      
      setIsAddingBen(false);
      setIsAddBeneficiaryModalOpen(false);
      setNewBenName("");
      setNewBenAccount("");
    }, 800);
  };

  async function handleConfirmTransfer() {
    const numericAmount = Number(amount);
    if (!beneficiary.trim() || !ibanRib.trim() || !numericAmount || numericAmount <= 0) return;

    try {
      setIsSubmitting(true);
      await addTransfer({ beneficiary, ibanRib, amount: numericAmount, currency, bank, timing, reason });
      setBeneficiary(""); setIbanRib(""); setAmount(""); setReason("");
      setActiveTab("home");
    } catch (error) { } finally { setIsSubmitting(false); }
  }

  if (!profile) return null;

  return (
    <section className="animate-floatIn space-y-5 pb-20 md:pb-6 relative z-0">
      <header className="bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-100 md:border-none">
        <h1 className="text-xl font-black text-slate-900 md:text-2xl">Effectuer un virement</h1>
        <p className="text-sm text-slate-500 mt-1">Exécution rapide et sécurisée vers vos bénéficiaires.</p>
      </header>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.6fr_1fr] md:items-start">
        
        {/* ==========================================
            FORMULAIRE PRINCIPAL
        ========================================== */}
        <Card className="p-5 lg:p-6 bg-white border-slate-100 shadow-sm space-y-5 overflow-visible">
          
          <div className="space-y-5">
            <div>
              <Label htmlFor="beneficiaire" className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">Bénéficiaire</Label>
              <div ref={suggestionRef} className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  id="beneficiaire"
                  placeholder="Nom ou raison sociale de l'entreprise"
                  className="pl-10 h-11 text-sm font-medium shadow-sm"
                  value={beneficiary}
                  onFocus={() => setIsSuggestionOpen(true)}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setBeneficiary(nextValue);
                    setIsSuggestionOpen(true);
                    const matched = findBeneficiaryByAccount(nextValue);
                    if (matched) applyBeneficiary(matched);
                  }}
                  onKeyDown={handleBeneficiaryKeyDown}
                  aria-autocomplete="list"
                  aria-expanded={isSuggestionOpen}
                />

                {isSuggestionOpen && (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-[80] w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsSuggestionOpen(false);
                        setIsAddBeneficiaryModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors border border-dashed border-indigo-200 mb-2"
                    >
                      <Plus size={16} />
                      Ajouter un nouveau bénéficiaire
                    </button>

                    <div className="max-h-[220px] overflow-y-auto pr-1">
                      {filteredBeneficiaries.length ? (
                        filteredBeneficiaries.map((item, index) => (
                          <button
                            key={item.id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => applyBeneficiary(item)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors mt-1",
                              index === highlightedIndex ? "bg-slate-100" : "hover:bg-slate-50"
                            )}
                          >
                            <span>
                              <span className="block text-sm font-bold text-slate-900">{item.name}</span>
                              <span className="block text-xs font-medium text-slate-500 mt-0.5">
                                {item.accountLabel}: {item.accountValue}
                              </span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right max-w-[80px] truncate">{item.bank}</span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-3 text-xs font-medium text-slate-500 text-center">Aucun bénéficiaire enregistré trouvé</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="iban" className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">IBAN / RIB</Label>
              <div ref={accountSuggestionRef} className="relative">
                <Input
                  id="iban"
                  placeholder="Ex: MA64 0000..."
                  className="h-11 text-sm font-medium shadow-sm font-mono"
                  value={ibanRib}
                  onFocus={() => setIsAccountSuggestionOpen(Boolean(normalizedAccountInput))}
                  onChange={(event) => {
                    const nextValue = formatAccountInput(event.target.value);
                    setIbanRib(nextValue);
                    setIsAccountSuggestionOpen(Boolean(normalizeAccount(nextValue)));
                    const matched = findBeneficiaryByAccount(nextValue);
                    if (matched) applyBeneficiary(matched);
                  }}
                  onKeyDown={handleAccountKeyDown}
                  aria-autocomplete="list"
                  aria-expanded={isAccountSuggestionOpen}
                />

                {isAccountSuggestionOpen && (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-[80] w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95">
                    {accountSuggestions.length ? (
                      accountSuggestions.map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => applyBeneficiary(item)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors",
                            index === highlightedAccountIndex ? "bg-indigo-50" : "hover:bg-slate-50"
                          )}
                        >
                          <span>
                            <span className="block text-sm font-bold text-slate-900">{item.name}</span>
                            <span className="block text-xs font-medium text-slate-500 mt-0.5">
                              {item.accountLabel}: {item.accountValue}
                            </span>
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.bank}</span>
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-3 text-xs font-medium text-slate-500 text-center">Aucun compte correspondant</p>
                    )}
                  </div>
                )}
              </div>
              <p className="mt-1.5 text-[10px] font-medium text-slate-400 flex items-center gap-1">
                {accountNature === "IBAN" && "✓ Format détecté: IBAN (Espaces appliqués)"}
                {accountNature === "RIB" && "✓ Format détecté: RIB (Espaces appliqués)"}
                {accountNature === "UNKNOWN" && "Ce champ accepte les formats IBAN (MA...) et RIB marocains."}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">Banque destinataire</Label>
              <CompactSelect
                value={bank}
                onChange={setBank}
                options={bankValues.map((item) => ({ label: item, value: item }))}
              />
            </div>
            <div>
              <Label htmlFor="motif" className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">Motif du virement</Label>
              <Input
                id="motif"
                placeholder="Ex: Facture #874"
                className="h-11 text-sm font-medium shadow-sm"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">Type d'exécution</Label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setTiming("immediate")}
                className={cn("rounded-lg px-3 py-2.5 text-sm font-bold transition-all uppercase tracking-wide", timing === "immediate" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900")}
              >
                Immédiat
              </button>
              <button
                type="button"
                onClick={() => setTiming("scheduled")}
                className={cn("rounded-lg px-3 py-2.5 text-sm font-bold transition-all uppercase tracking-wide", timing === "scheduled" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900")}
              >
                Différé
              </button>
            </div>
          </div>

          {timing === "scheduled" && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="date" className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">Date d'exécution</Label>
              <CompactDatePicker value={executionDate} onChange={setExecutionDate} />
            </div>
          )}

          <div className="grid grid-cols-[1fr_80px] gap-3 pt-2">
            <div>
              <Label htmlFor="montant" className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">Montant</Label>
              <Input
                id="montant"
                placeholder="0.00"
                type="number"
                className="h-12 text-lg font-black shadow-sm"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div>
              <Label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">Devise</Label>
              <div className="flex items-center justify-center h-12 bg-slate-100 text-slate-500 font-black rounded-xl border border-slate-200 shadow-sm">
                MAD
              </div>
            </div>
          </div>

          <Button fullWidth className="h-12 text-sm shadow-md font-bold bg-indigo-600 hover:bg-indigo-700 text-white mt-4" onClick={handleConfirmTransfer} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18}/> : <Send className="mr-2" size={16}/>}
            {isSubmitting ? "Traitement en cours..." : "Confirmer le virement"}
          </Button>
        </Card>

        {/* ==========================================
            BARRE LATÉRALE (FAVORIS & RÉCENTS)
        ========================================== */}
        <div className="space-y-4 md:sticky md:top-6 z-0">
          <Card className="p-5 bg-white border-slate-100 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-900">Bénéficiaires favoris</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden scroll-smooth">
              {beneficiaries.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => applyBeneficiary(item)}
                  className="flex min-w-[64px] flex-col items-center gap-2 group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-sm font-black text-indigo-600 group-hover:scale-105 group-hover:bg-indigo-100 transition-all shadow-sm">
                    {item.initials}
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 truncate max-w-[70px]">{item.name.split(" ")[0]}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-white border-slate-100 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
              <Star size={16} className="text-indigo-500 fill-indigo-100" />
              Virements récents
            </h2>
            <ul className="space-y-3">
              {recentTransfers.length > 0 ? (
                recentTransfers.map((item, idx) => (
                  <li key={`${item.name}-${idx}`} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 transition-colors">
                    <p className="text-xs font-bold text-slate-900">{item.name}</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate">{item.account}</p>
                    <p className="mt-2 text-sm font-black text-red-600">-{item.amount}</p>
                  </li>
                ))
              ) : (
                <p className="text-xs font-medium text-slate-500 px-1 py-4 text-center">Aucun virement récent trouvé.</p>
              )}
            </ul>
          </Card>
        </div>

      </div>

      {/* =========================================
          MODAL : AJOUTER UN BÉNÉFICIAIRE
      ========================================= */}
      {isAddBeneficiaryModalOpen && (
        <ModalPortal>
          {/* FLEX-COL + ESPACE VIDE EN BAS = SCROLL SANS ÊTRE BLOQUÉ PAR NAVBAR */}
          <div className="fixed inset-0 z-[90] flex flex-col items-center sm:justify-center bg-slate-900/40 p-4 pt-[10vh] sm:pt-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            
            <Card className="w-full max-w-md shrink-0 space-y-5 bg-white p-6 shadow-2xl relative animate-in zoom-in-95">
              <button 
                onClick={() => setIsAddBeneficiaryModalOpen(false)} 
                className="absolute right-5 top-5 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              
              <div>
                <h2 className="text-xl font-black text-slate-900">Nouveau bénéficiaire</h2>
                <p className="text-xs font-medium text-slate-500 mt-1">Enregistrez un nouveau compte pour vos futurs virements.</p>
              </div>
              
              <div className="space-y-4 pb-2">
                <div>
                  <Label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 block tracking-wider">Raison sociale / Nom complet</Label>
                  <Input 
                    placeholder="Ex: Atlas Consulting SARL" 
                    value={newBenName} 
                    onChange={(e) => setNewBenName(e.target.value)} 
                    className="h-11 text-sm font-medium shadow-sm" 
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 block tracking-wider">IBAN ou RIB Marocain</Label>
                  <Input 
                    placeholder="Ex: MA64..." 
                    value={newBenAccount} 
                    onChange={(e) => setNewBenAccount(formatAccountInput(e.target.value))} 
                    className="h-11 text-sm font-medium shadow-sm font-mono" 
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 block tracking-wider">Banque</Label>
                  <CompactSelect
                    value={newBenBank}
                    onChange={setNewBenBank}
                    options={bankValues.map((item) => ({ label: item, value: item }))}
                  />
                </div>
                
                <div className="pt-2 flex gap-3">
                  <Button variant="secondary" fullWidth onClick={() => setIsAddBeneficiaryModalOpen(false)} className="h-11 font-bold">Annuler</Button>
                  <Button 
                    fullWidth 
                    onClick={handleAddNewBeneficiary} 
                    disabled={!newBenName.trim() || !newBenAccount.trim() || isAddingBen} 
                    className="h-11 font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isAddingBen ? <Loader2 className="animate-spin mr-2" size={16} /> : <Building2 className="mr-2" size={16} />}
                    {isAddingBen ? "Enregistrement..." : "Ajouter"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* SPACER INVISIBLE POUR MOBILE : Permet de scroller le modal AU DESSUS de la navbar */}
            <div className="h-32 w-full shrink-0 sm:hidden" />
          </div>
        </ModalPortal>
      )}

    </section>
  );
}