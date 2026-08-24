import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import { ProductsListClient } from "./ProductsListClient";
import { applyDiscountsToProducts } from "@/utils/discount";
import { getLanguageAlternates } from "@/utils/site";

import { CHENNAI_KEYWORDS, generateBreadcrumbSchema } from "@/utils/seo";

export const metadata: Metadata = {
  title: "Natural Soap, Herbal Skincare & Hair Oil in Chennai | The Collection",
  description:
    "Shop our complete collection of natural soap in Chennai, herbal skincare products in Chennai, handmade soaps, herbal shampoo, and natural hair oil crafted with pure botanicals.",
  keywords: CHENNAI_KEYWORDS.all,
  alternates: {
    canonical: "/products",
    languages: getLanguageAlternates("/products"),
  },
};

export default async function ProductsPage() {
  const supabase = await createClient();
  
  const { data: products } = await supabase.from('products').select('*');
  const { data: categoryOffers } = await supabase.from('category_offers').select('*');
  const { data: ratingSummary } = await supabase.from('product_rating_summary').select('*');

  const discountedProducts = applyDiscountsToProducts(products || [], categoryOffers || []);
  
  const productsWithRatings = discountedProducts.map(p => {
    const sum = ratingSummary?.find(rs => rs.product_id === p.id);
    if (sum) {
      return { ...p, average_rating: sum.average_rating, review_count: sum.review_count };
    }
    return p;
  });

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
  ];

  return (
    <div className="flex-1 bg-skin-bg min-h-screen pt-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)),
        }}
      />
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="font-serif text-5xl text-skin-bold mb-2">Natural Skincare & Handmade Soaps Collection</h1>
        <p className="font-sans text-skin-primary text-lg mb-12">Discover handcrafted natural soap in Chennai, herbal shampoo, and organic hair oil formulations.</p>
        
        <Suspense fallback={<div className="py-10 text-center font-sans font-medium text-skin-primary">Loading collection...</div>}>
          <ProductsListClient products={productsWithRatings} />
        </Suspense>
      </div>
    </div>
  );
}
