'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function adminLogin(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (username === 'rekkamadhu' && password === 'Vedhathiris@1989') {
    const cookieStore = await cookies()
    // Set a simple admin session cookie
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    })
    
    redirect('/admin')
  } else {
    redirect('/admin/login?error=Invalid admin credentials')
  }
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin/login')
}
