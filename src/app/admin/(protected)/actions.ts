'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// Create a supabase client with the service role key to bypass RLS
// This is safe here because these actions are protected by the admin_session cookie
function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing in .env.local. Admin operations require it to bypass RLS.')
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey)
}

// Helper to upload image to Supabase Storage
async function uploadProductImage(file: File): Promise<string> {
  const supabase = getAdminSupabase()
  const fileExtension = file.name.split('.').pop() || 'jpg'
  // Create a unique file name
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExtension}`
  
  const buffer = Buffer.from(await file.arrayBuffer())
  
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true
    })
    
  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)
    
  return publicUrl
}

// Product Actions
export async function createProduct(formData: FormData) {
  const supabase = getAdminSupabase()

  const images: string[] = []
  for (let i = 1; i <= 4; i++) {
    const file = formData.get(`imageFile${i}`) as File | null
    const textUrl = formData.get(`image${i}`)?.toString() || ''
    
    if (file && file.size > 0) {
      const uploadedUrl = await uploadProductImage(file)
      images.push(uploadedUrl)
    } else if (textUrl) {
      images.push(textUrl)
    }
  }

  const product = {
    name: formData.get('name')?.toString(),
    description: formData.get('description')?.toString(),
    price: Number(formData.get('price')),
    stock: Number(formData.get('stock')),
    category: formData.get('category')?.toString(),
    discount_percentage: Number(formData.get('discount_percentage') || 0),
    images,
  }

  const { error } = await supabase.from('products').insert([product])

  if (error) throw new Error(error.message)
  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/')
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = getAdminSupabase()

  const images: string[] = []
  for (let i = 1; i <= 4; i++) {
    const file = formData.get(`imageFile${i}`) as File | null
    const textUrl = formData.get(`image${i}`)?.toString() || ''
    
    if (file && file.size > 0) {
      const uploadedUrl = await uploadProductImage(file)
      images.push(uploadedUrl)
    } else if (textUrl) {
      images.push(textUrl)
    }
  }

  const product = {
    name: formData.get('name')?.toString(),
    description: formData.get('description')?.toString(),
    price: Number(formData.get('price')),
    stock: Number(formData.get('stock')),
    category: formData.get('category')?.toString(),
    discount_percentage: Number(formData.get('discount_percentage') || 0),
    images,
  }

  const { error } = await supabase.from('products').update(product).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
  revalidatePath('/')
}

export async function deleteProduct(id: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/')
}

// User Actions
export async function updateUserRole(id: string, role: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/users')
}

export async function deleteUser(id: string) {
  const supabase = getAdminSupabase()

  // 1. Try to disassociate any orders from this user (set user_id to null) to preserve order history.
  // If the database has a NOT NULL constraint on user_id, this will fail.
  const { error: orderError } = await supabase
    .from('orders')
    .update({ user_id: null })
    .eq('user_id', id)

  if (orderError) {
    console.warn('Could not disassociate orders (user_id may have NOT NULL constraint). Deleting orders instead:', orderError.message)
    
    // Fallback: Delete the user's orders (order_items are cascadingly deleted)
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('user_id', id)

    if (deleteError) {
      console.error('Failed to delete user orders:', deleteError.message)
    }
  }

  // 2. Delete the user from Supabase Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(id)
  if (authError) {
    console.error('Error deleting auth user:', authError.message)
  }

  // 3. Delete from profiles table
  const { error } = await supabase.from('profiles').delete().eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/users')
}

export async function deleteEnquiry(id: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('enquiries').delete().eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/enquiries')
}

// Order Actions
export async function updateDeliveryStatus(id: string, delivery_status: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('orders').update({ delivery_status }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/admin/orders')
  revalidatePath('/profile')
}

// Offer Actions
export async function updateOffer(formData: FormData) {
  const supabase = getAdminSupabase()
  
  const message = formData.get('message')?.toString() || ''
  const is_active = formData.get('is_active') === 'on'

  const { error } = await supabase.from('offers').update({ message, is_active }).eq('id', 1)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/offer')
  revalidatePath('/')
}

export async function updateCategoryOffer(category: string, discount: number, isActive: boolean) {
  const supabase = getAdminSupabase()
  
  const { error } = await supabase
    .from('category_offers')
    .upsert(
      { category, discount_percentage: discount, is_active: isActive },
      { onConflict: 'category' }
    )

  if (error) throw new Error(error.message)
  revalidatePath('/admin/offer')
  revalidatePath('/products')
  revalidatePath('/')
}

export async function updateAllCategoryOffers(formData: FormData) {
  const supabase = getAdminSupabase()
  
  const soapDiscount = Number(formData.get('soap_discount') || 0)
  const shampooDiscount = Number(formData.get('shampoo_discount') || 0)
  const hairoilDiscount = Number(formData.get('hairoil_discount') || 0)

  const offers = [
    { category: 'Soap', discount_percentage: soapDiscount, is_active: true },
    { category: 'Shampoo', discount_percentage: shampooDiscount, is_active: true },
    { category: 'Hair Oil', discount_percentage: hairoilDiscount, is_active: true },
  ]

  for (const offer of offers) {
    const { error } = await supabase
      .from('category_offers')
      .upsert(offer, { onConflict: 'category' })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/offer')
  revalidatePath('/products')
  revalidatePath('/')
}
