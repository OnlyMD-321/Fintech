"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createInitialProfiles,
  type BankingDocumentAction,
  type BankingInvoice,
  type BankingProfile,
  type BankingTransaction,
  type InvoicePayload,
  type LoginPayload,
  type TabKey,
  type TransferPayload
} from "@/services/mock-data";
import { createInvoice, createTransfer, handleDocumentAction, loginWithCredentials, loginWithProfile, markInvoicePaid } from "@/services/mock-api";

export type ToastVariant = "default" | "success" | "warning" | "destructive";

export type ToastItem = {
  id: string;
  title: string;
  description: string;
  variant: ToastVariant;
};

type AppState = {
  isAuthenticated: boolean;
  activeProfileId: string | null;
  activeTab: TabKey;
  profiles: BankingProfile[];
  toasts: ToastItem[];
  loginError: string | null;
  setActiveTab: (tab: TabKey) => void;
  showToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  login: (payload: LoginPayload) => Promise<void>;
  fastLogin: (profileId: string) => Promise<void>;
  logout: () => void;
  addTransfer: (payload: TransferPayload) => Promise<void>;
  addInvoice: (payload: InvoicePayload) => Promise<void>;
  payInvoice: (invoiceId: string) => Promise<void>;
  runDocumentAction: (documentId: string, action: BankingDocumentAction) => Promise<void>;
  getActiveProfile: () => BankingProfile | null;
  getProfileById: (profileId: string) => BankingProfile | undefined;
};

const initialProfiles = createInitialProfiles();

function formatAmount(amount: number) {
  return Number(amount.toFixed(2));
}

function updateProfile(state: AppState, profileId: string, updater: (profile: BankingProfile) => BankingProfile) {
  return state.profiles.map((profile) => (profile.id === profileId ? updater(profile) : profile));
}

function buildTransferTransaction(payload: TransferPayload): BankingTransaction {
  return {
    id: crypto.randomUUID(),
    title: "Transfer sent",
    counterparty: payload.beneficiary,
    amount: formatAmount(payload.amount),
    currency: payload.currency,
    kind: "debit",
    createdAt: new Date().toISOString(),
    note: `${payload.bank ?? "Bank"} / ${payload.ibanRib}`
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      activeProfileId: null,
      activeTab: "home",
      profiles: initialProfiles,
      toasts: [],
      loginError: null,
      setActiveTab: (tab) => set({ activeTab: tab }),
      showToast: (toast) => {
        const id = crypto.randomUUID();
        set((state) => ({ toasts: [...state.toasts, { id, ...toast }] }));
        window.setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
        }, 3200);
      },
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
      login: async (payload) => {
        try {
          const response = await loginWithCredentials(payload);
          set({ isAuthenticated: true, activeProfileId: response.profileId, activeTab: "home", loginError: null });
          get().showToast({
            title: "Login successful",
            description: "Your demo workspace is ready.",
            variant: "success"
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to sign in.";
          set({ loginError: message });
          get().showToast({
            title: "Login failed",
            description: message,
            variant: "destructive"
          });
          throw error;
        }
      },
      fastLogin: async (profileId) => {
        await loginWithProfile(profileId);
        set({ isAuthenticated: true, activeProfileId: profileId, activeTab: "home", loginError: null });
        get().showToast({
          title: "Dev fast-login ready",
          description: `Profile ${profileId} loaded successfully.`,
          variant: "success"
        });
      },
      logout: () => {
        set({ isAuthenticated: false, activeProfileId: null, activeTab: "home" });
        get().showToast({
          title: "Signed out",
          description: "You have returned to the login screen.",
          variant: "default"
        });
      },
      addTransfer: async (payload) => {
        const response = await createTransfer(payload);
        const activeProfileId = get().activeProfileId;

        if (!activeProfileId) {
          throw new Error("No active profile selected.");
        }

        set((state) => ({
          profiles: updateProfile(state, activeProfileId, (profile) => ({
            ...profile,
            availableBalance: formatAmount(profile.availableBalance - response.amount),
            pendingBalance: payload.timing === "scheduled" ? formatAmount(profile.pendingBalance + response.amount) : profile.pendingBalance,
            transactions: [buildTransferTransaction(response), ...profile.transactions]
          }))
        }));

        get().showToast({
          title: "Transfer submitted",
          description: `${response.amount.toLocaleString("fr-MA")} ${response.currency} sent to ${response.beneficiary}.`,
          variant: "success"
        });
      },
      addInvoice: async (payload) => {
        const response = await createInvoice(payload);
        const activeProfileId = get().activeProfileId;

        if (!activeProfileId) {
          throw new Error("No active profile selected.");
        }

        const invoice: BankingInvoice = {
          id: response.id,
          reference: response.reference,
          clientName: response.clientName,
          invoiceObject: response.invoiceObject,
          amountHT: response.amountHT,
          vat: response.vat,
          totalTTC: response.totalTTC,
          dueDate: response.dueDate,
          status: response.status,
          createdAt: response.createdAt
        };

        set((state) => ({
          profiles: updateProfile(state, activeProfileId, (profile) => ({
            ...profile,
            invoices: [invoice, ...profile.invoices]
          }))
        }));

        get().showToast({
          title: "Invoice created",
          description: `${invoice.reference} added to the local invoice list.`,
          variant: "success"
        });
      },
      payInvoice: async (invoiceId) => {
        await markInvoicePaid(invoiceId);
        const activeProfileId = get().activeProfileId;

        if (!activeProfileId) {
          throw new Error("No active profile selected.");
        }

        set((state) => ({
          profiles: updateProfile(state, activeProfileId, (profile) => ({
            ...profile,
            invoices: profile.invoices.map((invoice) => (invoice.id === invoiceId ? { ...invoice, status: "paid" } : invoice))
          }))
        }));

        get().showToast({
          title: "Invoice updated",
          description: "The selected invoice has been marked as paid.",
          variant: "success"
        });
      },
      runDocumentAction: async (documentId, action) => {
        const profile = get().getActiveProfile();

        if (!profile) {
          throw new Error("No active profile selected.");
        }

        const document = profile.documents.find((item) => item.id === documentId);
        if (!document) {
          throw new Error("Document not found.");
        }

        const response = await handleDocumentAction(document.name, action);
        get().showToast({
          title: response.action === "download" ? "Download ready" : response.action === "share" ? "Share ready" : "Email prepared",
          description: `${document.name} - ${response.message}`,
          variant: "default"
        });
      },
      getActiveProfile: () => {
        const state = get();
        if (!state.activeProfileId) return null;
        return state.profiles.find((profile) => profile.id === state.activeProfileId) ?? null;
      },
      getProfileById: (profileId) => get().profiles.find((profile) => profile.id === profileId)
    }),
    {
      name: "fintech-by-mylegal",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        activeProfileId: state.activeProfileId,
        activeTab: state.activeTab,
        profiles: state.profiles
      })
    }
  )
);

export function useActiveProfile() {
  return useAppStore((state) => {
    if (!state.activeProfileId) return null;
    return state.profiles.find((profile) => profile.id === state.activeProfileId) ?? null;
  });
}