"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function OfferBarClient({ messages }: { messages: string[] }) {
  const pathname = usePathname();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!messages || messages.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000); // Change offer every 4 seconds

    return () => clearInterval(timer);
  }, [messages]);

  if (
    pathname.startsWith("/admin") || 
    pathname.startsWith("/login") || 
    pathname.startsWith("/signup") || 
    !messages || 
    messages.length === 0
  ) return null;

  return (
    <div className="bg-skin-bold text-white text-center py-2 px-4 text-sm font-medium tracking-wide z-50 relative overflow-hidden h-9 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute w-full"
        >
          {messages[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
