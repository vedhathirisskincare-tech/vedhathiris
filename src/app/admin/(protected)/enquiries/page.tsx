import { createClient } from '@/utils/supabase/server'
import { EnquiriesClient } from './EnquiriesClient'

export default async function AdminEnquiriesPage() {
  const supabase = await createClient()

  const { data: enquiries } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })

  return <EnquiriesClient initialEnquiries={enquiries || []} />
}
