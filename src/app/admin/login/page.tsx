import { adminLogin } from './actions'
import { PasswordInput } from '@/components/PasswordInput'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams;

  return (
    <div className="flex-1 flex justify-center items-center p-4 bg-gray-900 h-screen">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Admin Access</h2>
          
          {params.error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">
              {params.error}
            </div>
          )}

          <form action={adminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Admin Username"
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
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors cursor-pointer"
              >
                Log In to Dashboard
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700 hover:underline font-medium inline-flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
