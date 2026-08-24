"use client";

import { useState } from "react";
import { submitReview } from "../actions";
import { useToast } from "@/components/Toast";
import { motion, AnimatePresence } from "framer-motion";

export interface Review {
  id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export function ProductReviews({ 
  productId, 
  reviews, 
  currentUserId 
}: { 
  productId: string;
  reviews: Review[];
  currentUserId: string | null;
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const userHasReviewed = currentUserId ? reviews.some(r => r.user_id === currentUserId) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      toast.error("Please log in to leave a review.");
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error("Please select a valid rating.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("rating", rating.toString());
      formData.append("review_text", reviewText);
      
      await submitReview(formData);
      toast.success("Review submitted successfully!");
      setReviewText("");
      setRating(5);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 pt-12 border-t border-skin-primary/20">
      <h2 className="font-serif text-3xl text-skin-bold mb-8">Customer Reviews</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Review Submission Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-skin-primary/10 sticky top-24">
            <h3 className="font-sans font-bold text-lg text-skin-bold mb-4">
              {userHasReviewed ? "Update Your Review" : "Write a Review"}
            </h3>
            
            {currentUserId ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="text-2xl transition-transform hover:scale-110 focus:outline-none"
                      >
                        {star <= (hoverRating || rating) ? (
                          <span className="text-red-500">❤️</span>
                        ) : (
                          <span className="text-gray-300 grayscale opacity-50">❤️</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="review_text" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review (optional)
                  </label>
                  <textarea
                    id="review_text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-skin-primary/50 outline-none resize-none"
                    placeholder="What did you like or dislike about this product?"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-skin-bold text-white py-3 rounded-xl font-medium hover:bg-skin-primary transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : (userHasReviewed ? "Update Review" : "Submit Review")}
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">Please log in to share your thoughts about this product.</p>
                <a href="/login" className="inline-block bg-skin-bold text-white px-6 py-2 rounded-xl font-medium hover:bg-skin-primary transition-colors">
                  Log In
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-skin-bg/50 rounded-2xl border border-dashed border-skin-primary/30">
              <p className="text-gray-500 text-lg">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <AnimatePresence>
              {reviews.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-skin-primary/10"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-skin-bold">
                        {review.profiles?.full_name || "Verified Customer"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString("en-US", {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-sm ${star <= review.rating ? "text-red-500" : "text-gray-300 grayscale opacity-40"}`}>
                          ❤️
                        </span>
                      ))}
                    </div>
                  </div>
                  {review.review_text && (
                    <p className="text-gray-700 mt-3 whitespace-pre-line leading-relaxed">
                      {review.review_text}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
