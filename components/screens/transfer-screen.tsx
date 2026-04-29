"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Search, Star, Loader2, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CompactSelect } from "@/components/ui/compact-select";
import { CompactDatePicker } from "@/components/ui/compact-date-picker";
import { useActiveProfile, useAppStore } from "@/store/app-store";
import { CurrencyCode } from "@/services/mock-data";
import { cn } from "@/lib/utils";

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

const beneficiaries: Beneficiary[] = [
  {
    id: "amina-k",
    name: "Amina K.",
    initials: "AK",
    bank: "Attijariwafa Bank",
    accountLabel: "IBAN",
    accountValue: "MA64 0058 1220 0304",
    preferredCurrency: "MAD",
    defaultReason: "Règlement prestation juridique"
  },
  {
    id: "said-consulting",
    name: "Said Consulting",
    initials: "SC",
    bank: "BMCE Bank of Africa",
    accountLabel: "RIB",
    accountValue: "021 780 000 124 001 009 31",
    preferredCurrency: "MAD",
    defaultReason: "Règlement facture #874"
  },
  {
    id: "mounia-n",
    name: "Mounia N.",
    initials: "MN",
    bank: "Banque Populaire",
    accountLabel: "IBAN",
    accountValue: "MA78 1370 0012 0555 0160",
    preferredCurrency: "EUR",
    defaultReason: "Acompte mission"
  },
  {
    id: "farah-k",
    name: "Farah K.",
    initials: "FK",
    bank: "CIH Bank",
    accountLabel: "RIB",
    accountValue: "230 450 000 021 480 195 10",
    preferredCurrency: "USD",
    defaultReason: "Remboursement avance"
  }
];

export function TransferScreen() {
  const profile = useActiveProfile();
  const { addTransfer, setActiveTab } = useAppStore();
  const storageReadyRef = useRef(false);
  
  const [beneficiary, setBeneficiary] = useState("");
  const [ibanRib, setIbanRib] = useState("");
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("Attijariwafa Bank");
  const [timing, setTiming] = useState<"immediate" | "scheduled">("immediate");
  const [reason, setReason] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>(profile?.currency ?? "MAD");
  const [executionDate, setExecutionDate] = useState<Date | null>(new Date());
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isAccountSuggestionOpen, setIsAccountSuggestionOpen] = useState(false);
  const [highlightedAccountIndex, setHighlightedAccountIndex] = useState(-1);
  
  const suggestionRef = useRef<HTMLDivElement>(null);
  const accountSuggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) setCurrency(profile.currency);
  }, [profile]);

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
        if (parsed.currency) setCurrency(parsed.currency);
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
    "Attijariwafa Bank", "BMCE Bank of Africa", "Banque Populaire", "CIH Bank", ...beneficiaries.map((item) => item.bank)
  ])), []);

  const filteredBeneficiaries = useMemo(() => {
    const query = beneficiary.trim().toLowerCase();
    if (!query) return beneficiaries;
    return beneficiaries.filter((item) => {
      const byName = item.name.toLowerCase().includes(query);
      const byAccount = item.accountValue.replaceAll(" ", "").includes(query.replaceAll(" ", ""));
      const byBank = item.bank.toLowerCase().includes(query);
      return byName || byAccount || byBank;
    });
  }, [beneficiary]);

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
  }, [normalizedAccountInput]);

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
    setCurrency(item.preferredCurrency as CurrencyCode);
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

  return (
    <section className="animate-floatIn space-y-5 pb-20 md:pb-6">
      {/* HEADER RESPONSIVE */}
      <header className="bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-100 md:border-none">
        <h1 className="text-xl font-black text-slate-900 md:text-2xl">Effectuer un virement</h1>
        <p className="text-sm text-slate-500 mt-1">Exécution rapide et sécurisée vers vos bénéficiaires.</p>
      </header>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.6fr_1fr] md:items-start">
        
        {/* ==========================================
            FORMULAIRE PRINCIPAL
        ========================================== */}
        <Card className="p-5 lg:p-6 bg-white border-slate-100 shadow-sm space-y-5">
          
          <div className="space-y-5">
            <div>
              <Label htmlFor="beneficiaire" className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">Bénéficiaire</Label>
              <div ref={suggestionRef} className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  id="beneficiaire"
                  placeholder="Nom ou raison sociale"
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
                  <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95">
                    {filteredBeneficiaries.length ? (
                      filteredBeneficiaries.map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => applyBeneficiary(item)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors",
                            index === highlightedIndex ? "bg-indigo-50" : "hover:bg-slate-50"
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
                      <p className="px-3 py-3 text-xs font-medium text-slate-500 text-center">Aucun bénéficiaire enregistré trouvé</p>
                    )}
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
                  <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95">
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
                {accountNature === "UNKNOWN" && "Ce champ accepte les formats IBAN et RIB."}
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

          <div className="grid grid-cols-[1fr_110px] gap-3 pt-2">
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
              <CompactSelect
                value={currency}
                onChange={(val) => setCurrency(val as CurrencyCode)}
                options={[
                  { label: "MAD", value: "MAD" },
                  { label: "EUR", value: "EUR" },
                  { label: "USD", value: "USD" }
                ]}
              />
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
        <div className="space-y-4 md:sticky md:top-6">
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
    </section>
  );
}