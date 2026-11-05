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

  // Fetch dynamic display arrangement from admin panel
  const { data: orderSetting } = await supabase
    .from('offers')
    .select('message')
    .like('message', 'PRODUCTS_DISPLAY_ORDER:%')
    .maybeSingle();

  let orderedIds: string[] = [];
  if (orderSetting?.message) {
    try {
      const raw = orderSetting.message.replace('PRODUCTS_DISPLAY_ORDER:', '');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        orderedIds = parsed;
      }
    } catch {
      orderedIds = [];
    }
  }

  // Separate standard products from combo packages
  const isCombo = (cat: string) => cat === 'Combo Packages' || cat.toLowerCase().includes('combo');
  
  const standardProducts = productsWithRatings.filter(p => !isCombo(p.category || ''));
  const comboProducts = productsWithRatings.filter(p => isCombo(p.category || ''));

  // Sort standard products according to admin arrangement
  const sortedStandardProducts = [...standardProducts];
  if (orderedIds.length > 0) {
    sortedStandardProducts.sort((a, b) => {
      const indexA = orderedIds.indexOf(a.id);
      const indexB = orderedIds.indexOf(b.id);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
  }

  // Sort combo packages according to admin arrangement
  const sortedComboProducts = [...comboProducts];
  if (orderedIds.length > 0) {
    sortedComboProducts.sort((a, b) => {
      const indexA = orderedIds.indexOf(a.id);
      const indexB = orderedIds.indexOf(b.id);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
  }

  // Standard products show first in admin-specified order, and finally combo packs are shown
  const finalOrderedProducts = [...sortedStandardProducts, ...sortedComboProducts];

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
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <h1 className="font-serif text-3xl sm:text-5xl text-skin-bold mb-2">Natural Skincare & Handmade Soaps Collection</h1>
        <p className="font-sans text-skin-primary text-lg mb-12">Discover handcrafted natural soap in Chennai, herbal shampoo, and organic hair oil formulations.</p>
        
        <Suspense fallback={<div className="py-10 text-center font-sans font-medium text-skin-primary">Loading collection...</div>}>
          <ProductsListClient products={finalOrderedProducts} />
        </Suspense>
      </div>
    </div>
  );
}
