"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "../store/cartStore";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const { items, setIsOpen } = useCartStore();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        setProfile(profile);
      } else {
        setProfile(null);
      }
    };

    fetchUserAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", currentUser.id)
          .single();
        setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  return (
    <header className={`sticky top-0 z-40 w-full border-b border-white/30 shadow-sm transition-colors duration-300 ${isMenuOpen ? "bg-white" : "bg-white/40 backdrop-blur-xl"}`}>
      <div className="container mx-auto px-4 h-20 md:h-32 flex items-center justify-between">
        
        {/* Mobile Header Elements */}
        {/* Left side: Hamburger Toggle */}
        <div className="flex md:hidden flex-1 justify-start">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-full transition-all"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Center: Logo */}
        <div className="flex md:hidden justify-center">
          <Link href="/" className="flex items-center">
            <img
              src="/Vedhathiris_Logo.png"
              alt="Vedhathiris Logo"
              className="h-16 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent && !parent.querySelector('span')) {
                  const text = document.createElement('span');
                  text.className = 'font-bold text-lg text-violet-600 whitespace-nowrap';
                  text.innerText = "Vedhathiri's";
                  parent.appendChild(text);
                }
              }}
            />
          </Link>
        </div>

        {/* Right side: Cart Icon */}
        <div className="flex md:hidden flex-1 justify-end">
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-full transition-all"
            aria-label="Cart"
          >
            <ShoppingBag className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Header (hidden on mobile) */}
        <div className="hidden md:flex items-center justify-between w-full h-full">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/Vedhathiris_Logo.png"
              alt="Vedhathiris Logo"
              className="h-28 w-28 object-contain bg-white rounded-full p-1 shadow-lg ring-4 ring-white/50"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent && !parent.querySelector('span')) {
                  const text = document.createElement('span');
                  text.className = 'font-bold text-2xl text-violet-600 whitespace-nowrap';
                  text.innerText = "Vedhathiri's";
                  parent.appendChild(text);
                }
              }}
            />
          </Link>

          <nav className="hidden md:flex gap-6 font-medium text-gray-600">
            <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
            <Link href="/products" className="hover:text-violet-600 transition-colors">Products</Link>
            <Link href="/ingredients" className="hover:text-violet-600 transition-colors">Ingredients</Link>
            <Link href="/about" className="hover:text-violet-600 transition-colors">Our Story</Link>
            <Link href="/contact" className="hover:text-violet-600 transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-all font-medium">
                <span className="hidden sm:inline font-sans text-sm font-semibold max-w-[120px] truncate" title={displayName}>
                  {displayName}
                </span>
                <div className="w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm hover:shadow-md transition-all">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </Link>
            ) : (
              <Link href="/profile" className="p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-full transition-all" aria-label="Profile">
                <User className="w-5 h-5" />
              </Link>
            )}

            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-full transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (slides out from left) */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col p-6 z-10 animate-out duration-300"
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
                  <span className="font-serif font-bold text-xl text-violet-600">Vedhathiri's</span>
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-violet-50 rounded-full transition-all text-gray-600"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-4 text-lg font-medium text-gray-600 flex-1">
                <Link href="/" onClick={() => setIsMenuOpen(false)} className="hover:text-violet-600 py-2 border-b border-gray-100 transition-colors">Home</Link>
                <Link href="/products" onClick={() => setIsMenuOpen(false)} className="hover:text-violet-600 py-2 border-b border-gray-100 transition-colors">Products</Link>
                <Link href="/ingredients" onClick={() => setIsMenuOpen(false)} className="hover:text-violet-600 py-2 border-b border-gray-100 transition-colors">Ingredients</Link>
                <Link href="/about" onClick={() => setIsMenuOpen(false)} className="hover:text-violet-600 py-2 border-b border-gray-100 transition-colors">Our Story</Link>
                <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="hover:text-violet-600 py-2 border-b border-gray-100 transition-colors">Contact</Link>
              </nav>

              {/* User Profile / Logout Section at bottom */}
              <div className="border-t pt-6 mt-auto">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-semibold text-gray-800 truncate" title={displayName}>
                          {displayName}
                        </p>
                        <p className="text-xs text-gray-500 truncate" title={user.email}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-center py-2 bg-violet-50 text-violet-700 font-semibold rounded-lg hover:bg-violet-100 transition-colors"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={async () => {
                        setIsMenuOpen(false);
                        const supabase = createClient();
                        await supabase.auth.signOut();
                        window.location.href = "/login";
                      }}
                      className="w-full text-center py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Sign In / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
