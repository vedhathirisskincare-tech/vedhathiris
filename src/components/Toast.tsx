"use client";

import React, { createContext, useContext, useState, useEffect, Suspense, useCallback, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
};

// Sub-component to handle URL search params in a safe Suspense context
function QueryParamToastHandler({ toast }: { toast: ToastContextType["toast"] }) {
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const toastType = searchParams.get("toast");
    if (!toastType) {
      hasTriggeredRef.current = false;
      return;
    }

    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    // Map query parameter strings to messages
    const toastMessages: Record<string, { message: string; type: ToastType }> = {
      login_success: { message: "Logged in successfully! Welcome back.", type: "success" },
      signup_success: { message: "Account created successfully!", type: "success" },
      logout_success: { message: "Signed out successfully.", type: "info" },
      offer_success: { message: "Promotional offer bar updated successfully.", type: "success" },
      category_offer_success: { message: "Category discounts updated successfully.", type: "success" },
      payment_success: { message: "Payment verified! Your order has been placed.", type: "success" },
    };

    const match = toastMessages[toastType];
    if (match) {
      toast[match.type](match.message);
    }

    // Clean up query parameters from the URL
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("toast");
    const query = newParams.toString();
    const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState(null, "", cleanUrl);
  }, [searchParams, searchParamsString, toast]);

  return null;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  // Helper object for calling toasts, memoized to preserve object reference integrity
  const toast = useMemo(() => ({
    success: (msg: string, dur?: number) => addToast(msg, "success", dur),
    error: (msg: string, dur?: number) => addToast(msg, "error", dur),
    warning: (msg: string, dur?: number) => addToast(msg, "warning", dur),
    info: (msg: string, dur?: number) => addToast(msg, "info", dur),
  }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      <Suspense fallback={null}>
        <QueryParamToastHandler toast={toast} />
      </Suspense>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[9999] flex flex-col gap-3 w-full max-w-sm px-4 md:px-0 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let bgColor = "bg-white border-gray-100 text-gray-800";
            let Icon = Info;
            let iconColor = "text-blue-500";
            let borderAccent = "border-l-blue-500";

            switch (t.type) {
              case "success":
                bgColor = "bg-white/95 backdrop-blur-md border-green-100 text-gray-900";
                Icon = CheckCircle2;
                iconColor = "text-emerald-500";
                borderAccent = "border-l-emerald-500";
                break;
              case "error":
                bgColor = "bg-white/95 backdrop-blur-md border-red-100 text-gray-900";
                Icon = XCircle;
                iconColor = "text-rose-500";
                borderAccent = "border-l-rose-500";
                break;
              case "warning":
                bgColor = "bg-white/95 backdrop-blur-md border-amber-100 text-gray-900";
                Icon = AlertCircle;
                iconColor = "text-amber-500";
                borderAccent = "border-l-amber-500";
                break;
              case "info":
                bgColor = "bg-white/95 backdrop-blur-md border-violet-100 text-gray-900";
                Icon = Info;
                iconColor = "text-violet-600";
                borderAccent = "border-l-violet-600";
                break;
            }

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className={`${bgColor} pointer-events-auto flex items-start gap-3.5 px-4.5 py-4 border border-l-4 ${borderAccent} rounded-2xl shadow-xl overflow-hidden`}
              >
                <Icon className={`${iconColor} w-5 h-5 mt-0.5 shrink-0`} />
                <div className="flex-1 font-sans text-sm font-semibold tracking-wide leading-snug">
                  {t.message}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 p-0.5 hover:bg-gray-100 rounded-full mt-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
