import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Search, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CompactSelect } from "@/components/ui/compact-select";
import { CompactDatePicker } from "@/components/ui/compact-date-picker";
import { useActiveProfile, useAppStore } from "@/store/app-store";
import { CurrencyCode } from "@/services/mock-data";

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
    defaultReason: "Reglement prestation juridique"
  },
  {
    id: "said-consulting",
    name: "Said Consulting",
    initials: "SC",
    bank: "BMCE Bank of Africa",
    accountLabel: "RIB",
    accountValue: "021 780 000 124 001 009 31",
    preferredCurrency: "MAD",
    defaultReason: "Reglement facture #874"
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
    if (profile) {
      setCurrency(profile.currency);
    }
  }, [profile]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("fintech.transfer-form");
      if (stored) {
        const parsed = JSON.parse(stored) as {
          beneficiary?: string;
          ibanRib?: string;
          amount?: string;
          bank?: string;
          timing?: "immediate" | "scheduled";
          reason?: string;
          currency?: CurrencyCode;
          executionDateIso?: string | null;
        };

        setBeneficiary(parsed.beneficiary ?? "");
        setIbanRib(parsed.ibanRib ?? "");
        setAmount(parsed.amount ?? "");
        setBank(parsed.bank ?? "Attijariwafa Bank");
        setTiming(parsed.timing ?? "immediate");
        setReason(parsed.reason ?? "");
        if (parsed.currency) setCurrency(parsed.currency);
        setExecutionDate(parsed.executionDateIso ? new Date(parsed.executionDateIso) : new Date());
      }
    } catch {
      // Ignore malformed storage values.
    } finally {
      storageReadyRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!storageReadyRef.current) return;

    window.localStorage.setItem(
      "fintech.transfer-form",
      JSON.stringify({
        beneficiary,
        ibanRib,
        amount,
        bank,
        timing,
        reason,
        currency,
        executionDateIso: executionDate ? executionDate.toISOString() : null
      })
    );
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

  const bankValues = useMemo(
    () =>
      Array.from(
        new Set([
          "Attijariwafa Bank",
          "BMCE Bank of Africa",
          "Banque Populaire",
          "CIH Bank",
          ...beneficiaries.map((item) => item.bank)
        ])
      ),
    []
  );

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

    const startsWithMatches = beneficiaries.filter((item) =>
      normalizeAccount(item.accountValue).startsWith(normalizedAccountInput)
    );

    if (startsWithMatches.length) return startsWithMatches;

    return beneficiaries.filter((item) =>
      normalizeAccount(item.accountValue).includes(normalizedAccountInput)
    );
  }, [normalizedAccountInput]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!suggestionRef.current?.contains(event.target as Node)) {
        setIsSuggestionOpen(false);
      }

      if (!accountSuggestionRef.current?.contains(event.target as Node)) {
        setIsAccountSuggestionOpen(false);
      }
    }

    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isSuggestionOpen) {
      setHighlightedIndex(-1);
      return;
    }

    setHighlightedIndex(filteredBeneficiaries.length ? 0 : -1);
  }, [beneficiary, isSuggestionOpen, filteredBeneficiaries.length]);

  useEffect(() => {
    if (!isAccountSuggestionOpen) {
      setHighlightedAccountIndex(-1);
      return;
    }

    setHighlightedAccountIndex(accountSuggestions.length ? 0 : -1);
  }, [isAccountSuggestionOpen, ibanRib, accountSuggestions.length]);

  function applyBeneficiary(item: Beneficiary) {
    setBeneficiary(item.name);
    setIbanRib(item.accountValue);
    setBank(item.bank);
    setCurrency(item.preferredCurrency as CurrencyCode);
    setReason(item.defaultReason);
    setIsSuggestionOpen(false);
  }

  function normalizeAccount(value: string) {
    return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  }

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

    if (normalized.startsWith("MA")) {
      return formatIban(normalized);
    }

    if (/^\d+$/.test(normalized)) {
      return formatRib(normalized);
    }

    return normalized.match(/.{1,4}/g)?.join(" ") ?? normalized;
  }

  function findBeneficiaryByAccount(value: string) {
    const normalized = normalizeAccount(value);
    if (!normalized) return undefined;

    return beneficiaries.find((item) => normalizeAccount(item.accountValue) === normalized);
  }

  function handleAccountKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isAccountSuggestionOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setIsAccountSuggestionOpen(true);
      return;
    }

    if (!accountSuggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedAccountIndex((prev) => (prev + 1) % accountSuggestions.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedAccountIndex((prev) => (prev <= 0 ? accountSuggestions.length - 1 : prev - 1));
    }

    if (event.key === "Enter" && highlightedAccountIndex >= 0) {
      event.preventDefault();
      applyBeneficiary(accountSuggestions[highlightedAccountIndex]);
    }

    if (event.key === "Escape") {
      setIsAccountSuggestionOpen(false);
    }
  }

  function handleBeneficiaryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isSuggestionOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setIsSuggestionOpen(true);
      return;
    }

    if (!filteredBeneficiaries.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredBeneficiaries.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? filteredBeneficiaries.length - 1 : prev - 1));
    }

    if (event.key === "Enter" && highlightedIndex >= 0) {
      event.preventDefault();
      applyBeneficiary(filteredBeneficiaries[highlightedIndex]);
    }

    if (event.key === "Escape") {
      setIsSuggestionOpen(false);
    }
  }

  async function handleConfirmTransfer() {
    const numericAmount = Number(amount);

    if (!beneficiary.trim() || !ibanRib.trim() || !numericAmount || numericAmount <= 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await addTransfer({
        beneficiary,
        ibanRib,
        amount: numericAmount,
        currency,
        bank,
        timing,
        reason
      });

      // Clear form
      setBeneficiary("");
      setIbanRib("");
      setAmount("");
      setReason("");

      // Redirect
      setActiveTab("home");
    } catch (error) {
      // Error handled by store toast
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-3 animate-floatIn md:space-y-4">
      <header>
        <h1 className="text-xl font-semibold leading-tight md:text-2xl">Faire un virement</h1>
        <p className="text-sm text-[#6B7280]">Execution rapide et securisee vers vos beneficiaires.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-[1.35fr_0.85fr] md:items-start">
        <Card className="space-y-3 md:p-4">
          <div>
            <Label htmlFor="beneficiaire">Beneficiaire</Label>
            <div ref={suggestionRef} className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 text-[#9CA3AF]" size={15} />
              <Input
                id="beneficiaire"
                placeholder="Nom ou societe"
                className="pl-9"
                value={beneficiary}
                onFocus={() => setIsSuggestionOpen(true)}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setBeneficiary(nextValue);
                  setIsSuggestionOpen(true);

                  const matched = findBeneficiaryByAccount(nextValue);
                  if (matched) {
                    applyBeneficiary(matched);
                  }
                }}
                onKeyDown={handleBeneficiaryKeyDown}
                aria-autocomplete="list"
                aria-expanded={isSuggestionOpen}
              />

              {isSuggestionOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-full rounded-xl border border-border bg-white p-1 shadow-soft">
                  {filteredBeneficiaries.length ? (
                    filteredBeneficiaries.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => applyBeneficiary(item)}
                        className={
                          index === highlightedIndex
                            ? "flex w-full items-center justify-between rounded-lg bg-[#EEF2FF] px-2.5 py-2 text-left"
                            : "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left hover:bg-[#F3F4F6]"
                        }
                      >
                        <span>
                          <span className="block text-sm font-medium text-foreground">{item.name}</span>
                          <span className="block text-xs text-[#6B7280]">
                            {item.accountLabel}: {item.accountValue}
                          </span>
                        </span>
                        <span className="text-xs font-medium text-[#6B7280]">{item.bank}</span>
                      </button>
                    ))
                  ) : (
                    <p className="px-2 py-2 text-xs text-[#6B7280]">Aucun beneficiaire trouve</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="iban">IBAN / RIB</Label>
            <div ref={accountSuggestionRef} className="relative">
              <Input
                id="iban"
                placeholder="IBAN (MA..) ou RIB"
                value={ibanRib}
                onFocus={() => setIsAccountSuggestionOpen(Boolean(normalizedAccountInput))}
                onChange={(event) => {
                  const nextValue = formatAccountInput(event.target.value);
                  setIbanRib(nextValue);
                  setIsAccountSuggestionOpen(Boolean(normalizeAccount(nextValue)));

                  const matched = findBeneficiaryByAccount(nextValue);
                  if (matched) {
                    applyBeneficiary(matched);
                  }
                }}
                onKeyDown={handleAccountKeyDown}
                aria-autocomplete="list"
                aria-expanded={isAccountSuggestionOpen}
              />

              {isAccountSuggestionOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-full rounded-xl border border-border bg-white p-1 shadow-soft">
                  {accountSuggestions.length ? (
                    accountSuggestions.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => applyBeneficiary(item)}
                        className={
                          index === highlightedAccountIndex
                            ? "flex w-full items-center justify-between rounded-lg bg-[#EEF2FF] px-2.5 py-2 text-left"
                            : "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left hover:bg-[#F3F4F6]"
                        }
                      >
                        <span>
                          <span className="block text-sm font-medium text-foreground">{item.name}</span>
                          <span className="block text-xs text-[#6B7280]">
                            {item.accountLabel}: {item.accountValue}
                          </span>
                        </span>
                        <span className="text-xs font-medium text-[#6B7280]">{item.bank}</span>
                      </button>
                    ))
                  ) : (
                    <p className="px-2 py-2 text-xs text-[#6B7280]">Aucun compte correspondant</p>
                  )}
                </div>
              )}
            </div>
            <p className="mt-1 text-[11px] text-[#6B7280]">
              {accountNature === "IBAN" && "Format detecte: IBAN. Espaces appliques automatiquement."}
              {accountNature === "RIB" && "Format detecte: RIB. Espaces appliques automatiquement."}
              {accountNature === "UNKNOWN" && "Ce champ accepte IBAN et RIB."}
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <Label>Banque</Label>
              <CompactSelect
                value={bank}
                onChange={setBank}
                options={bankValues.map((item) => ({ label: item, value: item }))}
              />
            </div>

            <div>
              <Label htmlFor="motif">Motif</Label>
              <Input
                id="motif"
                placeholder="Reglement facture #874"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Execution Date</Label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F8FAFC] p-1.5">
              <button
                type="button"
                onClick={() => setTiming("immediate")}
                className={timing === "immediate" ? "rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#3730A3] shadow-sm" : "rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280]"}
              >
                Immediate
              </button>
              <button
                type="button"
                onClick={() => setTiming("scheduled")}
                className={timing === "scheduled" ? "rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#3730A3] shadow-sm" : "rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280]"}
              >
                Scheduled
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_110px] gap-2">
            <div>
              <Label htmlFor="montant">Montant</Label>
              <Input
                id="montant"
                placeholder="0.00"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div>
              <Label>Devise</Label>
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

          <div>
            <Label htmlFor="date">Date d&apos;execution</Label>
            <CompactDatePicker value={executionDate} onChange={setExecutionDate} />
            <p className="mt-1 text-[11px] text-[#6B7280]">
              {timing === "immediate" ? "Execution immediate selected." : "Execution scheduled selected."}
            </p>
          </div>

          <Button fullWidth className="h-10.5" onClick={handleConfirmTransfer} disabled={isSubmitting}>
            {isSubmitting ? "Traitement..." : "Confirmer le virement"}
          </Button>
        </Card>

        <div className="space-y-3 md:sticky md:top-0">
          <Card>
            <h2 className="mb-2.5 text-sm font-semibold">Beneficiaires favoris</h2>
            <div className="flex gap-2.5 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
              {beneficiaries.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => applyBeneficiary(item)}
                  className="flex min-w-[56px] flex-col items-center gap-1"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2FF] text-xs font-semibold text-[#3730A3]">
                    {item.initials}
                  </div>
                  <p className="text-xs text-[#6B7280]">{item.name.split(" ")[0]}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-2.5 flex items-center gap-2 text-sm font-semibold">
              <Star size={14} className="text-[#4F46E5]" />
              Virements recents
            </h2>
            <ul className="space-y-2">
              {recentTransfers.length > 0 ? (
                recentTransfers.map((item, idx) => (
                  <li key={`${item.name}-${idx}`} className="rounded-lg bg-[#F8FAFC] p-2.5">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-[#6B7280]">{item.account}</p>
                    <p className="mt-1 text-xs font-semibold text-[#1D4ED8]">{item.amount}</p>
                  </li>
                ))
              ) : (
                <p className="text-xs text-[#6B7280] px-1">Aucun virement récent.</p>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
