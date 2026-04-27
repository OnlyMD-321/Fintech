"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ArrowLeftRight,
  FileText,
  FolderClosed,
  UserRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalStorageState } from "@/lib/use-local-storage-state";
import { DashboardScreen } from "@/components/screens/dashboard-screen";
import { TransferScreen } from "@/components/screens/transfer-screen";
import { InvoiceScreen } from "@/components/screens/invoice-screen";
import { DocumentsScreen } from "@/components/screens/documents-screen";
import { ProfileScreen } from "@/components/screens/profile-screen";

type TabKey = "home" | "transfers" | "invoices" | "documents" | "profile";

const tabs = [
  { key: "home", label: "Accueil", icon: Home },
  { key: "transfers", label: "Virements", icon: ArrowLeftRight },
  { key: "invoices", label: "Factures", icon: FileText },
  { key: "documents", label: "Documents", icon: FolderClosed },
  { key: "profile", label: "Profil", icon: UserRound }
] as const;

export function AppLayout() {
  const [activeTab, setActiveTab] = useLocalStorageState<TabKey>("fintech.active-tab", "home");

  const content = useMemo(() => {
    if (activeTab === "home") return <DashboardScreen setActiveTab={setActiveTab} />;
    if (activeTab === "transfers") return <TransferScreen />;
    if (activeTab === "invoices") return <InvoiceScreen />;
    if (activeTab === "documents") return <DocumentsScreen />;
    if (activeTab === "profile") return <ProfileScreen />;
    return <DashboardScreen setActiveTab={setActiveTab} />;
  }, [activeTab]);

  return (
    <main className="relative min-h-screen px-3 pb-28 pt-4 md:px-5 md:pb-5 md:pt-5 lg:px-6 lg:py-6">
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-[#F9FAFB] via-[#F9FAFB]/95 via-35% to-[#F9FAFB]/45 to-transparent md:hidden" />

      <div className="mx-auto flex w-full max-w-[1480px] items-stretch gap-3 lg:gap-5">
        <aside className="hidden md:sticky md:top-5 md:flex md:h-[calc(100vh-2.5rem)] md:w-[94px] md:flex-col md:justify-between md:rounded-3xl md:border md:border-white/70 md:bg-white/80 md:p-2 md:shadow-soft md:backdrop-blur-xl">
          <div className="rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#6366F1] px-2 py-2.5 text-center text-xs font-semibold text-white">
            F
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
                      isActive ? "bg-[#EEF2FF] text-[#3730A3]" : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]"
                    )}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="px-1 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">MyLegal</p>
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
                    isActive ? "bg-[#EEF2FF] text-[#3730A3]" : "text-[#6B7280] hover:text-[#111827]"
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
    </main>
  );
}
