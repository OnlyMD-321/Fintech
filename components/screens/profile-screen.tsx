"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeDollarSign, Building2, LogOut, ShieldCheck, UserRound, MapPin, Fingerprint, FileText } from "lucide-react";
import { useActiveProfile, useAppStore } from "@/store/app-store";

export function ProfileScreen() {
  const profile = useActiveProfile();
  const { logout, setActiveTab } = useAppStore();

  if (!profile) return null;

  return (
    <section className="animate-floatIn space-y-5 pb-20 md:pb-6">
      {/* HEADER RESPONSIVE */}
      <header className="bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-100 md:border-none">
        <h1 className="text-xl font-black text-slate-900 md:text-2xl">Mon Profil</h1>
        <p className="text-sm text-slate-500 mt-1">Aperçu de la direction et paramètres du compte d'entreprise.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-12">
        {/* CARTE D'IDENTITÉ (Prend toute la largeur sur mobile, 12 colonnes sur Desktop) */}
        <Card className="col-span-1 md:col-span-12 lg:col-span-8 p-5 lg:p-6 bg-white border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 text-2xl font-black text-white shadow-md shrink-0">
              {profile.firstName[0]}
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{profile.firstName} {profile.displayName}</p>
              <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mt-0.5">{profile.role}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <Building2 size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Entreprise</span>
              </div>
              <p className="text-sm font-black text-slate-900">{profile.companyName}</p>
              <p className="text-xs font-medium text-slate-500 mt-1 flex items-start gap-1.5">
                <Fingerprint size={14} className="shrink-0 mt-0.5" />
                ICE: {profile.companyICE}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-1 flex items-start gap-1.5 line-clamp-2">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                {profile.companyAddress}
              </p>
            </div>
            
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <BadgeDollarSign size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Compte Principal</span>
              </div>
              <p className="text-sm font-black text-slate-900">Compte Courant {profile.currency}</p>
              <p className="text-xs font-medium text-slate-500 mt-1 break-all">
                IBAN: <br/> <span className="font-mono font-bold text-slate-700">{profile.accountIBAN}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* COLONNE LATÉRALE POUR SÉCURITÉ ET ACTIONS */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 space-y-4">
          <Card className="p-5 lg:p-6 bg-white border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <div className="h-8 w-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              Sécurité du compte
            </div>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              L'authentification à deux facteurs (2FA) est activée. Votre coffre-fort de documents est protégé et toutes les actions sont journalisées.
            </p>
          </Card>

          <Card className="p-5 lg:p-6 bg-white border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
              <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UserRound size={16} />
              </div>
              Actions rapides
            </div>
            
            <div className="space-y-2">
              <Button 
                variant={"outline" as any} 
                className="w-full justify-start h-11 text-sm font-bold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                Gérer les accès équipe
              </Button>
              <Button 
                variant={"outline" as any} 
                className="w-full justify-start h-11 text-sm font-bold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                Préférences d'affichage
              </Button>
              
              <Button 
                variant={"outline" as any} 
                className="w-full justify-start h-11 text-sm font-bold border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                onClick={() => setActiveTab("documents")}
              >
                <FileText size={16} className="mr-2" />
                Mes documents
              </Button>

              <div className="pt-2 border-t border-slate-100 mt-2">
                <Button 
                  variant={"ghost" as any} 
                  className="w-full justify-start h-11 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700" 
                  onClick={logout}
                >
                  <LogOut size={16} className="mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}