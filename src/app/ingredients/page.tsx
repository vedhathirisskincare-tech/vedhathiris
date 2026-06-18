import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import IngredientsClient from "./IngredientsClient";

export const metadata: Metadata = {
  title: "Botanical Ingredients & Apothecary | Vedhathiri's",
  description: "Explore the pure, organic botanical elements, natural carrier oils, skin-soothing clays, and therapeutic essential oils hand-crafted into Vedhathiri's soaps.",
};

export default async function IngredientsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*');

  return <IngredientsClient products={products || []} />;
}
