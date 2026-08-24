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

  const targetNames = [
    "Papaya Nourish Soap",
    "Potato, Beetroot & Tomato Soap",
    "Seraphine Aura Luxurious Hair Elixir",
    "Keravance Luxe"
  ];

  const filteredProducts = targetNames
    .map(name => products?.find(p => p.name.toLowerCase() === name.toLowerCase()))
    .filter((p): p is DBProduct => !!p);

  const bestSellers = applyDiscountsToProducts(filteredProducts, categoryOffers || []);
  
  const bestSellersWithRatings = bestSellers.map(p => {
    const sum = ratingSummary?.find(rs => rs.product_id === p.id);
    if (sum) {
      return { ...p, average_rating: sum.average_rating, review_count: sum.review_count };
    }
    return p;
  });

  return <HomeClient bestSellers={bestSellersWithRatings} />;
}
