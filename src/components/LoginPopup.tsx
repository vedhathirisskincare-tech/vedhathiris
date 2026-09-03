"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { X, Lock, Mail, Phone, User as UserIcon, ShieldCheck, Sparkles, Truck, Gift, Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import { loginWithCredentials, signupWithCredentials } from "@/app/login/actions";
import { useAuthModalStore } from "@/store/authModalStore";
import { useToast } from "./Toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPopup() {
  const { 
    isOpen, 
    closeAuthModal, 
    openAuthModal, 
    view, 
    setView, 
    mode, 
    title, 
    subtitle, 
    redirectUrl, 
    onSuccess 
  } = useAuthModalStore();

  const toast = useToast();
  const pathname = usePathname();
  const router = useRouter();

  // Form states
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [signupFullName, setSignupFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Automatic timer for general visitors (only once per session)
  useEffect(() => {
    // Avoid showing on admin or auth pages
    if (pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/signup")) {
      return;
    }

    const checkInitialVisitor = async () => {
      const hasSeenPopup = sessionStorage.getItem("hasSeenLoginPopup");
      if (hasSeenPopup) return;

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const timer = setTimeout(() => {
          const currentSeen = sessionStorage.getItem("hasSeenLoginPopup");
          if (!currentSeen) {
            openAuthModal({
              mode: "general",
              view: "login",
            });
          }
        }, 3500);

        return () => clearTimeout(timer);
      }
    };

    checkInitialVisitor();
  }, [pathname, openAuthModal]);

  // Clear errors when view changes
  useEffect(() => {
    setFormError(null);
  }, [view]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    sessionStorage.setItem("hasSeenLoginPopup", "true");
    setFormError(null);
    closeAuthModal();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    try {
      const res = await loginWithCredentials(loginEmailOrPhone, loginPassword);
      if (!res.success) {
        setFormError(res.error || "Login failed. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back! You are now logged in.");
      sessionStorage.setItem("hasSeenLoginPopup", "true");
      closeAuthModal();
      
      if (onSuccess) {
        onSuccess();
      }

      router.refresh();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    try {
      const res = await signupWithCredentials({
        fullName: signupFullName,
        email: signupEmail,
        phone: signupPhone,
        password: signupPassword,
      });

      if (!res.success) {
        setFormError(res.error || "Signup failed. Please try again.");
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully! Welcome to Vedhathiri's.");
      sessionStorage.setItem("hasSeenLoginPopup", "true");
      closeAuthModal();

      if (onSuccess) {
        onSuccess();
      }

      router.refresh();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred during account creation.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentRedirect = redirectUrl || (pathname === "/login" || pathname === "/signup" ? "/?openCart=true" : `${pathname}?openCart=true`);

  const displayTitle = title || (mode === "checkout" ? "Login to Place Order" : "Welcome to Vedhathiri's");
  const displaySubtitle = subtitle || (
    mode === "checkout" 
      ? "Sign in or create an account to proceed to payment and track your order in real-time."
      : "Discover pure natural soap, cold-cured skincare, and unlock exclusive discounts."
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-violet-100 flex flex-col max-h-[90vh]"
      >
        {/* Top Decorative Header Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600 shrink-0" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 bg-gray-100/80 hover:bg-gray-200 p-1.5 rounded-full transition-all z-20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 md:p-8 space-y-5">
          {/* Header section */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 mb-1 shadow-inner">
              {mode === "checkout" ? <Truck className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </div>
            
            <h2 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">
              {displayTitle}
            </h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
              {displaySubtitle}
            </p>
          </div>

          {/* E-Commerce Value Props / Perks */}
          <div className="bg-violet-50/70 border border-violet-100 rounded-2xl p-3.5 grid grid-cols-3 gap-2 text-center text-xs text-violet-950 font-medium">
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-violet-600" />
              <span>Live Tracking</span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-violet-200/60">
              <ShieldCheck className="w-4 h-4 text-violet-600" />
              <span>Secure Razorpay</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Gift className="w-4 h-4 text-violet-600" />
              <span>Member Offers</span>
            </div>
          </div>

          {/* Tab Switcher (Log In / Create Account) */}
          <div className="flex bg-gray-100 p-1 rounded-xl font-medium text-sm">
            <button
              type="button"
              onClick={() => setView("login")}
              className={`flex-1 py-2 rounded-lg transition-all duration-200 ${
                view === "login"
                  ? "bg-white text-violet-700 font-bold shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setView("signup")}
              className={`flex-1 py-2 rounded-lg transition-all duration-200 ${
                view === "signup"
                  ? "bg-white text-violet-700 font-bold shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              New Customer? Register
            </button>
          </div>

          {/* Inline Error Alert */}
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
              <span className="font-bold">Error:</span> {formError}
            </div>
          )}

          {/* Tab 1: Log In Form */}
          {view === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="modal-login-email">
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <input
                    id="modal-login-email"
                    type="text"
                    required
                    value={loginEmailOrPhone}
                    onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-600 outline-none text-sm text-gray-900 transition-all"
                    placeholder="e.g. you@example.com or 9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="modal-login-password">
                  Password
                </label>
                <PasswordInput
                  id="modal-login-password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-600 outline-none text-sm text-gray-900 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <span>{mode === "checkout" ? "Log In & Continue to Payment" : "Log In"}</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <Link
                  href={`/login?redirect=${encodeURIComponent(currentRedirect)}`}
                  onClick={handleClose}
                  className="text-xs text-gray-500 hover:text-violet-600 hover:underline"
                >
                  Need password reset or full login page? Click here
                </Link>
              </div>
            </form>
          )}

          {/* Tab 2: Sign Up Form */}
          {view === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="modal-signup-name">
                  Full Name
                </label>
                <input
                  id="modal-signup-name"
                  type="text"
                  required
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-600 outline-none text-sm text-gray-900 transition-all"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="modal-signup-email">
                    Email Address
                  </label>
                  <input
                    id="modal-signup-email"
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-600 outline-none text-sm text-gray-900 transition-all"
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="modal-signup-phone">
                    Mobile Number
                  </label>
                  <input
                    id="modal-signup-phone"
                    type="tel"
                    required
                    pattern="[0-9]{10,15}"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-600 outline-none text-sm text-gray-900 transition-all"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="modal-signup-password">
                  Create Password
                </label>
                <PasswordInput
                  id="modal-signup-password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-600 outline-none text-sm text-gray-900 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>{mode === "checkout" ? "Create Account & Place Order" : "Sign Up & Join"}</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <Link
                  href={`/signup?redirect=${encodeURIComponent(currentRedirect)}`}
                  onClick={handleClose}
                  className="text-xs text-gray-500 hover:text-violet-600 hover:underline"
                >
                  Prefer full registration page? Click here
                </Link>
              </div>
            </form>
          )}

          {/* Bottom dismiss option */}
          <div className="text-center pt-1">
            <button 
              type="button"
              onClick={handleClose}
              className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
            >
              Dismiss for now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
