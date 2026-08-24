"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const images = [
  "https://aydngcfyioukkaxexuzp.supabase.co/storage/v1/object/public/product-images/Soaps/s5.webp", // Manjistha
  "https://aydngcfyioukkaxexuzp.supabase.co/storage/v1/object/public/product-images/1782556104566_sdph3np.webp", // Crown Elixir
  "https://aydngcfyioukkaxexuzp.supabase.co/storage/v1/object/public/product-images/1782545311992_a6jcgnw.webp" // Seraphine Aura
];

export default function ProductImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-violet-100/50 flex items-center justify-center rounded-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={images[currentIndex]}
            alt="Product Showcase"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-6 flex gap-2 z-10">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "bg-white w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
