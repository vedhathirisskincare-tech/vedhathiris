"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useCartStore } from "../store/cartStore";
import Link from "next/link";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
  image_url?: string; // For backward compatibility if needed
  discount_percentage?: number;
  original_price?: number;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0] || product.image_url;

  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-skin-primary cursor-pointer h-full flex flex-col"
      >
        <div className="relative w-full h-56 bg-skin-bg flex items-center justify-center p-6 shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
          {product.discount_percentage && product.discount_percentage > 0 ? (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-md">
              {product.discount_percentage}% OFF
            </div>
          ) : null}
        </div>

        <div className="p-5 flex flex-col gap-1 flex-1">
          <h3 className="font-serif font-bold text-lg text-skin-bold leading-tight min-h-[3rem]">
            {product.name}
          </h3>
          <p className="text-skin-primary font-sans text-sm line-clamp-2 min-h-[2.5rem] flex-1">
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-col">
              {product.original_price && product.original_price > product.price ? (
                <span className="line-through text-xs font-semibold text-gray-400">
                  ₹{product.original_price}
                </span>
              ) : null}
              <p className="text-skin-bold font-sans font-extrabold text-xl leading-tight">
                ₹{product.price}
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                useCartStore.getState().addItem(product);
              }}
              className="bg-skin-bold text-skin-white font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              aria-label="Add to cart"
            >
              Add to Cart
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
