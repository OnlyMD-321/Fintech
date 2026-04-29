"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CompactSelect } from "@/components/ui/compact-select";
import { CompactDatePicker } from "@/components/ui/compact-date-picker";
import { useActiveProfile, useAppStore } from "@/store/app-store";
import { ArrowLeft, CheckCircle2, Clock3, FileText, Plus, Receipt, Download, Loader2 } from "lucide-react";
import type { BankingInvoice } from "@/services/mock-data";

// 1. AJOUT DE LA PROP 'view'
export function InvoiceScreen({ view }: { view: "list" | "create" }) {
  const profile = useActiveProfile();
  
  // 2. IMPORT DE setActiveTab POUR NAVIGUER
  const { addInvoice, payInvoice, showToast, setActiveTab } = useAppStore();
  const storageReadyRef = useRef(false);
  
  const [isMounted, setIsMounted] = useState(false);

  // --- GESTION DES VUES ---
  // currentView supprimé !
  const [invoiceTab, setInvoiceTab] = useState<"sales" | "purchases">("sales");

  // --- ÉTATS DU FORMULAIRE ---
  const [invoiceType, setInvoiceType] = useState<"paye" | "achat">("paye");
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

  // État pour simuler le téléchargement individuel d'un PDF
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lecture initiale du localStorage
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("fintech.invoice-form");
      if (stored) {
        const parsed = JSON.parse(stored) as {
          invoiceType?: "paye" | "achat";
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

        setInvoiceType(parsed.invoiceType ?? "paye");
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

  // Sauvegarde dans le localStorage
  useEffect(() => {
    if (storageReadyRef.current) {
      window.localStorage.setItem(
        "fintech.invoice-form",
        JSON.stringify({
          invoiceType,
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
    }
  }, [invoiceType, clientName, ice, address, invoiceObject, amountHT, vat, dueDate, sendDirectEmail, markAsPaid]);

  const totalTTC = useMemo(() => amountHT + amountHT * (vat / 100), [amountHT, vat]);

  // --- SÉPARATION DES FACTURES ---
  const salesInvoices = useMemo(() => 
    profile?.invoices.filter(inv => (inv as any).type !== "achat") || [], 
  [profile?.invoices]);

  const purchaseInvoices = useMemo(() => 
    profile?.invoices.filter(inv => (inv as any).type === "achat") || [], 
  [profile?.invoices]);

  const displayedInvoices = invoiceTab === "sales" ? salesInvoices : purchaseInvoices;

  const totalPending = useMemo(() => 
    displayedInvoices.filter(i => i.status === "draft").reduce((sum, i) => sum + i.totalTTC, 0), 
  [displayedInvoices]);

  const totalPaid = useMemo(() => 
    displayedInvoices.filter(i => i.status === "paid").reduce((sum, i) => sum + i.totalTTC, 0), 
  [displayedInvoices]);

  if (!isMounted || !profile) return null;

  async function handleGenerateInvoice() {
    if (!clientName || !invoiceObject || !dueDate) return;

    try {
      setIsSubmitting(true);
      await addInvoice({
        type: invoiceType,
        clientName, 
        invoiceObject,
        amountHT,
        vat,
        dueDate: dueDate.toISOString(),
      });

      setClientName("");
      setIce("");
      setAddress("");
      setInvoiceObject("");
      setMarkAsPaid(false);
      
      setInvoiceTab(invoiceType === "paye" ? "sales" : "purchases");
      
      // 3. RETOUR AU DASHBOARD VIA LE STORE GLOBAL
      setActiveTab("invoices");
    } catch (error) {
      // Géré par le store
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- SIMULATION TÉLÉCHARGEMENT PDF ---
  const handleDownloadPdf = (invoice: BankingInvoice) => {
    if (downloadingInvoiceId) return; 
    
    setDownloadingInvoiceId(invoice.id);
    
    setTimeout(() => {
      showToast({
        title: "PDF généré",
        description: `La facture ${invoice.reference} a été téléchargée sur votre appareil.`,
        variant: "success"
      });
      setDownloadingInvoiceId(null);
    }, 1500);
  };

  // ==========================================
  // VUE 1 : DASHBOARD DES FACTURES (LISTE)
  // ==========================================
  if (view === "list") {
    return (
      <section className="space-y-4 animate-floatIn md:space-y-5">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold leading-tight md:text-2xl">Factures</h1>
            <p className="text-sm text-[#6B7280]">Gérez vos encaissements et vos paiements fournisseurs.</p>
          </div>
          {/* 4. NAVIGATION VERS LA CRÉATION VIA LE STORE */}
          <Button onClick={() => setActiveTab("invoices-create")} className="flex items-center gap-2 shadow-md bg-[#3730A3] hover:bg-[#312E81]">
            <Plus size={16} /> Nouvelle facture
          </Button>
        </header>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F8FAFC] p-1.5 border border-border">
          <button
            onClick={() => setInvoiceTab("sales")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${invoiceTab === "sales" ? "bg-white text-[#3730A3] shadow-sm ring-1 ring-black/5" : "text-[#6B7280] hover:text-[#111827]"}`}
          >
            À encaisser (Ventes)
          </button>
          <button
            onClick={() => setInvoiceTab("purchases")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${invoiceTab === "purchases" ? "bg-white text-[#3730A3] shadow-sm ring-1 ring-black/5" : "text-[#6B7280] hover:text-[#111827]"}`}
          >
            À payer (Achats)
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white space-y-1">
            <p className="text-xs font-medium text-[#6B7280] flex items-center gap-1.5"><Clock3 size={14} className="text-orange-500" /> En attente</p>
            <p className="text-xl font-bold text-[#111827]">{totalPending.toLocaleString("fr-MA")} {profile.currency}</p>
          </Card>
          <Card className="bg-white space-y-1">
            <p className="text-xs font-medium text-[#6B7280] flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> Payées / Encaissées</p>
            <p className="text-xl font-bold text-[#111827]">{totalPaid.toLocaleString("fr-MA")} {profile.currency}</p>
          </Card>
        </div>

        <Card className="bg-white">
          <h2 className="mb-3 text-sm font-semibold">
            {invoiceTab === "sales" ? "Liste des factures clients" : "Liste des factures fournisseurs"}
          </h2>
          
          <ul className="space-y-3">
            {displayedInvoices.length > 0 ? (
              displayedInvoices.map((inv) => (
                <li key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100/50 transition-colors gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2FF] text-[#3730A3] shrink-0">
                      <Receipt size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900 truncate">{inv.clientName}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${inv.status === "paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                          {inv.status === "paid" ? "Payée" : "En attente"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{inv.reference} • {inv.invoiceObject}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 mt-2 sm:mt-0 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200">
                    <div className="flex flex-col items-start sm:items-end">
                      <p className="text-sm font-bold text-gray-900">{inv.totalTTC.toLocaleString("fr-MA")} {profile.currency}</p>
                      {inv.status === "draft" && (
                        <button 
                          onClick={() => payInvoice(inv.id)}
                          className="text-[10px] font-medium text-[#3730A3] hover:underline mt-0.5"
                        >
                          Marquer payée
                        </button>
                      )}
                    </div>
                    
                    {/* BOUTON DE TÉLÉCHARGEMENT PDF */}
                    <button
                      onClick={() => handleDownloadPdf(inv)}
                      disabled={downloadingInvoiceId !== null}
                      title="Télécharger la facture en PDF"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
                    >
                      {downloadingInvoiceId === inv.id ? (
                        <Loader2 size={16} className="animate-spin text-[#3730A3]" />
                      ) : (
                        <Download size={16} />
                      )}
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Aucune facture trouvée.</p>
              </div>
            )}
          </ul>
        </Card>
      </section>
    );
  }

  // ==========================================
  // VUE 2 : FORMULAIRE DE CRÉATION
  // ==========================================
  return (
    <section className="space-y-3 animate-slideInRight md:space-y-4">
      {/* 5. RETOUR AU DASHBOARD VIA LE STORE GLOBAL */}
      <button 
        onClick={() => setActiveTab("invoices")} 
        className="flex items-center text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors mb-2"
      >
        <ArrowLeft size={16} className="mr-1.5" /> Retour au tableau de bord
      </button>

      <header>
        <h1 className="text-xl font-semibold leading-tight md:text-2xl">
          Générer une facture {invoiceType === "paye" ? "de vente" : "d'achat"}
        </h1>
        <p className="text-sm text-[#6B7280]">
          {invoiceType === "paye" 
            ? "Remplissez les détails pour générer une facture pour votre client." 
            : "Remplissez les détails pour enregistrer une facture de votre fournisseur."}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F8FAFC] p-1.5 border border-border">
        <button
          type="button"
          onClick={() => setInvoiceType("paye")}
          className={invoiceType === "paye" ? "rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#3730A3] shadow-sm ring-1 ring-black/5" : "rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280]"}
        >
          Facture Client (Vente)
        </button>
        <button
          type="button"
          onClick={() => setInvoiceType("achat")}
          className={invoiceType === "achat" ? "rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#3730A3] shadow-sm ring-1 ring-black/5" : "rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280]"}
        >
          Facture Fournisseur (Achat)
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="space-y-3 md:p-4 bg-white">
          <h2 className="text-sm font-semibold">
            Détails {invoiceType === "paye" ? "client" : "fournisseur"}
          </h2>
          <div>
            <Label htmlFor="clientName">
              Nom {invoiceType === "paye" ? "client" : "fournisseur"}
            </Label>
            <Input 
              id="clientName" 
              placeholder={invoiceType === "paye" ? "Société cliente" : "Société fournisseur"} 
              value={clientName} 
              onChange={(e) => setClientName(e.target.value)} 
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="ice">ICE</Label>
              <Input id="ice" placeholder="ICE123456789" value={ice} onChange={(e) => setIce(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" placeholder="Casablanca" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="space-y-3 md:p-4 bg-white">
          <h2 className="text-sm font-semibold">Détails de la facture</h2>
          <div>
            <Label htmlFor="object">Objet</Label>
            <Input id="object" placeholder={invoiceType === "paye" ? "Prestations juridiques" : "Achat de matériel"} value={invoiceObject} onChange={(e) => setInvoiceObject(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="dueDate">Date d'échéance</Label>
            <CompactDatePicker value={dueDate} onChange={setDueDate} />
          </div>
        </Card>

        <Card className="space-y-3 md:p-4 bg-white">
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
            <p className="text-2xl font-semibold leading-tight text-[#312E81]">{totalTTC.toLocaleString("fr-MA")} {profile.currency}</p>
          </div>
        </Card>

        <Card className="space-y-3 md:p-4 bg-white">
          <div className="flex items-center justify-between rounded-lg bg-[#F8FAFC] p-2.5 border border-border">
            <span className="text-sm">Envoi direct par email</span>
            <input type="checkbox" className="h-5 w-5 accent-[#4F46E5]" checked={sendDirectEmail} onChange={(e) => setSendDirectEmail(e.target.checked)} />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[#F8FAFC] p-2.5 border border-border">
            <span className="text-sm">Marquer comme payée</span>
            <input type="checkbox" className="h-5 w-5 accent-[#4F46E5]" checked={markAsPaid} onChange={(e) => setMarkAsPaid(e.target.checked)} />
          </div>

          <Button fullWidth className="h-10.5 shadow-md bg-[#3730A3] hover:bg-[#312E81]" onClick={handleGenerateInvoice} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <FileText className="mr-2" size={16} />}
            {isSubmitting ? "Génération..." : "Générer la facture"}
          </Button>
        </Card>
      </div>
    </section>
  );
}