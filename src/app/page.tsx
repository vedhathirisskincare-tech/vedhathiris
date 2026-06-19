import { createClient } from "@/utils/supabase/server";
import { HomeClient } from "./HomeClient";
import { applyDiscountsToProducts, DBProduct } from "@/utils/discount";

export default async function Home() {
  const supabase = await createClient();
  
  const { data: products } = await supabase.from('products').select('*');
  const { data: categoryOffers } = await supabase.from('category_offers').select('*');

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

  return <HomeClient bestSellers={bestSellers} />;
}
