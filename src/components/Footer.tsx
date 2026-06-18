"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { HandHeart, Leaf, Droplet, Waves, Sparkles } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <footer className="relative bg-skin-bold pt-12 pb-8 mt-auto text-skin-white overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 left-10 text-white/5">
          <HandHeart size={60} />
        </motion.div>
        <motion.div animate={{ y: [0, 30, 0], x: [0, -10, 0], rotate: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-20 left-1/4 text-white/5">
          <Leaf size={80} />
        </motion.div>
        <motion.div animate={{ y: [0, -15, 0], x: [0, 15, 0], rotate: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-20 right-1/4 text-white/5">
          <Droplet size={70} />
        </motion.div>
        <motion.div animate={{ y: [0, 25, 0], x: [0, -15, 0], rotate: [0, -5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-10 right-10 text-white/5">
          <Waves size={90} />
        </motion.div>
        <motion.div animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5">
          <Sparkles size={100} />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/Vedhathiris_Logo.png" 
                alt="Vedhathiris Logo" 
                className="w-80 h-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent && !parent.querySelector('h3')) {
                    const text = document.createElement('h3');
                    text.className = 'font-bold text-xl text-violet-600';
                    text.innerText = "Vedhathiri's";
                    parent.appendChild(text);
                  }
                }}
              />
            </div>
            <p className="text-skin-white/80 text-sm mb-6">
              Handcrafted, skin-safe, and magical bath & body products for kids and teens.
            </p>
            <div className="flex items-center gap-4 text-skin-white/60">
              <a href="#" className="hover:text-skin-primary transition-colors" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="hover:text-skin-primary transition-colors" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-skin-white">Shop</h4>
            <ul className="space-y-2 text-sm text-skin-white/80">
              <li><Link href="/shop" className="hover:text-skin-primary">All Products</Link></li>
              <li><Link href="/shop?category=Soap" className="hover:text-skin-primary">Soaps</Link></li>
              <li><Link href="/shop?category=Shampoo" className="hover:text-skin-primary">Shampoos</Link></li>
              <li><Link href="/shop?category=Hair Oil" className="hover:text-skin-primary">Hair Oils</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-skin-white">About</h4>
            <ul className="space-y-2 text-sm text-skin-white/80">
              <li><Link href="/about" className="hover:text-skin-primary">Our Story</Link></li>
              <li><Link href="/ingredients" className="hover:text-skin-primary">Ingredients</Link></li>
              <li><Link href="/contact" className="hover:text-skin-primary">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-skin-white">Legal</h4>
            <ul className="space-y-2 text-sm text-skin-white/80">
              <li><Link href="/privacy" className="hover:text-skin-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-skin-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-skin-white/20 pt-8 text-center text-sm text-skin-white/60">
          <p>&copy; {new Date().getFullYear()} Vedhathiri's Skin Care. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
