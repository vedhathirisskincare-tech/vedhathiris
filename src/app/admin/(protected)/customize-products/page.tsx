import { createClient } from '@/utils/supabase/server'
import { getProductsDisplayOrder } from '../actions'
import { CustomizeProductsClient } from './CustomizeProductsClient'

export const metadata = {
  title: 'Customize Products Arrangement | Admin',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function CustomizeProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const orderedIds = await getProductsDisplayOrder()

  return (
    <CustomizeProductsClient
      initialProducts={products || []}
      initialOrderedIds={orderedIds}
    />
  )
}

