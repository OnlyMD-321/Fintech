"use client";

import { useEffect, useState } from "react";
import { 
  EllipsisVertical, 
  FileText, 
  Mail, 
  Share2, 
  Landmark, 
  FileCheck, 
  History, 
  Building2,
  Download,
  Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useActiveProfile, useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

const LOGO_URL = "https://i.ibb.co/Fk5yz9xF/logo-light.png";

const STANDARD_DOCUMENTS = [
  { id: "doc-rib", name: "RIB", description: "Relevé d'Identité Bancaire", icon: Landmark },
  { id: "doc-attestation", name: "Attestation bancaire", description: "Certificat de titularité", icon: FileCheck },
  { id: "doc-releve", name: "Relevé de compte", description: "Dernières transactions", icon: History },
  { id: "doc-kyc", name: "Statuts Société", description: "Documents juridiques", icon: Building2 }
];

export function DocumentsScreen() {
  const profile = useActiveProfile();
  const { showToast } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [processingId, setProcessingAction] = useState<string | null>(null);

  useEffect(() => { setIsMounted(true); }, []);

  // --- LOGIQUE DE CONTENU DYNAMIQUE ---
  const getDocumentTemplate = (docId: string) => {
    const dateStr = new Date().toLocaleDateString('fr-FR');
    const userName = `${profile?.firstName} ${profile?.displayName}`.toUpperCase();
    const company = profile?.companyName || "Ma Société SARL";

    switch (docId) {
      case "doc-rib":
        return `
          <div style="border: 2px solid #000; padding: 20px; margin-top: 20px;">
            <h3 style="text-align: center; border-bottom: 1px solid #eee; pb-10">RELEVÉ D'IDENTITÉ BANCAIRE</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
              <div>
                <p style="font-size: 12px; color: #666;">TITULAIRE DU COMPTE</p>
                <p><strong>${company}</strong><br/>${userName}<br/>CASABLANCA, MAROC</p>
              </div>
              <div>
                <p style="font-size: 12px; color: #666;">DOMICILIATION</p>
                <p><strong>MYLEGAL BANK AGENCE CFC</strong><br/>TOUR CFC, CASABLANCA</p>
              </div>
            </div>
            <div style="background: #f9f9f9; padding: 15px; margin-top: 20px; font-family: monospace; font-size: 16px; border: 1px dashed #ccc;">
              <p style="margin: 5px 0;">IBAN: MA64 0001 0123 4567 8901 2345 0199</p>
              <p style="margin: 5px 0;">SWIFT / BIC: MYLE MA BC XXX</p>
            </div>
          </div>`;

      case "doc-attestation":
        return `
          <div style="margin-top: 40px; line-height: 1.8;">
            <p>Fait à Casablanca, le ${dateStr}</p>
            <h2 style="text-align: center; text-decoration: underline;">ATTESTATION DE TITULARITÉ</h2>
            <p>Nous soussignés, <strong>MyLegal Banking Services</strong>, certifions par la présente que la société 
            <strong>${company}</strong>, représentée par M/Mme <strong>${userName}</strong>, est titulaire dans nos livres 
            du compte courant n° 0123456789 ouvert depuis le 01/01/2024.</p>
            <p>Cette attestation est délivrée à la demande de l'intéressé pour servir et valoir ce que de droit.</p>
            <div style="margin-top: 50px; text-align: right;">
              <p><strong>Direction des Opérations MyLegal</strong></p>
              <div style="height: 60px; color: #eee;">[Signature Numérique]</div>
            </div>
          </div>`;

      case "doc-releve":
        return `
          <div style="margin-top: 30px;">
            <h3>Derniers mouvements - Compte ${profile?.currency}</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background: #3730A3; color: white;">
                  <th style="padding: 10px; text-align: left;">Date</th>
                  <th style="padding: 10px; text-align: left;">Libellé</th>
                  <th style="padding: 10px; text-align: right;">Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px;">${dateStr}</td>
                  <td style="padding: 10px;">Virement Reçu - Client Pro</td>
                  <td style="padding: 10px; text-align: right; color: green;">+ 12 500,00</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px;">${dateStr}</td>
                  <td style="padding: 10px;">Paiement Fournisseur Telecom</td>
                  <td style="padding: 10px; text-align: right; color: red;">- 450,00</td>
                </tr>
              </tbody>
            </table>
          </div>`;

      default:
        return `<p style="margin-top: 40px;">Document officiel MyLegal certifiant les informations du profil : ${userName}</p>`;
    }
  };

  const generateDocumentFile = (docId: string, docName: string) => {
    const content = getDocumentTemplate(docId);
    
    const htmlContent = `
      <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
            <img src="${LOGO_URL}" alt="MyLegal" style="height: 50px; width: auto;" />
            <div style="text-align: right; font-size: 12px; color: #666;">
              <p style="margin:0">Document Officiel Digital</p>
              <p style="margin:0">Ref: ${Math.random().toString(36).toUpperCase().substring(2, 10)}</p>
            </div>
          </div>
          ${content}
          <div style="position: fixed; bottom: 40px; left: 40px; right: 40px; font-size: 10px; color: #aaa; text-align: center; border-top: 1px solid #eee; pt-20">
            <p>MYLEGAL SARL au capital de 100.000 MAD – Oasis Offices Latitudes Route de l’Oasis Bureau 304 Maarif Casablanca</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAction = (docId: string, docName: string, action: "download" | "share" | "email") => {
    setProcessingAction(`${docId}-${action}`);
    setMenuFor(null);

    setTimeout(() => {
      if (action === "download") generateDocumentFile(docId, docName);
      
      showToast({
        title: action === "download" ? "Téléchargement réussi" : "Action effectuée",
        description: `Le document ${docName} est prêt.`,
        variant: "success"
      });
      setProcessingAction(null);
    }, 1000);
  };

  if (!isMounted || !profile) return null;

  return (
    // pb-20 assure que le contenu n'est pas caché par la barre de navigation sur mobile
    <section className="animate-floatIn space-y-5 pb-20 md:pb-6">
      
      {/* HEADER RESPONSIVE */}
      <header className="bg-white md:bg-transparent p-5 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-100 md:border-none">
        <h1 className="text-xl font-black text-slate-900 md:text-2xl">Documents officiels</h1>
        <p className="text-sm text-slate-500 mt-1">Gérez et téléchargez vos attestations bancaires.</p>
      </header>

      {/* GRILLE ADAPTATIVE (1 colonne mobile, 2 colonnes tablette/desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {STANDARD_DOCUMENTS.map((doc) => {
          const Icon = doc.icon;
          return (
            <Card key={doc.id} className="p-4 sm:p-5 bg-white border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col">
              
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{doc.description}</p>
                  </div>
                </div>
                
                {/* MENU DÉROULANT (Position Absolue pour ne pas casser le design) */}
                <div className="relative">
                  <button 
                    onClick={() => setMenuFor(prev => prev === doc.id ? null : doc.id)} 
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <EllipsisVertical size={18} />
                  </button>

                  {menuFor === doc.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-100 rounded-xl shadow-lg z-50 p-1.5 animate-in fade-in zoom-in-95">
                       <button onClick={() => handleAction(doc.id, doc.name, "download")} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-all">
                        <Download size={14}/> Télécharger (PDF)
                       </button>
                    </div>
                  )}
                </div>
              </div>

              {/* BOUTONS D'ACTION (Grille 3 colonnes) */}
              <div className="mt-auto">
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    className="h-10 text-[11px] font-bold border-indigo-100 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 transition-colors px-0" 
                    onClick={() => handleAction(doc.id, doc.name, "download")} 
                    disabled={!!processingId}
                  >
                    {processingId === `${doc.id}-download` ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} className="mr-1.5" />}
                    PDF
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-10 text-[11px] font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 px-0" 
                    onClick={() => handleAction(doc.id, doc.name, "email")}
                  >
                    <Mail size={14} className="mr-1.5" /> Email
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-10 text-[11px] font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 px-0" 
                    onClick={() => handleAction(doc.id, doc.name, "share")}
                  >
                    <Share2 size={14} className="mr-1.5" /> Partager
                  </Button>
                </div>
              </div>

            </Card>
          );
        })}
      </div>
    </section>
  );
}