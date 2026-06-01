"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-skin-primary"
    >
      <div className="relative w-full h-56 bg-skin-bg flex items-center justify-center p-6">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-4xl text-skin-primary"
          >
            ✨
          </motion.div>
        )}
        <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-bold text-skin-bold shadow-sm border border-skin-primary">
          {product.category}
        </div>
      </div>

      <div className="p-5 flex flex-col gap-1">
        <h3 className="font-serif font-bold text-lg text-skin-bold leading-tight min-h-[3rem]">
          {product.name}
        </h3>
        <p className="text-skin-primary font-sans text-sm line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <p className="text-skin-bold font-sans font-extrabold text-xl">
            ₹{product.price}
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-skin-bold text-skin-white font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            aria-label="Add to cart"
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
