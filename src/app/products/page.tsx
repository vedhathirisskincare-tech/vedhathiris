import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import { ProductsListClient } from "./ProductsListClient";
import { applyDiscountsToProducts } from "@/utils/discount";

export default async function ProductsPage() {
  const supabase = await createClient();
  
  const { data: products } = await supabase.from('products').select('*');
  const { data: categoryOffers } = await supabase.from('category_offers').select('*');

  const discountedProducts = applyDiscountsToProducts(products || [], categoryOffers || []);

  return (
    <div className="flex-1 bg-skin-bg min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="font-serif text-5xl text-skin-bold mb-2">The Collection</h1>
        <p className="font-sans text-skin-primary text-lg mb-12">Discover our high-end, sophisticated formulations.</p>
        
        <Suspense fallback={<div className="py-10 text-center font-sans font-medium text-skin-primary">Loading collection...</div>}>
          <ProductsListClient products={discountedProducts} />
        </Suspense>
      </div>
    </div>
  );
}
