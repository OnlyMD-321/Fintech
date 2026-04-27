import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeDollarSign, Building2, LogOut, ShieldCheck, UserRound } from "lucide-react";

export function ProfileScreen() {
  return (
    <section className="space-y-3 animate-floatIn md:space-y-4">
      <header>
        <h1 className="text-xl font-semibold leading-tight md:text-2xl">Profile</h1>
        <p className="text-sm text-[#6B7280]">Company executive overview and app settings.</p>
      </header>

      <Card className="space-y-3 md:p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#6366F1] text-sm font-semibold text-white">
            Y
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Younes</p>
            <p className="text-xs text-[#6B7280]">Managing Director - MyLegal SARL</p>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg bg-[#F8FAFC] p-3">
            <div className="flex items-center gap-2 text-[#4F46E5]">
              <Building2 size={16} />
              <span className="text-xs font-semibold">Company</span>
            </div>
            <p className="mt-1 text-sm font-medium">MyLegal SARL</p>
            <p className="text-xs text-[#6B7280]">SME Premium Banking</p>
          </div>
          <div className="rounded-lg bg-[#F8FAFC] p-3">
            <div className="flex items-center gap-2 text-[#4F46E5]">
              <BadgeDollarSign size={16} />
              <span className="text-xs font-semibold">Account</span>
            </div>
            <p className="mt-1 text-sm font-medium">Corporate Current Account</p>
            <p className="text-xs text-[#6B7280]">Secure banking vault</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-2 md:p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck size={16} className="text-[#4F46E5]" />
          Security
        </div>
        <p className="text-sm text-[#6B7280]">2FA enabled, document vault protected, and all actions are logged.</p>
      </Card>

      <Card className="space-y-2 md:p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <UserRound size={16} className="text-[#4F46E5]" />
          Account actions
        </div>
        <Button variant="secondary" className="w-full justify-start">
          Manage users
        </Button>
        <Button variant="secondary" className="w-full justify-start">
          App preferences
        </Button>
        <Button variant="ghost" className="w-full justify-start text-[#B91C1C]">
          <LogOut size={16} />
          Log out
        </Button>
      </Card>
    </section>
  );
}
