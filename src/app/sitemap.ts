import type { MetadataRoute } from 'next';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SITE_URL, getCanonicalUrl, getLanguageAlternates } from '@/utils/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  let productEntries: MetadataRoute.Sitemap = [];

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
      const { data: products, error } = await supabase
        .from('products')
        .select('id, updated_at, created_at');

      if (!error && products && products.length > 0) {
        productEntries = products.map((product) => {
          const productPath = `/products/${product.id}`;
          return {
            url: getCanonicalUrl(productPath),
            lastModified: product.updated_at || product.created_at || new Date().toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
            alternates: {
              languages: getLanguageAlternates(productPath),
            },
          };
        });
      }
    } catch (e) {
      console.error('Error fetching products for sitemap.xml:', e);
    }
  }

  const staticRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  }> = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/products', priority: 0.9, changeFrequency: 'daily' },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/ingredients', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.5, changeFrequency: 'yearly' },
  ];

  const now = new Date().toISOString();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: getCanonicalUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: getLanguageAlternates(route.path),
    },
  }));

  return [...staticEntries, ...productEntries];
}
