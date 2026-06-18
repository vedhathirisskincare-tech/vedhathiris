"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { ShieldCheck, Leaf, Heart } from "lucide-react";
import type { Product } from "@/components/ProductCard";

export function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  
  // Handle fallback to single image_url if images array is empty or undefined
  const images = (product.images && product.images.length > 0) 
    ? product.images 
    : (product.image_url ? [product.image_url] : []);
    
  const [mainImage, setMainImage] = useState(images[0] || "");

  return (
    <main className="flex-1 min-h-screen bg-skin-bg pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Product Images (Gallery) */}
          <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative w-full h-96 md:h-[500px] bg-white rounded-3xl overflow-hidden shadow-sm border border-skin-primary/20 flex items-center justify-center">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <motion.div 
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="text-8xl text-skin-primary"
                >
                  ✨
                </motion.div>
              )}
              <div className="absolute top-6 left-6 bg-white px-4 py-2 rounded-full text-sm font-bold text-skin-bold shadow-sm border border-skin-primary">
                {product.category}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-2">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-skin-bold shadow-md' : 'border-transparent hover:border-skin-primary/50'}`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx+1}`} fill sizes="96px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-serif text-4xl md:text-5xl text-skin-bold mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-baseline gap-2">
                  {product.original_price && product.original_price > product.price ? (
                    <>
                      <p className="text-3xl font-bold text-skin-bold font-sans">
                        ₹{product.price}
                      </p>
                      <span className="line-through text-lg text-gray-400 font-medium font-sans">
                        ₹{product.original_price}
                      </span>
                      <span className="text-red-500 font-extrabold text-sm bg-red-50 px-2.5 py-1 rounded-lg">
                        {product.discount_percentage}% OFF
                      </span>
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-skin-bold font-sans">
                      ₹{product.price}
                    </p>
                  )}
                </div>
                <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                  In Stock ({product.stock} available)
                </span>
              </div>

              <div className="prose prose-lg text-skin-primary mb-10">
                <p className="text-lg leading-relaxed whitespace-pre-line">
                  {product.description} 
                </p>
              </div>

              <div className="flex gap-4 mb-12">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addItem(product)}
                  className="flex-1 bg-skin-bold text-skin-white py-4 rounded-xl font-sans font-bold text-lg shadow-md hover:shadow-lg transition-all"
                >
                  Add to Cart
                </motion.button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-skin-primary/20">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="bg-skin-primary/10 p-3 rounded-full text-skin-bold">
                    <Leaf size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-skin-bold">100% Natural</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="bg-skin-primary/10 p-3 rounded-full text-skin-bold">
                    <Heart size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-skin-bold">Cruelty Free</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="bg-skin-primary/10 p-3 rounded-full text-skin-bold">
                    <ShieldCheck size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-skin-bold">Dermatologist Tested</span>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
