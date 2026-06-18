import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";
import { applyDiscountToSingleProduct } from "@/utils/discount";
import type { Product } from "@/components/ProductCard";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) {
    notFound();
  }

  const { data: categoryOffers } = await supabase.from('category_offers').select('*');
  const discountedProduct = applyDiscountToSingleProduct(product, categoryOffers || []);

  if (!discountedProduct) {
    notFound();
  }

  return <ProductDetailClient product={discountedProduct as Product} />;
}
