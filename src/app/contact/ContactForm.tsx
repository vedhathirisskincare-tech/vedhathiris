'use client'

import { useState, useTransition } from 'react'
import { submitEnquiry } from './actions'
import { CheckCircle2, AlertCircle, Send } from 'lucide-react'

export function ContactForm() {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        const res = await submitEnquiry(formData)
        if (res.success) {
          setSuccess(true)
          ;(e.target as HTMLFormElement).reset()
        } else {
          setError(res.error || 'Something went wrong. Please try again.')
        }
      } catch (err: any) {
        setError('Failed to connect. Please check your internet and try again.')
      }
    })
  }

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl border border-skin-primary/30 p-8 shadow-sm">
      <h2 className="text-2xl font-serif font-bold text-skin-bold mb-6">Send us a Message</h2>
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3 text-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Thank you!</p>
            <p className="text-sm text-green-700 mt-1">Your enquiry has been submitted successfully. We will get back to you shortly.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Submission Failed</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-skin-bold mb-1.5" htmlFor="name">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-skin-primary focus:ring-2 focus:ring-skin-primary/20 rounded-xl outline-none transition-all font-sans text-gray-900"
            placeholder="John Doe"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-skin-bold mb-1.5" htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-skin-primary focus:ring-2 focus:ring-skin-primary/20 rounded-xl outline-none transition-all font-sans text-gray-900"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-skin-bold mb-1.5" htmlFor="phone">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-skin-primary focus:ring-2 focus:ring-skin-primary/20 rounded-xl outline-none transition-all font-sans text-gray-900"
              placeholder="9876543210"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-skin-bold mb-1.5" htmlFor="message">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-skin-primary focus:ring-2 focus:ring-skin-primary/20 rounded-xl outline-none transition-all font-sans text-gray-900 resize-none"
            placeholder="Write your enquiry here..."
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-6 bg-skin-bold hover:bg-[#3c094c]/90 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-75 disabled:cursor-not-allowed text-sm cursor-pointer"
        >
          {isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Enquiry
            </>
          )}
        </button>
      </form>
    </div>
  )
}
