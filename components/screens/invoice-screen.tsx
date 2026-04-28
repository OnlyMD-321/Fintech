"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CompactSelect } from "@/components/ui/compact-select";
import { CompactDatePicker } from "@/components/ui/compact-date-picker";
import { useActiveProfile, useAppStore } from "@/store/app-store";

export function InvoiceScreen() {
  const profile = useActiveProfile();
  const { addInvoice, payInvoice, setActiveTab } = useAppStore();
  const storageReadyRef = useRef(false);
  const [mode, setMode] = useState<"create" | "pay">("create");
  const [clientName, setClientName] = useState("");
  const [ice, setIce] = useState("");
  const [address, setAddress] = useState("");
  const [invoiceObject, setInvoiceObject] = useState("");
  const [amountHT, setAmountHT] = useState<number>(15000);
  const [vat, setVat] = useState<number>(20);
  const [dueDate, setDueDate] = useState<Date | null>(new Date());
  const [sendDirectEmail, setSendDirectEmail] = useState(true);
  const [markAsPaid, setMarkAsPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceReference, setInvoiceReference] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("fintech.invoice-form");
      if (stored) {
        const parsed = JSON.parse(stored) as {
          mode?: "create" | "pay";
          clientName?: string;
          ice?: string;
          address?: string;
          invoiceObject?: string;
          amountHT?: number;
          vat?: number;
          dueDateIso?: string | null;
          sendDirectEmail?: boolean;
          markAsPaid?: boolean;
        };

        setMode(parsed.mode ?? "create");
        setClientName(parsed.clientName ?? "");
        setIce(parsed.ice ?? "");
        setAddress(parsed.address ?? "");
        setInvoiceObject(parsed.invoiceObject ?? "");
        setAmountHT(parsed.amountHT ?? 15000);
        setVat(parsed.vat ?? 20);
        setDueDate(parsed.dueDateIso ? new Date(parsed.dueDateIso) : new Date());
        setSendDirectEmail(parsed.sendDirectEmail ?? true);
        setMarkAsPaid(parsed.markAsPaid ?? false);
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
      "fintech.invoice-form",
      JSON.stringify({
        mode,
        clientName,
        ice,
        address,
        invoiceObject,
        amountHT,
        vat,
        dueDateIso: dueDate ? dueDate.toISOString() : null,
        sendDirectEmail,
        markAsPaid
      })
    );
  }, [mode, clientName, ice, address, invoiceObject, amountHT, vat, dueDate, sendDirectEmail, markAsPaid]);

  const totalTTC = useMemo(() => amountHT + amountHT * (vat / 100), [amountHT, vat]);

  const unpaidInvoices = useMemo(() => {
    if (!profile) return [];
    return profile.invoices.filter((inv) => inv.status !== "paid");
  }, [profile]);

  async function handleGenerateInvoice() {
    if (!clientName || !invoiceObject || !dueDate) return;

    try {
      setIsSubmitting(true);
      await addInvoice({
        clientName,
        invoiceObject,
        amountHT,
        vat,
        dueDate: dueDate.toISOString()
      });

      // Clear form partially
      setInvoiceObject("");
      setMarkAsPaid(false);

      // Redirect or show list
      setActiveTab("home");
    } catch (error) {
      // Handled by store
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMarkInvoicePaid() {
    if (!invoiceReference && unpaidInvoices.length === 0) return;

    try {
      setIsSubmitting(true);
      // If we have a reference input, find by reference, or just use the first unpaid for demo
      const invToPay = unpaidInvoices.find(i => i.reference === invoiceReference) || unpaidInvoices[0];
      if (invToPay) {
        await payInvoice(invToPay.id);
      }
      setInvoiceReference("");
      setActiveTab("home");
    } catch (error) {
      // Handled by store
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-3 animate-floatIn md:space-y-4">
      <header>
        <h1 className="text-xl font-semibold leading-tight md:text-2xl">
          {mode === "create" ? "Créer une facture" : "Payer une facture"}
        </h1>
        <p className="text-sm text-[#6B7280]">
          {mode === "create" ? "Remplissez les détails pour générer un PDF conforme." : "Marquez une facture reçue comme payée."}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F8FAFC] p-1.5">
        <button
          type="button"
          onClick={() => setMode("create")}
          className={mode === "create" ? "rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#3730A3] shadow-sm" : "rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280]"}
        >
          Créer
        </button>
        <button
          type="button"
          onClick={() => setMode("pay")}
          className={mode === "pay" ? "rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#3730A3] shadow-sm" : "rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280]"}
        >
          Payer
        </button>
      </div>

      {mode === "create" ? (
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="space-y-3 md:p-4">
          <h2 className="text-sm font-semibold">Détails client</h2>
          <div>
            <Label htmlFor="clientName">Nom client</Label>
            <Input id="clientName" placeholder="Société cliente" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="ice">ICE / IF</Label>
              <Input id="ice" placeholder="ICE123456789" value={ice} onChange={(e) => setIce(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" placeholder="Casablanca" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="space-y-3 md:p-4">
          <h2 className="text-sm font-semibold">Détails facture</h2>
          <div>
            <Label htmlFor="object">Objet</Label>
            <Input id="object" placeholder="Prestations juridiques" value={invoiceObject} onChange={(e) => setInvoiceObject(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="dueDate">Date d'échéance</Label>
            <CompactDatePicker value={dueDate} onChange={setDueDate} />
          </div>
        </Card>

        <Card className="space-y-3 md:p-4">
          <h2 className="text-sm font-semibold">Calcul facture</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="amountHT">Montant HT</Label>
              <Input
                id="amountHT"
                type="number"
                value={amountHT}
                onChange={(e) => setAmountHT(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="vat">TVA</Label>
              <CompactSelect
                value={`${vat}`}
                onChange={(value) => setVat(Number(value))}
                options={[
                  { label: "0%", value: "0" },
                  { label: "10%", value: "10" },
                  { label: "20%", value: "20" }
                ]}
              />
            </div>
          </div>
          <div className="rounded-lg bg-[#EEF2FF] p-3">
            <p className="text-xs text-[#4338CA]">Total TTC calculé automatiquement</p>
            <p className="text-2xl font-semibold leading-tight text-[#312E81]">{totalTTC.toLocaleString("fr-MA")} {profile?.currency ?? "DHS"}</p>
          </div>
        </Card>

        <Card className="space-y-3 md:p-4">
          <div className="flex items-center justify-between rounded-lg bg-[#F8FAFC] p-2.5">
            <span className="text-sm">Envoi direct par email</span>
            <input type="checkbox" className="h-5 w-5 accent-[#4F46E5]" checked={sendDirectEmail} onChange={(e) => setSendDirectEmail(e.target.checked)} />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[#F8FAFC] p-2.5">
            <span className="text-sm">Marquer comme payée</span>
            <input type="checkbox" className="h-5 w-5 accent-[#4F46E5]" checked={markAsPaid} onChange={(e) => setMarkAsPaid(e.target.checked)} />
          </div>

          <Button fullWidth className="h-10.5" onClick={handleGenerateInvoice} disabled={isSubmitting}>
            {isSubmitting ? "Génération..." : "Générer la facture PDF"}
          </Button>
        </Card>
      </div>
      ) : (
        <Card className="space-y-3 md:p-4">
          <div>
            <Label htmlFor="invoiceReference">Référence de la facture</Label>
            <Input
              id="invoiceReference"
              placeholder="FAC-2026-001"
              value={invoiceReference}
              onChange={(e) => setInvoiceReference(e.target.value)}
            />
          </div>
          {unpaidInvoices.length > 0 && (
            <div className="mt-2 space-y-2">
              <Label>Factures en attente</Label>
              {unpaidInvoices.map(inv => (
                <button
                  key={inv.id}
                  onClick={() => setInvoiceReference(inv.reference)}
                  className="w-full text-left p-2 rounded-lg border border-border hover:bg-mylegal-pale/30 transition text-sm"
                >
                  <p className="font-semibold">{inv.reference} - {inv.clientName}</p>
                  <p className="text-xs text-mylegal-steel">{inv.totalTTC.toLocaleString("fr-MA")} {profile?.currency}</p>
                </button>
              ))}
            </div>
          )}
          <Button fullWidth className="h-10.5" onClick={handleMarkInvoicePaid} disabled={isSubmitting || (unpaidInvoices.length === 0 && !invoiceReference)}>
            {isSubmitting ? "Traitement..." : "Marquer la facture comme payée"}
          </Button>
        </Card>
      )}
    </section>
  );
}