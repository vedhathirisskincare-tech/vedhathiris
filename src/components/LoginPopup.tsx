"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { X } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import { login } from "@/app/login/actions";

export default function LoginPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only show on public pages, avoid showing on admin or auth pages
    if (pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/signup")) {
      return;
    }

    const checkUserAndShowPopup = async () => {
      // Check if user is already logged in or if popup was already closed in this session
      const hasSeenPopup = sessionStorage.getItem("hasSeenLoginPopup");
      if (hasSeenPopup) return;

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user && !hasChecked) {
        setHasChecked(true);
        // Show popup after 3 seconds
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 3000);

        return () => clearTimeout(timer);
      }
    };

    checkUserAndShowPopup();
  }, [pathname, hasChecked]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("hasSeenLoginPopup", "true");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-violet-600" />
          <h2 className="text-2xl font-bold text-center text-violet-600 mb-2">Welcome to Vedhathiris</h2>
          <p className="text-center text-gray-500 mb-6 text-sm">Please login to explore our exclusive offers.</p>
          
          <form action={login} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="popup-email">
                Email or Mobile Number
              </label>
              <input
                id="popup-email"
                name="email"
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="you@example.com or 9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="popup-password">
                Password
              </label>
              <PasswordInput
                id="popup-password"
                name="password"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
              >
                Log In
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-center">
            <button 
              onClick={handleClose}
              className="text-sm text-gray-500 hover:text-violet-600 hover:underline"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
