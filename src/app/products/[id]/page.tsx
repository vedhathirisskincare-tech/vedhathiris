import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";
import { applyDiscountToSingleProduct, applyDiscountsToProducts } from "@/utils/discount";
import { getCanonicalUrl, getLanguageAlternates } from "@/utils/site";
import { CHENNAI_KEYWORDS, getCategoryKeywords, generateProductSchema, generateBreadcrumbSchema } from "@/utils/seo";
import type { Product } from "@/components/ProductCard";
import type { Review } from "./ProductReviews";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('name, description, image_url, category, price')
    .eq('id', id)
    .maybeSingle();

  const productPath = `/products/${id}`;

  if (!product) {
    return {
      title: "Handcrafted Skincare Product in Chennai",
      description: "Discover handcrafted natural soaps, shampoos, and hair oils at Vedhathiri's Skin Care Chennai.",
      keywords: CHENNAI_KEYWORDS.all,
      alternates: {
        canonical: productPath,
        languages: getLanguageAlternates(productPath),
      },
    };
  }
  const category = (product.category || '').toLowerCase();
  
  let title = `${product.name} | Natural Skincare in Chennai`;
  let description = product.description || `Shop ${product.name} handcrafted with pure botanical ingredients at Vedhathiri's Skin Care Chennai.`;

  if (category.includes('soap')) {
    title = `${product.name} | Natural Handmade Soap in Chennai`;
    description = product.description || `Buy ${product.name}, a pure cold-processed natural handmade herbal soap in Chennai formulated with organic botanicals.`;
  } else if (category.includes('shampoo')) {
    title = `${product.name} | Natural Herbal Shampoo in Chennai`;
    description = product.description || `Shop ${product.name}, a sulfate-free natural herbal hair shampoo in Chennai for gentle scalp care and hair strength.`;
  } else if (category.includes('oil') || category.includes('elixir')) {
    title = `${product.name} | Natural Herbal Hair Oil in Chennai`;
    description = product.description || `Experience ${product.name}, an authentic Ayurvedic natural herbal hair oil in Chennai for deep root-to-tip hair nourishment.`;
  }

  const keywords = [product.name, ...getCategoryKeywords(product.category)];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: productPath,
      languages: getLanguageAlternates(productPath),
    },
    openGraph: {
      title: `${title} | Vedhathiri's`,
      description,
      url: getCanonicalUrl(productPath),
      images: product.image_url ? [{ url: product.image_url, alt: `${product.name} - Handcrafted in Chennai` }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Vedhathiri's`,
      description,
      images: product.image_url ? [product.image_url] : undefined,
    },
  };
}

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

  // Fetch logged in user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch reviews safely without joining profiles to avoid PostgREST FK issues
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select(`
      id, rating, review_text, created_at, user_id
    `)
    .eq('product_id', id)
    .order('created_at', { ascending: false });

  let reviewsWithProfiles: Review[] = [];
  if (reviews && reviews.length > 0) {
    const userIds = [...new Set(reviews.map(r => r.user_id))];
    const { data: profiles } = await supabase
      .from('review_profiles')
      .select('id, display_name')
      .in('id', userIds);
      
    reviewsWithProfiles = reviews.map(r => ({
      ...r,
      profiles: { full_name: profiles?.find(p => p.id === r.user_id)?.display_name || "Verified Customer" }
    })) as Review[];
  }

  // Fetch average rating safely
  const { data: ratingSummary } = await supabase
    .from('product_rating_summary')
    .select('*')
    .eq('product_id', id)
    .single();

  const { data: categoryOffers } = await supabase.from('category_offers').select('*');
  const discountedProduct = applyDiscountToSingleProduct(product, categoryOffers || []) as Product;
  
  if (ratingSummary) {
    discountedProduct.average_rating = ratingSummary.average_rating;
    discountedProduct.review_count = ratingSummary.review_count;
  }

  if (!discountedProduct) {
    notFound();
  }

  // Fetch relevant products: minimum 20 products display for user
  const { data: sameCategoryProducts } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .neq('id', id)
    .limit(24);

  let relevantRaw = sameCategoryProducts || [];

  if (relevantRaw.length < 20) {
    const existingIds = [id, ...relevantRaw.map(p => p.id)];
    const needed = 24 - relevantRaw.length;
    const { data: moreProducts } = await supabase
      .from('products')
      .select('*')
      .not('id', 'in', `(${existingIds.join(',')})`)
      .limit(needed);

    if (moreProducts && moreProducts.length > 0) {
      relevantRaw = [...relevantRaw, ...moreProducts];
    }
  }

  // Fetch rating summaries for all relevant products
  const relevantIds = relevantRaw.map(p => p.id);
  const { data: relevantRatingSummaries } = relevantIds.length > 0
    ? await supabase.from('product_rating_summary').select('*').in('product_id', relevantIds)
    : { data: [] };

  const discountedRelevant = applyDiscountsToProducts(relevantRaw, categoryOffers || []);
  const relevantProducts = discountedRelevant.map(p => {
    const sum = relevantRatingSummaries?.find(rs => rs.product_id === p.id);
    if (sum) {
      return { ...p, average_rating: sum.average_rating, review_count: sum.review_count };
    }
    return p;
  }) as Product[];

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: discountedProduct.name, path: `/products/${id}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            generateProductSchema(discountedProduct),
            generateBreadcrumbSchema(breadcrumbs),
          ]),
        }}
      />
      <ProductDetailClient 
        product={discountedProduct} 
        reviews={reviewsWithProfiles}
        currentUserId={user?.id || null}
        relevantProducts={relevantProducts}
      />
    </>
  );
}
