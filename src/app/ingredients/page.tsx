import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import IngredientsClient from "./IngredientsClient";
import { getLanguageAlternates } from "@/utils/site";
import { CHENNAI_KEYWORDS, generateBreadcrumbSchema } from "@/utils/seo";

export const metadata: Metadata = {
  title: "Pure Botanical Ingredients | Herbal Skincare & Natural Soap in Chennai",
  description:
    "Explore the organic botanical ingredients, therapeutic essential oils, and unrefined carrier oils used in our natural soap in Chennai and herbal skincare products in Chennai.",
  keywords: [...CHENNAI_KEYWORDS.skincare, ...CHENNAI_KEYWORDS.soap, ...CHENNAI_KEYWORDS.oil],
  alternates: {
    canonical: "/ingredients",
    languages: getLanguageAlternates("/ingredients"),
  },
};

export default async function IngredientsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*');

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Ingredients", path: "/ingredients" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)),
        }}
      />
      <IngredientsClient products={products || []} />
    </>
  );
}
