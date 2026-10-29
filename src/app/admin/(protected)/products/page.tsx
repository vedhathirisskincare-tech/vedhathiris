import { createClient } from '@/utils/supabase/server'
import { ProductsClient } from './ProductsClient'
import { getHomepageFeaturedProductIds } from '../actions'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  const featuredIds = await getHomepageFeaturedProductIds()

  return <ProductsClient initialProducts={products || []} initialFeaturedIds={featuredIds} />
}
