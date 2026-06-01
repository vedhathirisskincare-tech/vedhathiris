"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/data/products";
import { ShieldCheck, Leaf, Heart, Sparkles } from "lucide-react";

export default function Home() {
  // Grab top 4 products for Best Sellers carousel/grid
  const bestSellers = PRODUCTS.slice(0, 4);

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-skin-bg">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 max-w-4xl"
        >
          <div className="inline-block bg-skin-primary/30 backdrop-blur-sm px-6 py-2 rounded-full mb-6 border border-skin-primary shadow-sm">
            <span className="font-sans font-medium tracking-widest uppercase text-xs text-skin-bold">High-End Personal Care</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-skin-bold mb-6 leading-tight">
            Elevate Your <span className="text-skin-bold/80 italic">Routine</span>
          </h1>
          <p className="font-sans font-medium text-lg md:text-xl text-skin-primary mb-10 max-w-2xl mx-auto">
            Discover sophisticated, high-end skincare formulated for ultimate radiance and comfort.
          </p>
          <Link href="/shop">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-skin-bold text-skin-white px-10 py-4 rounded-full font-sans font-bold text-lg tracking-wide shadow-md transition-all"
            >
              Explore Collection
            </motion.button>
          </Link>
        </motion.div>
        
        {/* Soft background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-60 pointer-events-none">
          <div className="absolute top-10 right-10 md:right-40 w-96 h-96 bg-skin-primary rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
          <div className="absolute bottom-10 left-10 md:left-40 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
        </div>
      </section>

      {/* Trust Badges */}
      <section className="w-full py-12 bg-skin-bg shadow-sm z-20 border-y border-skin-primary/30">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Sparkles, label: "Premium Quality" },
            { icon: Leaf, label: "100% Organic" },
            { icon: Heart, label: "Cruelty-Free" },
            { icon: ShieldCheck, label: "Dermatologist Approved" },
          ].map((badge, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center gap-3">
              <div className="text-skin-primary">
                <badge.icon size={36} strokeWidth={1.5} />
              </div>
              <span className="font-sans tracking-wide text-sm font-bold text-skin-bold">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Category Blocks */}
      <section className="w-full py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl text-skin-bold mb-4">Curated Categories</h2>
          <p className="font-sans text-skin-primary text-lg">Find the perfect addition to your ritual.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Cleansing Bars", path: "/shop?category=Soap", color: "bg-skin-white" },
            { title: "Nourishing Washes", path: "/shop?category=Shampoo", color: "bg-skin-primary/20" },
            { title: "Elixirs & Oils", path: "/shop?category=Hair Oil", color: "bg-skin-white" },
          ].map((cat, idx) => (
            <Link key={idx} href={cat.path}>
              <motion.div 
                whileHover={{ y: -8 }}
                className={`${cat.color} rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer shadow-sm hover:shadow-xl transition-all border border-skin-primary/30`}
              >
                <h3 className="font-serif font-bold text-2xl text-skin-bold">{cat.title}</h3>
                <span className="mt-4 font-sans text-sm font-bold tracking-wide text-skin-bold/60 uppercase">Explore &rarr;</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="w-full py-24 px-6 bg-skin-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-4xl text-skin-bold mb-4">Signature Collection</h2>
              <p className="font-sans text-skin-primary text-lg">Our most coveted formulations.</p>
            </div>
            <Link href="/shop" className="hidden md:block">
              <span className="font-sans text-skin-bold font-bold border-b border-skin-bold pb-1 hover:text-skin-bold/70 transition-colors">
                View All
              </span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 text-center bg-skin-bg border-t border-skin-primary/50">
        <p className="font-sans text-skin-primary text-sm">
          &copy; {new Date().getFullYear()} Vedhathiris skin care. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
