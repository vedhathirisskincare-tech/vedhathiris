'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

function formatRedirectUrl(baseUrl: string | null, toastParam: string) {
  if (!baseUrl || baseUrl === '/' || baseUrl === '') {
    return `/?toast=${toastParam}`
  }
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}toast=${toastParam}`
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const emailOrPhone = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string | null

  let resolvedEmail = emailOrPhone

  if (emailOrPhone && !emailOrPhone.includes('@')) {
    // Treat as phone number, resolve to email from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('phone', emailOrPhone.trim())
      .maybeSingle()

    if (profile?.email) {
      resolvedEmail = profile.email
    } else {
      const errorQuery = redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ''
      redirect(`/login?error=${encodeURIComponent('No account found with this mobile number')}${errorQuery}`)
    }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: resolvedEmail,
    password,
  })

  if (error) {
    const errorQuery = redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ''
    redirect(`/login?error=${encodeURIComponent(error.message)}${errorQuery}`)
  }

  revalidatePath('/', 'layout')
  redirect(formatRedirectUrl(redirectTo, 'login_success'))
}

export async function loginWithCredentials(emailOrPhone: string, password: string) {
  try {
    const supabase = await createClient()

    let resolvedEmail = emailOrPhone.trim()

    if (resolvedEmail && !resolvedEmail.includes('@')) {
      // Treat as phone number, resolve to email from profiles
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('email')
        .eq('phone', resolvedEmail)
        .maybeSingle()

      if (profile?.email) {
        resolvedEmail = profile.email
      } else {
        return { success: false, error: 'No account found with this mobile number.' }
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: resolvedEmail,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true, user: data.user }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred during login.' }
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const fullName = (formData.get('fullName') as string)?.trim()
  const phone = (formData.get('mobileNumber') as string)?.trim()
  const redirectTo = formData.get('redirectTo') as string | null

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
    const errorQuery = redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ''
    redirect(`/signup?error=${encodeURIComponent(error.message)}${errorQuery}`)
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
  redirect(formatRedirectUrl(redirectTo, 'signup_success'))
}

export async function signupWithCredentials({
  email,
  password,
  fullName,
  phone,
}: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}) {
  try {
    const supabase = await createClient()

    const cleanEmail = email.trim()
    const cleanPhone = phone.trim()
    const cleanName = fullName.trim()

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          phone_number: cleanPhone,
        }
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: cleanEmail,
          full_name: cleanName,
          role: 'user',
          phone: cleanPhone
        }, { onConflict: 'id' })

      if (profileError) {
        console.error('Profile Upsert Error:', profileError.message)
      }
    }

    revalidatePath('/', 'layout')
    return { success: true, user: data?.user }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred during signup.' }
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login?toast=logout_success')
}
