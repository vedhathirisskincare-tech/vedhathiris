import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { ReviewsClient } from './ReviewsClient'

export default async function AdminReviewsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

  // Fetch reviews safely without joining profiles to avoid PostgREST FK issues
  const { data: reviewsData, error: reviewError } = await supabase
    .from('product_reviews')
    .select(`
      id, rating, review_text, created_at, user_id, product_id
    `)
    .order('created_at', { ascending: false })

  if (reviewError) {
    console.error("Error fetching reviews:", reviewError)
  }

  let reviewsWithDetails: any[] = []
  
  if (reviewsData && reviewsData.length > 0) {
    // Fetch user profiles
    const userIds = [...new Set(reviewsData.map(r => r.user_id).filter(Boolean))]
    const { data: profiles } = await supabase
      .from('review_profiles')
      .select('id, display_name')
      .in('id', userIds)

    // Fetch products
    const productIds = [...new Set(reviewsData.map(r => r.product_id).filter(Boolean))]
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds)

    reviewsWithDetails = reviewsData.map(r => ({
      ...r,
      profiles: { full_name: profiles?.find(p => p.id === r.user_id)?.display_name || "Verified Customer" },
      products: { name: products?.find(p => p.id === r.product_id)?.name || "Unknown Product" }
    }))
  }

  return <ReviewsClient reviews={reviewsWithDetails} />
}
