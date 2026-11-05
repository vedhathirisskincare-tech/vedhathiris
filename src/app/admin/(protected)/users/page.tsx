import { createClient } from '@/utils/supabase/server'
import { UsersClient } from './UsersClient'
import { getVisitorPopupSetting } from '../actions'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const initialPopupEnabled = await getVisitorPopupSetting()

  return <UsersClient initialUsers={users || []} initialPopupEnabled={initialPopupEnabled} />
}
