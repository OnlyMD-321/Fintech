import { useEffect, useRef, useState } from "react";
import { EllipsisVertical, FileText, Mail, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useActiveProfile, useAppStore } from "@/store/app-store";
import { BankingDocumentAction } from "@/services/mock-data";

export function DocumentsScreen() {
  const profile = useActiveProfile();
  const { runDocumentAction } = useAppStore();
  const storageReadyRef = useRef(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("fintech.documents-state");
      if (stored) {
        const parsed = JSON.parse(stored) as { menuFor?: string | null };
        setMenuFor(parsed.menuFor ?? null);
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
        menuFor
      })
    );
  }, [menuFor]);

  const handleDocAction = async (docId: string, action: BankingDocumentAction) => {
    try {
      await runDocumentAction(docId, action);
      setMenuFor(null);
    } catch (error) {
      // Handled by store
    }
  };

  if (!profile) return null;

  return (
    <section className="space-y-3 animate-floatIn md:space-y-4">
      <header>
        <h1 className="text-xl font-semibold leading-tight md:text-2xl">Documents</h1>
        <p className="text-sm text-[#6B7280]">Téléchargez, envoyez et partagez vos pièces financières.</p>
      </header>

      <Card className="space-y-2 md:p-4">
        {profile.documents.map((doc) => (
          <article key={doc.id} className="rounded-lg border border-border bg-white p-2.5 md:p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#3730A3] md:h-9 md:w-9">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-[#6B7280]">{doc.description}</p>
                </div>
              </div>
              <button
                onClick={() => setMenuFor((prev) => (prev === doc.id ? null : doc.id))}
                className="rounded-lg p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                <EllipsisVertical size={16} />
              </button>
            </div>

            {menuFor === doc.id && (
              <div className="mt-2 grid gap-1 rounded-lg border border-border bg-[#F8FAFC] p-1.5">
                <button
                  onClick={() => handleDocAction(doc.id, "download")}
                  className="rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground hover:bg-white"
                >
                  Télécharger PDF
                </button>
                <button
                  onClick={() => handleDocAction(doc.id, "email")}
                  className="rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground hover:bg-white"
                >
                  Envoyer par email
                </button>
                <button
                  onClick={() => handleDocAction(doc.id, "share")}
                  className="rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground hover:bg-white"
                >
                  Partager
                </button>
              </div>
            )}

            <div className="mt-2.5 grid grid-cols-3 gap-1.5">
              <Button variant="ghost" className="h-8 text-xs" onClick={() => handleDocAction(doc.id, "download")}>
                <FileText size={14} />
                PDF
              </Button>
              <Button variant="ghost" className="h-8 text-xs" onClick={() => handleDocAction(doc.id, "email")}>
                <Mail size={14} />
                Email
              </Button>
              <Button variant="ghost" className="h-8 text-xs" onClick={() => handleDocAction(doc.id, "share")}>
                <Share2 size={14} />
                Partage
              </Button>
            </div>
          </article>
        ))}
      </Card>
    </section>
  );
}