import { useEffect, useRef, useState } from "react";
import { EllipsisVertical, FileText, Mail, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const documents = [
  "RIB",
  "Releve bancaire",
  "Attestation bancaire",
  "Historique",
  "Justificatifs",
  "KYC Societe"
];

export function DocumentsScreen() {
  const storageReadyRef = useRef(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("fintech.documents-state");
      if (stored) {
        const parsed = JSON.parse(stored) as { menuFor?: string | null; actionMessage?: string };
        setMenuFor(parsed.menuFor ?? null);
        setActionMessage(parsed.actionMessage ?? "");
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
      "fintech.documents-state",
      JSON.stringify({
        menuFor,
        actionMessage
      })
    );
  }, [menuFor, actionMessage]);

  function handleDocAction(docName: string, action: "pdf" | "email" | "whatsapp") {
    const labels = {
      pdf: "Telechargement PDF",
      email: "Envoi par email",
      whatsapp: "Partage WhatsApp"
    };

    setActionMessage(`${labels[action]} lance pour ${docName}.`);
    setMenuFor(null);
  }

  return (
    <section className="space-y-3 animate-floatIn md:space-y-4">
      <header>
        <h1 className="text-xl font-semibold leading-tight md:text-2xl">Documents</h1>
        <p className="text-sm text-[#6B7280]">Telechargez, envoyez et partagez vos pieces financieres.</p>
      </header>

      {actionMessage && (
        <p className="rounded-lg bg-[#EEF2FF] px-2.5 py-2 text-xs font-medium text-[#3730A3]">{actionMessage}</p>
      )}

      <Card className="space-y-2 md:p-4">
        {documents.map((name) => (
          <article key={name} className="rounded-lg border border-border bg-white p-2.5 md:p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#3730A3] md:h-9 md:w-9">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-[#6B7280]">PDF securise</p>
                </div>
              </div>
              <button
                onClick={() => setMenuFor((prev) => (prev === name ? null : name))}
                className="rounded-lg p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                <EllipsisVertical size={16} />
              </button>
            </div>

            {menuFor === name && (
              <div className="mt-2 grid gap-1 rounded-lg border border-border bg-[#F8FAFC] p-1.5">
                <button
                  onClick={() => handleDocAction(name, "pdf")}
                  className="rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground hover:bg-white"
                >
                  Telecharger PDF
                </button>
                <button
                  onClick={() => handleDocAction(name, "email")}
                  className="rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground hover:bg-white"
                >
                  Envoyer par email
                </button>
                <button
                  onClick={() => handleDocAction(name, "whatsapp")}
                  className="rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground hover:bg-white"
                >
                  Partager WhatsApp
                </button>
              </div>
            )}

            <div className="mt-2.5 grid grid-cols-3 gap-1.5">
              <Button variant="ghost" className="h-8 text-xs" onClick={() => handleDocAction(name, "pdf")}>
                <FileText size={14} />
                PDF
              </Button>
              <Button variant="ghost" className="h-8 text-xs" onClick={() => handleDocAction(name, "email")}>
                <Mail size={14} />
                Email
              </Button>
              <Button variant="ghost" className="h-8 text-xs" onClick={() => handleDocAction(name, "whatsapp")}>
                <Share2 size={14} />
                WhatsApp
              </Button>
            </div>
          </article>
        ))}
      </Card>
    </section>
  );
}
