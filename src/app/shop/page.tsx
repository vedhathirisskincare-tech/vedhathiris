"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/data/products";

export default function ShopPage() {
  return (
    <div className="flex-1 bg-skin-bg min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="font-serif text-5xl text-skin-bold mb-2">The Collection</h1>
        <p className="font-sans text-skin-primary text-lg mb-12">Discover our high-end, sophisticated formulations.</p>
        
        <Suspense fallback={<div className="py-10 text-center font-sans font-medium text-skin-primary">Loading collection...</div>}>
          <ShopContent />
        </Suspense>
      </div>
    </div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    if (categoryParam && ["Soap", "Shampoo", "Hair Oil"].includes(categoryParam)) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  const filteredProducts = activeCategory === "All" 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  const categories = ["All", "Soap", "Shampoo", "Hair Oil"];

  return (
    <div className="flex flex-col md:flex-row gap-10">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-skin-white rounded-2xl p-6 shadow-sm border border-skin-primary/50 sticky top-28">
          <h2 className="font-serif text-xl text-skin-bold mb-4">Refine By</h2>
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-left font-sans font-medium px-4 py-3 rounded-xl transition-colors ${
                  activeCategory === cat 
                    ? "bg-skin-primary/30 text-skin-bold" 
                    : "bg-transparent text-skin-primary hover:bg-skin-primary/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="w-full text-center py-20">
            <p className="font-sans text-xl text-skin-primary">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
