import type { Metadata } from 'next'
import { login } from './actions'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { PasswordInput } from '@/components/PasswordInput'
import ProductImageCarousel from '@/components/ProductImageCarousel'

export const metadata: Metadata = {
  title: 'Sign In',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    if (params.redirect) {
      redirect(params.redirect)
    }
    redirect('/profile')
  }

  const signupHref = params.redirect
    ? `/signup?redirect=${encodeURIComponent(params.redirect)}`
    : '/signup'

  return (
    <div className="h-[100dvh] w-full flex justify-center items-center p-4 md:p-8 bg-violet-50 overflow-hidden">
      <div className="w-full max-w-5xl h-full max-h-[800px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <img src="/Vedhathiris_Logo.png" alt="Vedhathiris" className="h-20 w-auto object-contain" />
            </Link>
          </div>
          <h2 className="text-2xl font-bold text-center text-violet-600 mb-6 shrink-0">Welcome Back</h2>
          
          {params.error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">
              {params.error}
            </div>
          )}

          <form action={login} className="space-y-4">
            {params.redirect && (
              <input type="hidden" name="redirectTo" value={params.redirect} />
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email or Mobile Number
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="you@example.com or 9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
              >
                Log In
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href={signupHref} className="text-violet-600 hover:underline font-medium">
              Sign up here
            </Link>
          </div>
        </div>

        {/* Right Side: Carousel */}
        <div className="hidden md:block w-full md:w-1/2 p-4">
          <ProductImageCarousel />
        </div>
      </div>
    </div>
  )
}
