"use client";

import { createPortal } from "react-dom";
import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CompactSelect } from "@/components/ui/compact-select";
import { useActiveProfile, useAppStore } from "@/store/app-store";
import { 
  CreditCard, 
  Plus, 
  ArrowLeft, 
  Loader2, 
  ShieldAlert, 
  Snowflake, 
  Settings2,
  Nfc,
  CheckCircle2,
  X
} from "lucide-react";
import { VisaLogo, MastercardLogo, AmexLogo } from "@/components/ui/network-logos";
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

const getNetworkLogo = (network: string) => {
  const n = network.toLowerCase();
  if (n.includes("visa")) return <VisaLogo className="h-8 w-auto opacity-100" />;
  if (n.includes("mastercard")) return <MastercardLogo className="h-10 w-auto opacity-100" />;
  if (n.includes("amex") || n.includes("american")) return <AmexLogo className="h-8 w-auto opacity-100" />;
  return <span className="text-sm font-black tracking-widest">{network}</span>;
};

const getCardGradient = (network: string) => {
  const n = network.toLowerCase();
  if (n.includes("visa")) return "from-blue-700 via-blue-800 to-slate-900";
  if (n.includes("mastercard")) return "from-slate-800 via-slate-900 to-black";
  if (n.includes("amex")) return "from-emerald-700 via-emerald-800 to-teal-900";
  return "from-indigo-600 via-indigo-800 to-slate-900";
};

export function CardsScreen({ view }: { view: "list" | "create" }) {
  const profile = useActiveProfile();
  const { setActiveTab, addCard, showToast } = useAppStore();

  const [isMounted, setIsMounted] = useState(false);

  const [cardName, setCardName] = useState("");
  const [cardholder, setCardholder] = useState(profile?.displayName || "");
  const [network, setNetwork] = useState("VISA");
  const [limit, setLimit] = useState<number>(20000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [localCardStatuses, setLocalCardStatuses] = useState<Record<string, string>>({});
  const [localCardLimits, setLocalCardLimits] = useState<Record<string, number>>({});
  
  const [editingCard, setEditingCard] = useState<any | null>(null);
  const [newLimitValue, setNewLimitValue] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
    if (profile) setCardholder(`${profile.firstName} ${profile.displayName}`);
  }, [profile]);

  const cards = profile?.cards || [];

  const handleToggleStatus = (cardId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "frozen" : "active";
    setLocalCardStatuses(prev => ({ ...prev, [cardId]: newStatus }));
    
    showToast?.({
      title: newStatus === "frozen" ? "Carte bloquée" : "Carte débloquée",
      description: newStatus === "frozen" ? "La carte a été temporairement suspendue." : "La carte est de nouveau active.",
      variant: newStatus === "frozen" ? "default" : "success"
    });
  };

  const handleSaveLimit = () => {
    if (!editingCard) return;
    const limitNum = Number(newLimitValue);
    if (limitNum <= 0) return;

    setLocalCardLimits(prev => ({ ...prev, [editingCard.id]: limitNum }));
    
    showToast?.({ 
      title: "Plafond mis à jour", 
      description: `Le nouveau plafond de la carte est fixé à ${limitNum.toLocaleString("fr-MA")} MAD.`, 
      variant: "success" 
    });
    
    setEditingCard(null);
  };

  const handleCreateCard = () => {
    if (!cardName.trim() || !cardholder.trim() || limit <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newCard = {
        id: `card-${Date.now()}`,
        name: cardName,
        cardholder: cardholder,
        network: network,
        maskedPan: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
        expiry: `12/${new Date().getFullYear() + 3 - 2000}`,
        limit: Number(limit),
        spent: 0,
        status: "active" as const
      };

      if (addCard) addCard(newCard as any);

      setCardName("");
      setLimit(20000);
      setIsSubmitting(false);
      
      showToast?.({ title: "Carte commandée", description: "Votre nouvelle carte virtuelle est active.", variant: "success" });
      setActiveTab("cards");
    }, 1200);
  };

  const activeCount = useMemo(() => cards.filter(c => (localCardStatuses[c.id] || c.status) === "active").length, [cards, localCardStatuses]);
  const totalSpent = useMemo(() => cards.reduce((sum, c) => sum + (c.spent || 0), 0), [cards]);
  const totalLimit = useMemo(() => cards.reduce((sum, c) => sum + (localCardLimits[c.id] || c.limit || 0), 0), [cards, localCardLimits]);

  if (!isMounted || !profile) return null;

  if (view === "list") {
    return (
      <section className="animate-floatIn space-y-5 pb-20 md:pb-6 relative">
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-100 md:border-none">
          <div>
            <h1 className="text-xl font-black text-slate-900 md:text-2xl">Cartes bancaires</h1>
            <p className="text-sm text-slate-500 mt-1">Gérez vos cartes physiques et virtuelles d'entreprise.</p>
          </div>
          <Button onClick={() => setActiveTab("cards-create")} className="w-full sm:w-auto h-11 flex items-center gap-2 shadow-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus size={18} /> Nouvelle carte
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-white border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <CreditCard size={16} />
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cartes actives</p>
            </div>
            <p className="text-3xl font-black text-slate-900">
              {activeCount} <span className="text-base font-bold text-slate-400">/ {cards.length}</span>
            </p>
          </Card>

          <Card className="p-5 bg-white border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <ShieldAlert size={16} />
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dépenses du mois</p>
            </div>
            <p className="text-3xl font-black text-slate-900">
              {totalSpent.toLocaleString("fr-MA")} <span className="text-sm font-bold text-slate-400 uppercase">{profile.currency}</span>
            </p>
          </Card>

          <Card className="p-5 bg-white border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <CheckCircle2 size={16} />
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Plafond global</p>
            </div>
            <p className="text-3xl font-black text-slate-900">
              {totalLimit.toLocaleString("fr-MA")} <span className="text-sm font-bold text-slate-400 uppercase">{profile.currency}</span>
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.length > 0 ? (
            cards.map((card) => {
              const currentStatus = localCardStatuses[card.id] || card.status;
              const isFrozen = currentStatus === "frozen";
              
              const spent = card.spent || 0;
              const currentLimit = localCardLimits[card.id] || card.limit || 1;
              const progressPercentage = Math.min((spent / currentLimit) * 100, 100);

              return (
                <Card key={card.id} className="bg-white border-slate-100 shadow-sm overflow-hidden flex flex-col">
                  
                  <div className="p-5">
                    <div className={cn(
                      "relative h-48 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between overflow-hidden transition-all duration-300",
                      isFrozen ? "bg-slate-300 grayscale" : `bg-gradient-to-br ${getCardGradient(card.network)}`
                    )}>
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
                      
                      <div className="relative z-10 flex items-start justify-between">
                        <Nfc size={24} className="opacity-80 rotate-90" />
                        <div className="flex h-8 items-center">{getNetworkLogo(card.network)}</div>
                      </div>

                      <div className="relative z-10 mt-auto">
                        <p className="text-2xl font-mono font-medium tracking-[0.15em] mb-2 shadow-sm">{card.maskedPan}</p>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[9px] uppercase tracking-widest opacity-70 mb-0.5">Titulaire</p>
                            <p className="text-sm font-bold tracking-wider uppercase truncate max-w-[150px]">{card.cardholder || profile.displayName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] uppercase tracking-widest opacity-70 mb-0.5">Expire</p>
                            <p className="text-sm font-bold tracking-wider">{card.expiry || "12/28"}</p>
                          </div>
                        </div>
                      </div>

                      {isFrozen && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                          <div className="bg-white/90 text-slate-900 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Snowflake size={14} /> Bloquée
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{card.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.network} Business</p>
                      </div>
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest",
                        isFrozen ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
                      )}>
                        {isFrozen ? "Suspendue" : "Active"}
                      </span>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-slate-700">{spent.toLocaleString("fr-MA")} {profile.currency}</span>
                        <span className="font-medium text-slate-400">/ {currentLimit.toLocaleString("fr-MA")}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-500", progressPercentage > 85 ? "bg-red-500" : "bg-indigo-500")}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-medium text-slate-400 mt-1.5 text-right">Dépenses ce mois</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <Button 
                        variant="outline" 
                        className={cn(
                          "h-10 text-xs font-bold border-slate-200 shadow-sm transition-colors",
                          isFrozen ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        )}
                        onClick={() => handleToggleStatus(card.id, currentStatus)}
                      >
                        {isFrozen ? <CheckCircle2 size={16} className="mr-2"/> : <Snowflake size={16} className="mr-2"/>}
                        {isFrozen ? "Débloquer" : "Bloquer"}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-10 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                        onClick={() => {
                          setEditingCard(card);
                          setNewLimitValue((localCardLimits[card.id] || card.limit || 0).toString());
                        }}
                      >
                        <Settings2 size={16} className="mr-2" />
                        Plafonds
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-100">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                 <CreditCard size={24} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">Aucune carte trouvée.</p>
            </div>
          )}
        </div>

        {editingCard && (
          <ModalPortal>
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <Card className="w-full max-w-sm space-y-5 bg-white p-6 shadow-2xl relative animate-in zoom-in-95">
                <button 
                  onClick={() => setEditingCard(null)} 
                  className="absolute right-5 top-5 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
                
                <div>
                  <h2 className="text-xl font-black text-slate-900">Gérer le plafond</h2>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    Carte se terminant par <span className="font-bold text-slate-700">{editingCard.maskedPan.split(" ")[1]}</span>
                  </p>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <Label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 block tracking-wider">
                      Nouveau plafond mensuel (MAD)
                    </Label>
                    <Input 
                      type="number" 
                      value={newLimitValue} 
                      onChange={(e) => setNewLimitValue(e.target.value)} 
                      className="h-12 text-lg font-bold shadow-sm" 
                    />
                  </div>
                  
                  <div className="pt-2 flex gap-3">
                    <Button variant="secondary" fullWidth onClick={() => setEditingCard(null)} className="h-11 font-bold">Annuler</Button>
                    <Button fullWidth onClick={handleSaveLimit} className="h-11 font-bold bg-indigo-600 hover:bg-indigo-700 text-white">Sauvegarder</Button>
                  </div>
                </div>
              </Card>
            </div>
          </ModalPortal>
        )}

      </section>
    );
  }

  return (
    <section className="animate-slideInRight space-y-5 pb-20 md:pb-6">
      <button 
        onClick={() => setActiveTab("cards")} 
        className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2"
      >
        <ArrowLeft size={16} className="mr-1.5" /> Retour
      </button>

      <header className="bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-100 md:border-none">
        <h1 className="text-xl font-black text-slate-900 md:text-2xl">Nouvelle carte bancaire</h1>
        <p className="text-sm text-slate-500 mt-1">Créez instantanément une nouvelle carte physique ou virtuelle pour votre équipe.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5 lg:p-6 bg-white border-slate-100 shadow-sm space-y-5">
          <div>
            <Label htmlFor="cardName" className="text-xs font-bold uppercase text-slate-500 tracking-wider">Nom de la carte (Usage)</Label>
            <Input 
              id="cardName" 
              placeholder="Ex: Frais de déplacement" 
              value={cardName} 
              onChange={(e) => setCardName(e.target.value)} 
              className="mt-1.5 h-11 text-sm font-medium shadow-sm"
            />
          </div>
          <div>
            <Label htmlFor="cardholder" className="text-xs font-bold uppercase text-slate-500 tracking-wider">Nom du titulaire</Label>
            <Input 
              id="cardholder" 
              placeholder="Ex: Ahmed Bennani" 
              value={cardholder} 
              onChange={(e) => setCardholder(e.target.value)} 
              className="mt-1.5 h-11 text-sm font-medium shadow-sm"
            />
          </div>
        </Card>

        <Card className="p-5 lg:p-6 bg-white border-slate-100 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Réseau</Label>
                <div className="mt-1.5">
                  <CompactSelect
                    value={network}
                    onChange={(val) => setNetwork(val)}
                    options={[
                      { label: "VISA Corporate", value: "VISA" },
                      { label: "Mastercard Business", value: "Mastercard" },
                      { label: "Amex Platinum", value: "Amex" }
                    ]}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Plafond mensuel</Label>
                <Input 
                  type="number" 
                  value={limit} 
                  onChange={(e) => setLimit(Number(e.target.value))} 
                  className="mt-1.5 h-11 text-sm font-medium shadow-sm"
                />
              </div>
            </div>

            <div className="rounded-xl bg-indigo-50/50 p-4 flex gap-3 border border-indigo-100">
               <ShieldAlert className="text-indigo-600 shrink-0 mt-0.5" size={18} />
               <div>
                 <p className="text-sm font-bold text-indigo-900">Carte Virtuelle Instantanée</p>
                 <p className="text-xs font-medium text-indigo-700/80 mt-1 leading-relaxed">
                   Dès sa création, la carte sera immédiatement utilisable pour les paiements en ligne et Apple/Google Pay.
                 </p>
               </div>
            </div>
          </div>

          <Button fullWidth className="h-12 text-sm shadow-md font-bold bg-indigo-600 hover:bg-indigo-700 text-white mt-4" onClick={handleCreateCard} disabled={isSubmitting || !cardName || !cardholder}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <CreditCard className="mr-2" size={18} />}
            {isSubmitting ? "Création en cours..." : "Commander la carte"}
          </Button>
        </Card>
      </div>
    </section>
  );
}