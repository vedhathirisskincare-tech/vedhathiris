import type { Metadata } from 'next'
import { signup } from '../login/actions'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { PasswordInput } from '@/components/PasswordInput'
import ProductImageCarousel from '@/components/ProductImageCarousel'

export const metadata: Metadata = {
  title: 'Create Account',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/profile')
  }

  return (
    <div className="h-[100dvh] w-full flex justify-center items-center p-4 md:p-8 bg-violet-50 overflow-hidden">
      <div className="w-full max-w-6xl h-full max-h-[800px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Carousel */}
        <div className="hidden md:block w-full md:w-1/2 p-4">
          <ProductImageCarousel />
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <img src="/Vedhathiris_Logo.png" alt="Vedhathiris" className="h-20 w-auto object-contain" />
            </Link>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-center text-violet-600 mb-4 md:mb-6 shrink-0">Create an Account</h2>
          
          {params.error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">
              {params.error}
            </div>
          )}

          <form action={signup} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="mobileNumber">
                Mobile Number
              </label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                required
                pattern="[0-9]{10,15}"
                title="Please enter a valid mobile number (10 to 15 digits)"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="9876543210"
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
                Sign Up
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-600 hover:underline font-medium">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
