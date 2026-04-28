"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Sparkles, X, XCircle } from "lucide-react";
import { useAppStore } from "@/store/app-store";

const toastStyles = {
  default: "border-mylegal-cloud bg-white text-mylegal-navy",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  destructive: "border-rose-200 bg-rose-50 text-rose-950"
} as const;

const toastIcons = {
  default: Sparkles,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: XCircle
} as const;

export function ToastStack() {
  const toasts = useAppStore((state) => state.toasts);
  const removeToast = useAppStore((state) => state.removeToast);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 md:bottom-6 md:right-6">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.variant];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={`pointer-events-auto rounded-2xl border px-3 py-3 shadow-soft backdrop-blur ${toastStyles[toast.variant]}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-white/80 p-1.5 shadow-sm">
                  <Icon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">{toast.title}</p>
                  <p className="mt-0.5 text-xs leading-snug opacity-80">{toast.description}</p>
                </div>
                <button type="button" onClick={() => removeToast(toast.id)} className="rounded-full p-1 text-current/60 transition hover:bg-black/5 hover:text-current">
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}