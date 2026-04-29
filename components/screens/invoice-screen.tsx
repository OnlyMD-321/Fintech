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

export function InvoiceScreen({ view }: { view: "list" | "create" }) {
  const profile = useActiveProfile();
  const { addInvoice, payInvoice, showToast, setActiveTab } = useAppStore();
  const storageReadyRef = useRef(false);
  
  const [isMounted, setIsMounted] = useState(false);
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

  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  useEffect(() => { setIsMounted(true); }, []);

  // Lecture / Sauvegarde LocalStorage (inchangé)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("fintech.invoice-form");
      if (stored) {
        const parsed = JSON.parse(stored);
        setInvoiceType(parsed.invoiceType ?? "paye");
        setClientName(parsed.clientName ?? "");
        setIce(parsed.ice ?? "");
        setAddress(parsed.address ?? "");
        setInvoiceObject(parsed.invoiceObject ?? "");
        setAmountHT(parsed.amountHT ?? 15000);
        setVat(parsed.vat ?? 20);
        setDueDate(parsed.dueDateIso ? new Date(parsed.dueDateIso) : new Date());
      }
    } catch { } finally { storageReadyRef.current = true; }
  }, []);

  useEffect(() => {
    if (storageReadyRef.current) {
      window.localStorage.setItem("fintech.invoice-form", JSON.stringify({
        invoiceType, clientName, ice, address, invoiceObject, amountHT, vat,
        dueDateIso: dueDate ? dueDate.toISOString() : null
      }));
    }
  }, [invoiceType, clientName, ice, address, invoiceObject, amountHT, vat, dueDate]);

  const totalTTC = useMemo(() => amountHT + amountHT * (vat / 100), [amountHT, vat]);

  const salesInvoices = useMemo(() => profile?.invoices.filter(inv => (inv as any).type !== "achat") || [], [profile?.invoices]);
  const purchaseInvoices = useMemo(() => profile?.invoices.filter(inv => (inv as any).type === "achat") || [], [profile?.invoices]);
  const displayedInvoices = invoiceTab === "sales" ? salesInvoices : purchaseInvoices;

  // --- FONCTION DE GÉNÉRATION DE DOCUMENT RÉEL ---
  const generateInvoiceFile = (inv: any) => {
    const dateStr = new Date(inv.createdAt).toLocaleDateString('fr-FR');
    const typeLabel = (inv as any).type === "achat" ? "FACTURE ACHAT" : "FACTURE VENTE";
    
    // Construction d'un HTML minimaliste mais pro pour le PDF
    const htmlContent = `
      <html>
        <body style="font-family: sans-serif; padding: 40px; color: #333;">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <h1 style="color: #1D4ED8; margin: 0;">MyLegal SARL</h1>
              <p>Casablanca, Maroc</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0;">${typeLabel}</h2>
              <p>Réf: ${inv.reference}</p>
              <p>Date: ${dateStr}</p>
            </div>
          </div>
          <hr style="margin: 40px 0; border: 1px solid #eee;" />
          <div style="margin-bottom: 40px;">
            <p><strong>Destinataire:</strong></p>
            <p>${inv.clientName}</p>
            <p>Objet: ${inv.invoiceObject}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #F8FAFC;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #eee;">Description</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #eee;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${inv.invoiceObject}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">${inv.amountHT.toLocaleString()} ${profile?.currency}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-left: auto; width: 250px; margin-top: 40px;">
            <div style="display: flex; justify-content: space-between; padding: 4px 0;">
              <span>Total HT:</span> <span>${inv.amountHT.toLocaleString()} ${profile?.currency}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0;">
              <span>TVA (${inv.vat}%):</span> <span>${(inv.totalTTC - inv.amountHT).toLocaleString()} ${profile?.currency}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #333; font-weight: bold; font-size: 18px;">
              <span>Total TTC:</span> <span>${inv.totalTTC.toLocaleString()} ${profile?.currency}</span>
            </div>
          </div>
          <div style="margin-top: 100px; font-size: 10px; color: #999; text-align: center;">
            Document généré par la plateforme MyLegal. Identifiant unique: ${inv.id}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${inv.reference}-${inv.clientName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function handleGenerateInvoice() {
    if (!clientName || !invoiceObject || !dueDate) return;
    try {
      setIsSubmitting(true);
      const newInvoice = {
        type: invoiceType,
        clientName, 
        invoiceObject,
        amountHT,
        vat,
        dueDate: dueDate.toISOString(),
      };
      
      await addInvoice(newInvoice);
      
      // On déclenche le téléchargement du document avec les données fraîches
      generateInvoiceFile({
        ...newInvoice,
        reference: `TEMP-${Date.now().toString().slice(-4)}`,
        totalTTC,
        createdAt: new Date().toISOString(),
        id: crypto.randomUUID()
      });

      setClientName(""); setIce(""); setAddress(""); setInvoiceObject("");
      setActiveTab("invoices");
      showToast({ title: "Facture et Document créés", description: "Le fichier a été généré avec les données réelles.", variant: "success" });
    } catch (error) { } finally { setIsSubmitting(false); }
  }

  const handleDownloadPdf = (invoice: BankingInvoice) => {
    if (downloadingInvoiceId) return; 
    setDownloadingInvoiceId(invoice.id);
    setTimeout(() => {
      generateInvoiceFile(invoice);
      showToast({ title: "Document prêt", description: `Le fichier de la facture ${invoice.reference} est disponible.`, variant: "success" });
      setDownloadingInvoiceId(null);
    }, 1000);
  };

  if (!isMounted || !profile) return null;

  if (view === "list") {
    return (
      <section className="space-y-4 animate-floatIn md:space-y-5">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold leading-tight md:text-2xl">Factures</h1>
            <p className="text-sm text-[#6B7280]">Gérez vos encaissements et vos paiements fournisseurs.</p>
          </div>
          <Button onClick={() => setActiveTab("invoices-create")} className="flex items-center gap-2 shadow-md bg-[#3730A3] hover:bg-[#312E81]">
            <Plus size={16} /> Nouvelle facture
          </Button>
        </header>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F8FAFC] p-1.5 border border-border">
          <button onClick={() => setInvoiceTab("sales")} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${invoiceTab === "sales" ? "bg-white text-[#3730A3] shadow-sm ring-1 ring-black/5" : "text-[#6B7280]"}`}>À encaisser</button>
          <button onClick={() => setInvoiceTab("purchases")} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${invoiceTab === "purchases" ? "bg-white text-[#3730A3] shadow-sm ring-1 ring-black/5" : "text-[#6B7280]"}`}>À payer</button>
        </div>

        <Card className="bg-white p-0 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {displayedInvoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600"><Receipt size={20}/></div>
                  <div>
                    <p className="text-sm font-semibold">{inv.clientName}</p>
                    <p className="text-xs text-gray-500">{inv.reference} • {inv.invoiceObject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-bold">{inv.totalTTC.toLocaleString()} {profile.currency}</p>
                  <button onClick={() => handleDownloadPdf(inv)} className="p-2 text-gray-400 hover:text-indigo-600">
                    {downloadingInvoiceId === inv.id ? <Loader2 className="animate-spin" size={18}/> : <Download size={18}/>}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-3 animate-slideInRight md:space-y-4">
      <button onClick={() => setActiveTab("invoices")} className="flex items-center text-sm font-medium text-[#6B7280] hover:text-[#111827] mb-2">
        <ArrowLeft size={16} className="mr-1.5" /> Retour au tableau de bord
      </button>
      <header>
        <h1 className="text-xl font-semibold leading-tight">Générer une facture {invoiceType === "paye" ? "de vente" : "d'achat"}</h1>
      </header>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F8FAFC] p-1.5 border border-border">
        <button onClick={() => setInvoiceType("paye")} className={invoiceType === "paye" ? "rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#3730A3] shadow-sm" : "rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280]"}>Vente</button>
        <button onClick={() => setInvoiceType("achat")} className={invoiceType === "achat" ? "rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#3730A3] shadow-sm" : "rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280]"}>Achat</button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="space-y-3 p-4 bg-white">
          <Label>Nom du tiers</Label>
          <Input placeholder="Société" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          <Label>ICE</Label>
          <Input placeholder="ICE" value={ice} onChange={(e) => setIce(e.target.value)} />
        </Card>
        <Card className="space-y-3 p-4 bg-white">
          <Label>Objet</Label>
          <Input placeholder="Prestation" value={invoiceObject} onChange={(e) => setInvoiceObject(e.target.value)} />
          <Label>Échéance</Label>
          <CompactDatePicker value={dueDate} onChange={setDueDate} />
        </Card>
        <Card className="space-y-3 p-4 bg-white">
          <div className="grid grid-cols-2 gap-2">
            <div><Label>HT</Label><Input type="number" value={amountHT} onChange={(e) => setAmountHT(Number(e.target.value))} /></div>
            <div><Label>TVA</Label><CompactSelect value={`${vat}`} onChange={(v) => setVat(Number(v))} options={[{label:"20%", value:"20"}, {label:"10%", value:"10"}, {label:"0%", value:"0"}]} /></div>
          </div>
          <div className="rounded-lg bg-indigo-50 p-3 text-indigo-900">
            <p className="text-xs uppercase font-bold opacity-60">Total TTC</p>
            <p className="text-2xl font-bold">{totalTTC.toLocaleString()} {profile.currency}</p>
          </div>
        </Card>
        <Card className="p-4 bg-white flex flex-col justify-end">
          <Button fullWidth className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleGenerateInvoice} disabled={isSubmitting || !clientName}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <FileText className="mr-2"/>}
            Générer & Télécharger
          </Button>
        </Card>
      </div>
    </section>
  );
}