"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// FIXED: Added Loader2 to the imports
import { LockKeyhole, Mail, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActiveProfile, useAppStore } from "@/store/app-store";

import logoDark from "@/app/assets/logos/logo-dark.png";

const loginSchema = z.object({
  email: z.string().email("Entrez un email d'entreprise valide."),
  password: z.string().min(4, "Le code d'accès est requis.")
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginScreen() {
  const login = useAppStore((state) => state.login);
  const fastLogin = useAppStore((state) => state.fastLogin);
  const loginError = useAppStore((state) => state.loginError);
  const profiles = useAppStore((state) => state.profiles);
  const activeProfile = useActiveProfile();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  useEffect(() => {
    if (!activeProfile) return;
    setValue("email", activeProfile.email);
  }, [activeProfile, setValue]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(29,171,252,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(6,20,56,0.18),transparent_38%),linear-gradient(180deg,#F3F6F9_0%,#EBF0FE_100%)] px-4 py-4 md:px-6 md:py-6 text-mylegal-navy">
      
      <div className="mx-auto flex flex-col lg:grid min-h-[calc(100vh-2rem)] max-w-[1400px] gap-4 overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 p-3 shadow-soft backdrop-blur-xl lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.05fr_0.95fr] lg:p-4">
        
        <section className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-2xl bg-mylegal-navy p-6 text-white md:rounded-[1.5rem] lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,171,252,0.26),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(219,239,251,0.18),transparent_26%)]" />
          
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <Image 
                src={logoDark} 
                alt="MyLegal par Fintech" 
                width={220} 
                height={62} 
                className="h-auto w-[150px] sm:w-[180px] lg:w-[220px]" 
                priority 
              />
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
                Espace bancaire premium pour les équipes juridiques et financières. Utilisez un compte de démonstration ou connectez-vous avec des identifiants d'entreprise factices.
              </p>
            </div>

            <div className="hidden rounded-full border border-white/14 bg-white/10 p-3 sm:block">
              <Sparkles size={18} />
            </div>
          </div>

          <div className="relative z-10 mt-auto">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {profiles.slice(0, 2).map((p, idx) => (
                <div key={p.id} className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:p-5 backdrop-blur-sm">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-white/65">Profil {idx + 1}</p>
                  <p className="mt-1.5 text-base sm:text-lg font-bold">{p.firstName}</p>
                  <p className="text-xs sm:text-sm text-white/75 truncate">{p.companyName} · {p.cards[0]?.name || "Carte Pro"}</p>
                  <p className="mt-3 text-xl sm:text-2xl font-black">Trésorerie {p.currency}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 hidden lg:grid gap-3 text-xs xl:text-sm font-medium text-white/80 grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">Sessions Zustand persistées</div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">Services API simulés</div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">Virements, factures et documents</div>
            </div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center rounded-2xl bg-white p-5 py-8 md:rounded-[1.5rem] lg:p-8">
          <Card className="w-full max-w-[420px] lg:max-w-[470px] space-y-6 lg:space-y-8 border-none bg-transparent p-0 shadow-none sm:border-solid sm:border-mylegal-cloud sm:bg-mylegal-fog/65 sm:p-6 sm:shadow-sm lg:p-8">
            
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-mylegal-steel">Accès sécurisé</p>
              <h1 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-mylegal-navy">Connexion à Fintech</h1>
              <p className="mt-2 text-sm leading-relaxed text-mylegal-steel">Utilisez vos identifiants ou accédez directement à un profil via les raccourcis ci-dessous.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit((values) => login(values))}>
              <div>
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email d'entreprise</Label>
                <div className="relative mt-1.5">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input id="email" type="email" placeholder="nom@entreprise.com" className="pl-10 h-11 sm:h-12 text-sm font-medium" {...register("email")} />
                </div>
                {errors.email && <p className="mt-1 text-xs font-medium text-rose-600">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Code d'accès</Label>
                <div className="relative mt-1.5">
                  <LockKeyhole size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-11 sm:h-12 text-sm font-medium" {...register("password")} />
                </div>
                {errors.password && <p className="mt-1 text-xs font-medium text-rose-600">{errors.password.message}</p>}
              </div>

              {loginError && <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-700">{loginError}</div>}

              {/* FIXED: standard w-full class instead of fullWidth prop */}
              <Button type="submit" className="h-11 sm:h-12 w-full text-sm font-bold bg-indigo-600 hover:bg-indigo-700 mt-2" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <ShieldCheck className="mr-2" size={18} />}
                {isSubmitting ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Connexion rapide (Démo)</p>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>
              
              <div className="grid gap-2 sm:grid-cols-2">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => fastLogin(p.id)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm"
                  >
                    <p className="text-sm font-bold text-slate-900 truncate">{p.firstName} <span className="text-slate-500 font-medium">({p.companyName})</span></p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500 truncate">{p.cards[0]?.name} · {p.currency}</p>
                  </button>
                ))}
              </div>
            </div>

          </Card>
        </section>

      </div>
    </main>
  );
}