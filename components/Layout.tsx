"use client";

import Image from "next/image";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ArrowLeftRight,
  FileText,
  FolderClosed,
  UserRound,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginScreen } from "@/components/screens/login-screen";
import { DashboardScreen } from "@/components/screens/dashboard-screen";
import { TransferScreen } from "@/components/screens/transfer-screen";
import { InvoiceScreen } from "@/components/screens/invoice-screen";
import { DocumentsScreen } from "@/components/screens/documents-screen";
import { ProfileScreen } from "@/components/screens/profile-screen";
import { ToastStack } from "@/components/ui/toast-stack";
import { useAppStore } from "@/store/app-store";
import logoLight from "@/app/assets/logos/logo-light.png";

const tabs = [
  { key: "home", label: "Accueil", icon: Home },
  { key: "transfers", label: "Virements", icon: ArrowLeftRight },
  { key: "invoices", label: "Factures", icon: FileText },
  { key: "documents", label: "Documents", icon: FolderClosed },
  { key: "profile", label: "Profil", icon: UserRound }
] as const;

export function AppLayout() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const logout = useAppStore((state) => state.logout);

  const content = useMemo(() => {
    if (activeTab === "home") return <DashboardScreen />;
    if (activeTab === "transfers") return <TransferScreen />;
    if (activeTab === "invoices") return <InvoiceScreen />;
    if (activeTab === "documents") return <DocumentsScreen />;
    if (activeTab === "profile") return <ProfileScreen />;
    return <DashboardScreen />;
  }, [activeTab]);

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <ToastStack />
      </>
    );
  }

  return (
    <main className="relative min-h-screen px-3 pb-28 pt-4 md:px-5 md:pb-5 md:pt-5 lg:px-6 lg:py-6">
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-mylegal-fog via-mylegal-fog/95 via-35% to-mylegal-fog/45 to-transparent md:hidden" />

      <div className="mx-auto flex w-full max-w-[1480px] items-stretch gap-3 lg:gap-5">
        <aside className="hidden md:sticky md:top-5 md:flex md:h-[calc(100vh-2.5rem)] md:w-[94px] md:flex-col md:justify-between md:rounded-3xl md:border md:border-white/70 md:bg-white/80 md:p-2 md:shadow-soft md:backdrop-blur-xl">
          <div className="flex items-center justify-center rounded-2xl border border-mylegal-cloud bg-white px-2 py-3">
            <Image src={logoLight} alt="MyLegal" width={58} height={20} className="h-auto w-[58px]" />
          </div>

          <ul className="flex flex-1 flex-col justify-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.key === activeTab;
              return (
                <li key={tab.key}>
                  <button
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex w-full flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition",
                      isActive ? "bg-mylegal-pale text-mylegal-navy" : "text-mylegal-steel hover:bg-mylegal-fog hover:text-mylegal-navy"
                    )}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>

            <button onClick={logout} className="flex items-center justify-center rounded-xl border border-mylegal-cloud bg-white p-2 text-mylegal-steel transition hover:bg-mylegal-pale hover:text-mylegal-navy" aria-label="Log out">
              <LogOut size={16} />
            </button>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-2.5 shadow-soft backdrop-blur-xl md:h-[calc(100vh-2.5rem)] md:rounded-3xl md:p-4 lg:p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="min-h-[78vh] md:h-full md:overflow-y-auto md:pr-1"
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>

      <nav className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-1.5rem)] max-w-[390px] -translate-x-1/2 rounded-2xl border border-white/70 bg-white/72 px-1.5 py-1.5 shadow-soft backdrop-blur-2xl md:hidden">
        <ul className="grid grid-cols-5 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.key === activeTab;
            return (
              <li key={tab.key}>
                <button
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex w-full flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition",
                    isActive ? "bg-mylegal-pale text-mylegal-navy" : "text-mylegal-steel hover:text-mylegal-navy"
                  )}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <ToastStack />
    </main>
  );
}
