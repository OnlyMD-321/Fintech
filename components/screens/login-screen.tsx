"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(29,171,252,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(6,20,56,0.18),transparent_38%),linear-gradient(180deg,#F3F6F9_0%,#EBF0FE_100%)] px-4 py-5 text-mylegal-navy md:px-6 md:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-[1400px] gap-4 overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 p-3 shadow-soft backdrop-blur-xl md:grid-cols-[1.05fr_0.95fr] md:p-4 lg:p-5">
        <section className="relative flex min-h-[28rem] flex-col justify-between overflow-hidden rounded-[1.75rem] bg-mylegal-navy p-5 text-white md:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,171,252,0.26),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(219,239,251,0.18),transparent_26%)]" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <Image src={logoDark} alt="MyLegal par Fintech" width={220} height={62} className="h-auto w-[220px]" priority />
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/78 md:text-base">
                Espace bancaire premium pour les équipes juridiques et financières. Utilisez un compte de démonstration ou connectez-vous avec des identifiants d'entreprise factices.
              </p>
            </div>

            <div className="hidden rounded-full border border-white/14 bg-white/10 p-3 md:block">
              <Sparkles size={18} />
            </div>
          </div>

          <div className="relative z-10 grid gap-3 sm:grid-cols-2">
            {profiles.slice(0, 2).map((p, idx) => (
              <div key={p.id} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-white/65">Profil {idx + 1}</p>
                <p className="mt-2 text-lg font-semibold">{p.firstName}</p>
                <p className="text-sm text-white/75">{p.companyName} · {p.cards[0]?.name || "Carte Professionnelle"}</p>
                <p className="mt-4 text-2xl font-semibold">Trésorerie {p.currency}</p>
              </div>
            ))}
          </div>

          <div className="relative z-10 grid gap-3 text-sm text-white/78 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/6 p-3">Sessions Zustand persistées</div>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-3">Services API simulés</div>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-3">Virements, factures et documents</div>
          </div>
        </section>

        <section className="flex items-center justify-center rounded-[1.75rem] bg-white p-4 md:p-6">
          <Card className="w-full max-w-[470px] space-y-5 border-mylegal-cloud bg-mylegal-fog/65 p-5 md:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mylegal-steel">Accès sécurisé</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-mylegal-navy">Connexion à Fintech</h1>
              <p className="mt-2 text-sm leading-6 text-mylegal-steel">Utilisez vos identifiants ou accédez directement à un profil via les raccourcis ci-dessous.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit((values) => login(values))}>
              <div>
                <Label htmlFor="email">Email d'entreprise</Label>
                <div className="relative">
                  <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mylegal-steel" />
                  <Input id="email" type="email" placeholder="nom@entreprise.com" className="pl-9" {...register("email")} />
                </div>
                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="password">Code d'accès</Label>
                <div className="relative">
                  <LockKeyhole size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mylegal-steel" />
                  <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...register("password")} />
                </div>
                {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
              </div>

              {loginError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{loginError}</p>}

              <Button type="submit" fullWidth disabled={isSubmitting}>
                <ShieldCheck size={16} />
                {isSubmitting ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mylegal-steel">Connexion rapide développeur</p>
              <div className="grid gap-2">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => fastLogin(p.id)}
                    className="rounded-2xl border border-mylegal-cloud bg-white px-3 py-3 text-left transition hover:border-mylegal-ocean/30 hover:bg-mylegal-pale/45"
                  >
                    <p className="text-sm font-semibold text-mylegal-navy">{p.firstName} ({p.companyName})</p>
                    <p className="mt-0.5 text-xs text-mylegal-steel">{p.cards[0]?.name} · Compte {p.currency}</p>
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
