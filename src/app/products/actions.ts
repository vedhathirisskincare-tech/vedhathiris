"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("You must be logged in to leave a review.");
  }

  const productId = formData.get("product_id") as string;
  const rating = parseInt(formData.get("rating") as string, 10);
  const reviewText = formData.get("review_text") as string;

  if (!productId || isNaN(rating) || rating < 1 || rating > 5) {
    throw new Error("Invalid review data.");
  }

  // Insert or Update the review
  // Since we have a UNIQUE(product_id, user_id) constraint, an upsert works perfectly here
  const { error } = await supabase
    .from("product_reviews")
    .upsert({
      product_id: productId,
      user_id: user.id,
      rating: rating,
      review_text: reviewText,
      // created_at will default to now() on insert
    }, {
      onConflict: 'product_id, user_id'
    });

  if (error) {
    console.error("Error submitting review:", error);
    throw new Error("Failed to submit review. " + error.message);
  }

  // Revalidate the product page to show the new review
  revalidatePath(`/products/${productId}`);
  // Also revalidate the main products list to update average ratings on thumbnails
  revalidatePath(`/`);
  revalidatePath(`/products`);
  
  return { success: true };
}
