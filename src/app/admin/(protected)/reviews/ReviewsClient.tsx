'use client'

import { useState } from 'react'
import { deleteReview } from '../actions'
import { Trash2 } from 'lucide-react'
import { useToast } from "@/components/Toast"

export function ReviewsClient({ reviews }: { reviews: any[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const toast = useToast()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    setIsDeleting(id)
    try {
      await deleteReview(id)
      toast.success('Review deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete review')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Manage Reviews</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Product</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Customer</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Rating</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600">Review</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Date</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.map((review: any) => (
              <tr key={review.id} className="hover:bg-gray-50">
                <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">{review.products?.name}</td>
                <td className="px-4 md:px-6 py-4 text-sm text-gray-900">{review.profiles?.full_name}</td>
                <td className="px-4 md:px-6 py-4">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`text-sm ${star <= review.rating ? "text-red-500" : "text-gray-300 grayscale opacity-40"}`}>
                        ❤️
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={review.review_text}>
                  {review.review_text || <span className="text-gray-400 italic">No text</span>}
                </td>
                <td className="px-4 md:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(review.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={isDeleting === review.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete Review"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 md:px-6 py-8 text-center text-gray-500">No reviews found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
