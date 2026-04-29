import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeDollarSign, Building2, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useActiveProfile, useAppStore } from "@/store/app-store";

export function ProfileScreen() {
  const profile = useActiveProfile();
  const logout = useAppStore((state) => state.logout);

  if (!profile) return null;

  return (
    <section className="space-y-3 animate-floatIn md:space-y-4">
      <header>
        <h1 className="text-xl font-semibold leading-tight md:text-2xl">Profil</h1>
        <p className="text-sm text-[#6B7280]">Aperçu de la direction et paramètres de l'application.</p>
      </header>

      <Card className="space-y-3 md:p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#6366F1] text-sm font-semibold text-white">
            {profile.firstName[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{profile.firstName}</p>
            <p className="text-xs text-[#6B7280]">{profile.role} - {profile.companyName}</p>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg bg-[#F8FAFC] p-3">
            <div className="flex items-center gap-2 text-[#4F46E5]">
              <Building2 size={16} />
              <span className="text-xs font-semibold">Entreprise</span>
            </div>
            <p className="mt-1 text-sm font-medium">{profile.companyName}</p>
            <p className="text-xs text-[#6B7280]">Banque Premium PME</p>
          </div>
          <div className="rounded-lg bg-[#F8FAFC] p-3">
            <div className="flex items-center gap-2 text-[#4F46E5]">
              <BadgeDollarSign size={16} />
              <span className="text-xs font-semibold">Compte</span>
            </div>
            <p className="mt-1 text-sm font-medium">Compte Courant {profile.currency}</p>
            <p className="text-xs text-[#6B7280]">Coffre bancaire sécurisé</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-2 md:p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck size={16} className="text-[#4F46E5]" />
          Sécurité
        </div>
        <p className="text-sm text-[#6B7280]">2FA activé, coffre-fort de documents protégé et toutes les actions sont journalisées.</p>
      </Card>

      <Card className="space-y-2 md:p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <UserRound size={16} className="text-[#4F46E5]" />
          Actions du compte
        </div>
        <Button variant="secondary" className="w-full justify-start">
          Gérer les utilisateurs
        </Button>
        <Button variant="secondary" className="w-full justify-start">
          Préférences de l'application
        </Button>
        <Button variant="ghost" className="w-full justify-start text-[#B91C1C]" onClick={logout}>
          <LogOut size={16} />
          Déconnexion
        </Button>
      </Card>
    </section>
  );
}
