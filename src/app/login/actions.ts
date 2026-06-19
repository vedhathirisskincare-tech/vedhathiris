'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const emailOrPhone = formData.get('email') as string
  const password = formData.get('password') as string

  let resolvedEmail = emailOrPhone

  if (emailOrPhone && !emailOrPhone.includes('@')) {
    // Treat as phone number, resolve to email from profiles
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('email')
      .eq('phone', emailOrPhone.trim())
      .maybeSingle()

    if (profile?.email) {
      resolvedEmail = profile.email
    } else {
      redirect('/login?error=No account found with this mobile number')
    }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: resolvedEmail,
    password,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/?toast=login_success')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('mobileNumber') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phone,
      }
    }
  })

  if (error) {
    console.error('Supabase Signup Error:', error.message)
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  // Manually insert/upsert the profile in case the database trigger is missing or failed
  if (data?.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: 'user',
        phone: phone
      }, { onConflict: 'id' })
      
    if (profileError) {
      console.error('Profile Upsert Error:', profileError.message)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/?toast=signup_success')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login?toast=logout_success')
}
