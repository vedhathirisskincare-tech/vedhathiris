"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard, Product } from "@/components/ProductCard";

export function ProductsListClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    if (categoryParam && ["Soap", "Shampoo", "Hair Oil"].includes(categoryParam)) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const categories = ["All", "Soap", "Shampoo", "Hair Oil"];

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-10">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-skin-white rounded-2xl p-4 md:p-6 shadow-sm border border-skin-primary/50 sticky top-24 md:top-28">
          <h2 className="font-serif text-lg md:text-xl text-skin-bold mb-3 md:mb-4">Refine By</h2>
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar md:overflow-visible pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-center md:text-left font-sans font-medium px-4 py-2 md:py-3 rounded-xl transition-colors whitespace-nowrap ${
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
