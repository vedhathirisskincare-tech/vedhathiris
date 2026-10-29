import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { HomeClient } from "./HomeClient";
import { applyDiscountsToProducts, DBProduct } from "@/utils/discount";
import { CHENNAI_KEYWORDS } from "@/utils/seo";

export const metadata: Metadata = {
  title: "Natural Skincare & Handmade Soap in Chennai | Vedhathiri's",
  description:
    "Discover the best natural skincare in Chennai and authentic handmade soap in Chennai. Crafted with pure botanical ingredients, herbal hair oils, and organic shampoos.",
  keywords: CHENNAI_KEYWORDS.all,
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const supabase = await createClient();
  
  const { data: products } = await supabase.from('products').select('*');
  const { data: categoryOffers } = await supabase.from('category_offers').select('*');
  const { data: ratingSummary } = await supabase.from('product_rating_summary').select('*');

  // Fetch admin-chosen 4 featured products for the home page
  const { data: featuredSetting } = await supabase
    .from('offers')
    .select('message')
    .like('message', 'HOMEPAGE_FEATURED:%')
    .maybeSingle();

  let featuredIds: string[] = [];
  if (featuredSetting?.message) {
    try {
      const raw = featuredSetting.message.replace('HOMEPAGE_FEATURED:', '');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        featuredIds = parsed;
      }
    } catch {
      featuredIds = [];
    }
  }

  // Resolve products in the exact order selected by admin
  let filteredProducts: DBProduct[] = [];
  if (featuredIds.length > 0) {
    filteredProducts = featuredIds
      .map((id) => products?.find((p) => p.id === id))
      .filter((p): p is DBProduct => !!p);
  }

  // Graceful fallback if any selected product was deleted or unselected
  if (filteredProducts.length < 4 && products && products.length > 0) {
    const fallbackDefaults = [
      "Papaya Nourish Soap",
      "Potato, Beetroot & Tomato Soap",
      "Seraphine Aura Luxurious Hair Elixir",
      "Keravance Luxe",
    ];
    for (const name of fallbackDefaults) {
      if (filteredProducts.length >= 4) break;
      const found = products.find((p) => p.name.toLowerCase() === name.toLowerCase());
      if (found && !filteredProducts.some((p) => p.id === found.id)) {
        filteredProducts.push(found as DBProduct);
      }
    }
    for (const p of products) {
      if (filteredProducts.length >= 4) break;
      if (!filteredProducts.some((fp) => fp.id === p.id) && p.category !== "Combo Packages") {
        filteredProducts.push(p as DBProduct);
      }
    }
  }

  const bestSellers = applyDiscountsToProducts(filteredProducts, categoryOffers || []);
  
  const bestSellersWithRatings = bestSellers.map(p => {
    const sum = ratingSummary?.find(rs => rs.product_id === p.id);
    if (sum) {
      return { ...p, average_rating: sum.average_rating, review_count: sum.review_count };
    }
    return p;
  });

  const comboPackages = products?.filter(p => p.category === "Combo Packages") || [];
  const combosWithRatings = comboPackages.map(p => {
    const sum = ratingSummary?.find(rs => rs.product_id === p.id);
    if (sum) {
      return { ...p, average_rating: sum.average_rating, review_count: sum.review_count };
    }
    return p;
  });

  return <HomeClient bestSellers={bestSellersWithRatings} comboPackages={combosWithRatings} />;
}
