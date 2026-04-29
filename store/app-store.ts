"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createInitialProfiles,
  type BankingDocumentAction,
  type BankingInvoice,
  type BankingProfile,
  type BankingTransaction,
  type BankingCard,
  type InvoicePayload,
  type LoginPayload,
  type TabKey,
  type TransferPayload,
  type EmployeeInsurance // <-- NOUVEL IMPORT
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
  addCard: (newCard: BankingCard) => void;
  
  // NOUVELLES ACTIONS ASSURANCE
  toggleInsuranceStatus: (insuranceId: string) => void;
  addInsurance: (payload: Omit<EmployeeInsurance, "id">) => Promise<void>;
};

// Initialisation via mock-data.ts
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
    title: "Virement émis",
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
            title: "Connexion réussie",
            description: "Votre espace est prêt.",
            variant: "success"
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Identifiants invalides.";
          set({ loginError: message });
          get().showToast({
            title: "Échec de connexion",
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
          title: "Connexion rapide réussie",
          description: `Profil chargé avec succès.`,
          variant: "success"
        });
      },
      
      logout: () => {
        set({ isAuthenticated: false, activeProfileId: null, activeTab: "home" });
        get().showToast({
          title: "Déconnexion",
          description: "Vous avez été déconnecté en toute sécurité.",
          variant: "default"
        });
      },
      
      addTransfer: async (payload) => {
        const response = await createTransfer(payload);
        const activeProfileId = get().activeProfileId;

        if (!activeProfileId) {
          throw new Error("Aucun profil actif.");
        }

        set((state) => ({
          profiles: updateProfile(state, activeProfileId, (profile) => {
            const cardIndex = profile.cards.findIndex(c => c.balance >= response.amount);
            const targetCardIndex = cardIndex >= 0 ? cardIndex : 0;

            const updatedCards = [...profile.cards];
            if (updatedCards.length > 0) {
              updatedCards[targetCardIndex] = {
                ...updatedCards[targetCardIndex],
                balance: formatAmount(updatedCards[targetCardIndex].balance - response.amount)
              };
            }

            const newAvailableBalance = formatAmount(
              updatedCards.reduce((sum, card) => sum + card.balance, 0)
            );

            return {
              ...profile,
              cards: updatedCards,
              availableBalance: newAvailableBalance,
              pendingBalance: payload.timing === "scheduled" ? formatAmount(profile.pendingBalance + response.amount) : profile.pendingBalance,
              transactions: [buildTransferTransaction(response), ...profile.transactions]
            };
          })
        }));

        get().showToast({
          title: "Virement envoyé",
          description: `${response.amount.toLocaleString("fr-MA")} ${response.currency} envoyés à ${response.beneficiary}.`,
          variant: "success"
        });
      },
      
      addInvoice: async (payload) => {
        const response = await createInvoice(payload);
        const activeProfileId = get().activeProfileId;

        if (!activeProfileId) {
          throw new Error("Aucun profil actif.");
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
          title: "Facture créée",
          description: `${invoice.reference} ajoutée à la liste.`,
          variant: "success"
        });
      },
      
      payInvoice: async (invoiceId) => {
        await markInvoicePaid(invoiceId);
        const activeProfileId = get().activeProfileId;

        if (!activeProfileId) {
          throw new Error("Aucun profil actif.");
        }

        set((state) => ({
          profiles: updateProfile(state, activeProfileId, (profile) => ({
            ...profile,
            invoices: profile.invoices.map((invoice) => (invoice.id === invoiceId ? { ...invoice, status: "paid" } : invoice))
          }))
        }));

        get().showToast({
          title: "Facture mise à jour",
          description: "La facture a été marquée comme payée.",
          variant: "success"
        });
      },
      
      runDocumentAction: async (documentId, action) => {
        const profile = get().getActiveProfile();

        if (!profile) {
          throw new Error("Aucun profil actif.");
        }

        const document = profile.documents.find((item) => item.id === documentId);
        if (!document) {
          throw new Error("Document introuvable.");
        }

        const response = await handleDocumentAction(document.name, action);
        get().showToast({
          title: response.action === "download" ? "Téléchargement prêt" : response.action === "share" ? "Partage prêt" : "Email préparé",
          description: `${document.name} - ${response.message}`,
          variant: "default"
        });
      },
      
      addCard: (newCard) => {
        const activeProfileId = get().activeProfileId;

        if (!activeProfileId) return;

        set((state) => ({
          profiles: updateProfile(state, activeProfileId, (profile) => {
            const fundingCardIndex = profile.cards.reduce((richestIdx, card, currentIdx, arr) => 
              card.balance > arr[richestIdx].balance ? currentIdx : richestIdx
            , 0);

            const updatedCards = [...profile.cards];
            const fundingCard = updatedCards[fundingCardIndex];

            const actualAllocatedBalance = fundingCard.balance >= newCard.balance 
              ? newCard.balance 
              : fundingCard.balance;

            updatedCards[fundingCardIndex] = {
              ...fundingCard,
              balance: formatAmount(fundingCard.balance - actualAllocatedBalance)
            };

            const cardToInsert = {
              ...newCard,
              balance: actualAllocatedBalance
            };
            
            updatedCards.push(cardToInsert);
            
            const newAvailableBalance = formatAmount(
              updatedCards.reduce((sum, card) => sum + card.balance, 0)
            );

            return {
              ...profile,
              cards: updatedCards,
              availableBalance: newAvailableBalance
            };
          })
        }));

        get().showToast({
          title: "Nouvelle carte activée",
          description: `La carte "${newCard.name}" a été provisionnée avec succès.`,
          variant: "success"
        });
      },

      // --- LOGIQUE POUR LES ASSURANCES ---
      toggleInsuranceStatus: (insuranceId) => {
        const activeProfileId = get().activeProfileId;
        if (!activeProfileId) return;

        set((state) => ({
          profiles: updateProfile(state, activeProfileId, (profile) => ({
            ...profile,
            employeeInsurances: (profile.employeeInsurances || []).map((ins) => 
              ins.id === insuranceId 
                ? { ...ins, status: ins.status === "active" ? "suspended" : "active" } 
                : ins
            )
          }))
        }));
        get().showToast({ 
          title: "Statut mis à jour", 
          description: "Le statut de couverture a été modifié.", 
          variant: "success" 
        });
      },

      addInsurance: async (payload) => {
        const activeProfileId = get().activeProfileId;
        if (!activeProfileId) return;

        set((state) => ({
          profiles: updateProfile(state, activeProfileId, (profile) => ({
            ...profile,
            employeeInsurances: [{ ...payload, id: `ins-${Date.now()}` }, ...(profile.employeeInsurances || [])]
          }))
        }));
        get().showToast({ 
          title: "Affiliation réussie", 
          description: `${payload.employeeName} est maintenant couvert.`, 
          variant: "success" 
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