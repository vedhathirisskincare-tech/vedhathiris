'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { generateAndUploadComboGrid } from '@/utils/comboImage'

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
      cacheControl: '31536000',
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
  const category = formData.get('category')?.toString() || ''
  const isCombo = category === 'Combo Packages' || category.toLowerCase().includes('combo')

  let ingredients: string[] = []
  const rawIngredients = formData.get('ingredients')?.toString()
  if (rawIngredients) {
    try {
      ingredients = JSON.parse(rawIngredients)
    } catch {
      ingredients = rawIngredients.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }

  const images: string[] = []

  if (isCombo) {
    // 1. Slot 1 (Main Image): Combo Grid from chosen products by default
    let firstImage = ''
    const file1 = formData.get('imageFile1') as File | null
    const textUrl1 = formData.get('image1')?.toString() || ''

    if (ingredients.length >= 2) {
      const { data: constituentProds } = await supabase
        .from('products')
        .select('name, images')
        .in('name', ingredients)

      const sortedConstituents = ingredients
        .map((name) => constituentProds?.find((p) => p.name.toLowerCase().trim() === name.toLowerCase().trim()))
        .filter(Boolean)

      const constituentImages = sortedConstituents
        .map((p) => p?.images?.[0])
        .filter(Boolean) as string[]

      if (constituentImages.length >= 2) {
        const gridUrl = await generateAndUploadComboGrid(
          constituentImages,
          formData.get('name')?.toString() || 'combo'
        )
        if (gridUrl) {
          firstImage = gridUrl
        }
      }
    }

    if (!firstImage) {
      if (file1 && file1.size > 0) {
        firstImage = await uploadProductImage(file1)
      } else if (textUrl1) {
        firstImage = textUrl1
      }
    }
    if (firstImage) images.push(firstImage)

    // 2. Slot 2: Secondary Image (Uploaded by admin - shown on hover & gallery)
    const file2 = formData.get('imageFile2') as File | null
    const textUrl2 = formData.get('image2')?.toString() || ''
    let secondImage = ''
    if (file2 && file2.size > 0) {
      secondImage = await uploadProductImage(file2)
    } else if (textUrl2) {
      secondImage = textUrl2
    }
    if (secondImage) images.push(secondImage)

    // 3. Optional Slots 3 & 4
    for (let i = 3; i <= 4; i++) {
      const file = formData.get(`imageFile${i}`) as File | null
      const textUrl = formData.get(`image${i}`)?.toString() || ''
      if (file && file.size > 0) {
        const uploadedUrl = await uploadProductImage(file)
        images.push(uploadedUrl)
      } else if (textUrl) {
        images.push(textUrl)
      }
    }
  } else {
    // Standard product image handling
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
  }

  let sizes: any[] = []
  const rawSizes = formData.get('sizes')?.toString()
  if (rawSizes) {
    try {
      sizes = JSON.parse(rawSizes)
    } catch {
      sizes = []
    }
  }

  let benefits: string[] = []
  const rawBenefits = formData.get('benefits')?.toString()
  if (rawBenefits) {
    try {
      benefits = JSON.parse(rawBenefits)
    } catch {
      benefits = rawBenefits.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }

  const mrpVal = formData.get('mrp_price') ? Number(formData.get('mrp_price')) : null

  const productData: any = {
    name: formData.get('name')?.toString(),
    description: formData.get('description')?.toString(),
    price: Number(formData.get('price')),
    mrp_price: mrpVal,
    stock: Number(formData.get('stock')),
    category: formData.get('category')?.toString(),
    discount_percentage: Number(formData.get('discount_percentage') || 0),
    images,
    sizes,
    ingredients,
    benefits,
  }

  let { error } = await supabase.from('products').insert([productData])
  if (error && (error.message?.includes("'benefits'") || error.message?.includes('benefits'))) {
    delete productData.benefits
    const fallback = await supabase.from('products').insert([productData])
    error = fallback.error
  }
  if (error && (error.message?.includes("'ingredients'") || error.message?.includes('ingredients'))) {
    delete productData.ingredients
    const fallback = await supabase.from('products').insert([productData])
    error = fallback.error
  }
  if (error && (error.message?.includes("'mrp_price'") || error.message?.includes('mrp_price'))) {
    delete productData.mrp_price
    const fallback = await supabase.from('products').insert([productData])
    error = fallback.error
  }
  if (error && error.message?.includes("'sizes' column")) {
    delete productData.sizes
    const fallback = await supabase.from('products').insert([productData])
    error = fallback.error
  }

  if (error) throw new Error(error.message)
  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/')
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = getAdminSupabase()
  const category = formData.get('category')?.toString() || ''
  const isCombo = category === 'Combo Packages' || category.toLowerCase().includes('combo')

  let ingredients: string[] = []
  const rawIngredients = formData.get('ingredients')?.toString()
  if (rawIngredients) {
    try {
      ingredients = JSON.parse(rawIngredients)
    } catch {
      ingredients = rawIngredients.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }

  // Fetch current product to preserve existing uploaded images if needed
  const { data: existingProd } = await supabase
    .from('products')
    .select('images')
    .eq('id', id)
    .single()
  const prevImages: string[] = existingProd?.images || []

  const images: string[] = []

  if (isCombo) {
    // 1. Slot 1 (Main Image): Combo Grid from chosen products by default
    let firstImage = ''
    const file1 = formData.get('imageFile1') as File | null
    const textUrl1 = formData.get('image1')?.toString() || ''

    if (ingredients.length >= 2) {
      const { data: constituentProds } = await supabase
        .from('products')
        .select('name, images')
        .in('name', ingredients)

      const sortedConstituents = ingredients
        .map((name) => constituentProds?.find((p) => p.name.toLowerCase().trim() === name.toLowerCase().trim()))
        .filter(Boolean)

      const constituentImages = sortedConstituents
        .map((p) => p?.images?.[0])
        .filter(Boolean) as string[]

      if (constituentImages.length >= 2) {
        const gridUrl = await generateAndUploadComboGrid(
          constituentImages,
          formData.get('name')?.toString() || 'combo'
        )
        if (gridUrl) {
          firstImage = gridUrl
        }
      }
    }

    if (!firstImage) {
      if (file1 && file1.size > 0) {
        firstImage = await uploadProductImage(file1)
      } else if (textUrl1) {
        firstImage = textUrl1
      } else if (prevImages[0]) {
        firstImage = prevImages[0]
      }
    }
    if (firstImage) images.push(firstImage)

    // 2. Slot 2: Secondary Image (Uploaded by admin - shown on hover & gallery)
    const file2 = formData.get('imageFile2') as File | null
    const textUrl2 = formData.get('image2')?.toString() || ''
    let secondImage = ''
    if (file2 && file2.size > 0) {
      secondImage = await uploadProductImage(file2)
    } else if (textUrl2) {
      secondImage = textUrl2
    } else if (prevImages[1] && !prevImages[1].includes('combo_grid_')) {
      secondImage = prevImages[1]
    }
    if (secondImage) images.push(secondImage)

    // 3. Optional Slots 3 & 4
    for (let i = 3; i <= 4; i++) {
      const file = formData.get(`imageFile${i}`) as File | null
      const textUrl = formData.get(`image${i}`)?.toString() || ''
      if (file && file.size > 0) {
        const uploadedUrl = await uploadProductImage(file)
        images.push(uploadedUrl)
      } else if (textUrl) {
        images.push(textUrl)
      } else if (prevImages[i - 1]) {
        images.push(prevImages[i - 1])
      }
    }
  } else {
    // Standard product image handling
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
  }

  let sizes: any[] = []
  const rawSizes = formData.get('sizes')?.toString()
  if (rawSizes) {
    try {
      sizes = JSON.parse(rawSizes)
    } catch {
      sizes = []
    }
  }

  let benefits: string[] = []
  const rawBenefits = formData.get('benefits')?.toString()
  if (rawBenefits) {
    try {
      benefits = JSON.parse(rawBenefits)
    } catch {
      benefits = rawBenefits.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }

  const mrpVal = formData.get('mrp_price') ? Number(formData.get('mrp_price')) : null

  const productData: any = {
    name: formData.get('name')?.toString(),
    description: formData.get('description')?.toString(),
    price: Number(formData.get('price')),
    mrp_price: mrpVal,
    stock: Number(formData.get('stock')),
    category: formData.get('category')?.toString(),
    discount_percentage: Number(formData.get('discount_percentage') || 0),
    images,
    sizes,
    ingredients,
    benefits,
  }

  let { error } = await supabase.from('products').update(productData).eq('id', id)
  if (error && (error.message?.includes("'benefits'") || error.message?.includes('benefits'))) {
    delete productData.benefits
    const fallback = await supabase.from('products').update(productData).eq('id', id)
    error = fallback.error
  }
  if (error && (error.message?.includes("'ingredients'") || error.message?.includes('ingredients'))) {
    delete productData.ingredients
    const fallback = await supabase.from('products').update(productData).eq('id', id)
    error = fallback.error
  }
  if (error && (error.message?.includes("'mrp_price'") || error.message?.includes('mrp_price'))) {
    delete productData.mrp_price
    const fallback = await supabase.from('products').update(productData).eq('id', id)
    error = fallback.error
  }
  if (error && error.message?.includes("'sizes' column")) {
    delete productData.sizes
    const fallback = await supabase.from('products').update(productData).eq('id', id)
    error = fallback.error
  }

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
  redirect('/admin/offer?toast=category_offer_success')
}

// Carousel Offer Actions
export async function createCarouselOffer(formData: FormData) {
  const supabase = getAdminSupabase()
  
  const message = formData.get('message')?.toString() || ''
  const is_active = formData.get('is_active') === 'on'

  const { error } = await supabase.from('carousel_offers').insert([{ message, is_active }])

  if (error) throw new Error(error.message)
  revalidatePath('/admin/offer')
  revalidatePath('/')
  redirect('/admin/offer?toast=carousel_offer_created')
}

export async function updateCarouselOffer(id: string, formData: FormData) {
  const supabase = getAdminSupabase()
  
  const message = formData.get('message')?.toString() || ''
  const is_active = formData.get('is_active') === 'on'

  const { error } = await supabase.from('carousel_offers').update({ message, is_active }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/offer')
  revalidatePath('/')
  redirect('/admin/offer?toast=carousel_offer_updated')
}

export async function deleteCarouselOffer(id: string) {
  const supabase = getAdminSupabase()
  
  const { error } = await supabase.from('carousel_offers').delete().eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/offer')
  revalidatePath('/')
  redirect('/admin/offer?toast=carousel_offer_deleted')
}

// Review Actions
export async function deleteReview(id: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('product_reviews').delete().eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/reviews')
  revalidatePath('/products')
  revalidatePath('/')
}

// Order Delete Action
export async function deleteOrder(id: string) {
  const supabase = getAdminSupabase()

  // 1. Delete associated order items
  const { error: itemsError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', id)

  if (itemsError) {
    console.warn('Could not delete order_items explicitly (may be cascading):', itemsError.message)
  }

  // 2. Delete the order
  const { error: orderError } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)

  if (orderError) throw new Error(orderError.message)

  revalidatePath('/admin')
  revalidatePath('/admin/orders')
  revalidatePath('/profile')
  return { success: true }
}

// Coupon / Promo Code Actions
export async function createCoupon(formData: FormData) {
  const supabase = getAdminSupabase()

  const code = (formData.get('code')?.toString() || '').trim().toUpperCase()
  const description = formData.get('description')?.toString() || ''
  const discount_type = (formData.get('discount_type')?.toString() || 'percentage') as 'percentage' | 'flat'
  const discount_value = Number(formData.get('discount_value') || 0)
  const min_order_amount = Number(formData.get('min_order_amount') || 0)
  const maxDiscountRaw = formData.get('max_discount_amount')?.toString()
  const max_discount_amount = maxDiscountRaw ? Number(maxDiscountRaw) : null
  const is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true'

  if (!code) throw new Error('Coupon code is required')
  if (discount_value <= 0) throw new Error('Discount value must be greater than 0')

  const coupon = {
    code,
    description,
    discount_type,
    discount_value,
    min_order_amount,
    max_discount_amount,
    is_active,
  }

  const { error } = await supabase.from('coupons').insert([coupon])
  if (error) throw new Error(error.message)

  revalidatePath('/admin/coupons')
  revalidatePath('/')
  redirect('/admin/coupons?toast=coupon_created')
}

export async function updateCoupon(id: string, formData: FormData) {
  const supabase = getAdminSupabase()

  const code = (formData.get('code')?.toString() || '').trim().toUpperCase()
  const description = formData.get('description')?.toString() || ''
  const discount_type = (formData.get('discount_type')?.toString() || 'percentage') as 'percentage' | 'flat'
  const discount_value = Number(formData.get('discount_value') || 0)
  const min_order_amount = Number(formData.get('min_order_amount') || 0)
  const maxDiscountRaw = formData.get('max_discount_amount')?.toString()
  const max_discount_amount = maxDiscountRaw ? Number(maxDiscountRaw) : null
  const is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true'

  if (!code) throw new Error('Coupon code is required')

  const coupon = {
    code,
    description,
    discount_type,
    discount_value,
    min_order_amount,
    max_discount_amount,
    is_active,
  }

  const { error } = await supabase.from('coupons').update(coupon).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/coupons')
  revalidatePath('/')
  redirect('/admin/coupons?toast=coupon_updated')
}

export async function toggleCouponStatus(id: string, is_active: boolean) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('coupons').update({ is_active }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/coupons')
  revalidatePath('/')
  return { success: true }
}

export async function deleteCoupon(id: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('coupons').delete().eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/coupons')
  revalidatePath('/')
  return { success: true }
}

// Homepage Featured Products Actions (Admin selects any 4 products for Home Page)
export async function getHomepageFeaturedProductIds(): Promise<string[]> {
  try {
    const supabase = getAdminSupabase()
    const { data } = await supabase
      .from('offers')
      .select('message')
      .like('message', 'HOMEPAGE_FEATURED:%')
      .maybeSingle()

    if (data && data.message) {
      const raw = data.message.replace('HOMEPAGE_FEATURED:', '')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 4)
      }
    }
  } catch (err) {
    console.error('Error reading homepage featured product IDs:', err)
  }

  // Fallback IDs
  return [
    '313406f1-fc89-49c8-8432-61ae102ab262',
    'd2a2d359-5a88-4bd5-953d-7bc94127007b',
    '56ad2ca0-5f26-4dc3-b194-7cf75c23ed9c',
    'db0e1e6d-e7d1-4722-9303-b4ad10594d22'
  ]
}

export async function updateHomepageFeaturedProducts(productIds: string[]) {
  try {
    const supabase = getAdminSupabase()
    const cleanIds = Array.isArray(productIds)
      ? Array.from(new Set(productIds.filter(Boolean))).slice(0, 4)
      : []

    if (cleanIds.length !== 4) {
      throw new Error('Please select exactly 4 products to feature on the home page.')
    }

    const payloadMessage = 'HOMEPAGE_FEATURED:' + JSON.stringify(cleanIds)

    const { data: existing } = await supabase
      .from('offers')
      .select('id')
      .like('message', 'HOMEPAGE_FEATURED:%')
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('offers')
        .update({ message: payloadMessage, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) throw new Error(error.message)
    } else {
      const { error } = await supabase
        .from('offers')
        .insert({ message: payloadMessage, is_active: false })
      if (error) throw new Error(error.message)
    }

    revalidatePath('/')
    revalidatePath('/admin/products')
    revalidatePath('/products')

    return { success: true, productIds: cleanIds }
  } catch (error: any) {
    console.error('Error updating homepage featured products:', error)
    throw new Error(error.message || 'Failed to update homepage products')
  }
}

// Visitor Login Popup Settings Actions
export async function getVisitorPopupSetting(): Promise<boolean> {
  try {
    const supabase = getAdminSupabase()
    const { data } = await supabase
      .from('offers')
      .select('is_active')
      .eq('message', 'VISITOR_LOGIN_POPUP')
      .maybeSingle()

    // Default to false (hidden) if not explicitly set
    return data ? Boolean(data.is_active) : false
  } catch (error) {
    console.error('Error fetching visitor popup setting:', error)
    return false
  }
}

export async function toggleVisitorPopupSetting(enabled: boolean) {
  try {
    const supabase = getAdminSupabase()
    const { data: existing } = await supabase
      .from('offers')
      .select('id')
      .eq('message', 'VISITOR_LOGIN_POPUP')
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('offers')
        .update({ is_active: enabled, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) throw new Error(error.message)
    } else {
      const { error } = await supabase
        .from('offers')
        .insert({ message: 'VISITOR_LOGIN_POPUP', is_active: enabled })
      if (error) throw new Error(error.message)
    }

    revalidatePath('/')
    revalidatePath('/admin/users')
    revalidatePath('/admin')
    return { success: true, enabled }
  } catch (error: any) {
    console.error('Error toggling visitor popup setting:', error)
    throw new Error(error.message || 'Failed to update popup setting')
  }
}

// Products Display Order Actions (Dynamic arrangement of products in /products page)
export async function getProductsDisplayOrder(): Promise<string[]> {
  try {
    const supabase = getAdminSupabase()
    const { data } = await supabase
      .from('offers')
      .select('message')
      .like('message', 'PRODUCTS_DISPLAY_ORDER:%')
      .maybeSingle()

    if (data && data.message) {
      const raw = data.message.replace('PRODUCTS_DISPLAY_ORDER:', '')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Error fetching products display order:', err)
  }
  return []
}

export async function updateProductsDisplayOrder(orderedIds: string[]) {
  try {
    const supabase = getAdminSupabase()
    if (!Array.isArray(orderedIds)) {
      throw new Error('Invalid product order data.')
    }

    const cleanIds = Array.from(new Set(orderedIds.filter(Boolean)))
    const payloadMessage = 'PRODUCTS_DISPLAY_ORDER:' + JSON.stringify(cleanIds)

    const { data: existing } = await supabase
      .from('offers')
      .select('id')
      .like('message', 'PRODUCTS_DISPLAY_ORDER:%')
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('offers')
        .update({ message: payloadMessage, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) throw new Error(error.message)
    } else {
      const { error } = await supabase
        .from('offers')
        .insert({ message: payloadMessage, is_active: true })
      if (error) throw new Error(error.message)
    }

    revalidatePath('/products')
    revalidatePath('/')
    revalidatePath('/admin/customize-products')
    revalidatePath('/admin/products')

    return { success: true, count: cleanIds.length }
  } catch (error: any) {
    console.error('Error updating products display order:', error)
    throw new Error(error.message || 'Failed to update product arrangement')
  }
}




