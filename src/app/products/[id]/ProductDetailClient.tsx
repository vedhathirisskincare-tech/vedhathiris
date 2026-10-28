"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { ShieldCheck, Leaf, Heart } from "lucide-react";
import type { Product, ProductSize } from "@/components/ProductCard";
import { useToast } from "@/components/Toast";
import { ProductReviews, type Review } from "./ProductReviews";

export function ProductDetailClient({ 
  product,
  reviews,
  currentUserId 
}: { 
  product: Product;
  reviews: Review[];
  currentUserId: string | null;
}) {
  const { addItem } = useCartStore();
  const toast = useToast();
  
  const rawImagesArray = Array.isArray(product.images)
    ? product.images
    : (typeof product.images === 'string' ? (() => { try { return JSON.parse(product.images); } catch { 
        const imgStr = product.images as unknown as string;
        if (imgStr.startsWith('{') && imgStr.endsWith('}')) {
          return imgStr.slice(1, -1).split(',').map((s: string) => s.replace(/^"|"$/g, ''));
        }
        return []; 
    } })() : []);
  const imagesArray = rawImagesArray.filter((img: any) => typeof img === 'string' && img.trim().length > 0 && (img.startsWith('http') || img.startsWith('/')));
    
  // Handle fallback to single image_url if images array is empty or undefined
  const images = (imagesArray && imagesArray.length > 0) 
    ? imagesArray 
    : (product.image_url && typeof product.image_url === 'string' && (product.image_url.startsWith('http') || product.image_url.startsWith('/')) ? [product.image_url] : []);
    
  const [mainImage, setMainImage] = useState(images[0] || "");

  const sizesArray: ProductSize[] = Array.isArray(product.sizes)
    ? product.sizes
    : (typeof product.sizes === 'string' ? (() => { try { return JSON.parse(product.sizes as string); } catch { return []; } })() : []);

  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(sizesArray[0] || null);

  const currentPrice = selectedSize ? selectedSize.price : product.price;
  const currentStock = selectedSize?.stock !== undefined ? selectedSize.stock : product.stock;

  return (
    <main className="flex-1 min-h-screen bg-skin-bg pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Product Images (Gallery) */}
          <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative w-full h-96 md:h-[500px] bg-white rounded-3xl overflow-hidden shadow-sm border border-skin-primary/20 flex items-center justify-center">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <motion.div 
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="text-8xl text-skin-primary"
                >
                  ✨
                </motion.div>
              )}
              <div className="absolute top-6 left-6 bg-white px-4 py-2 rounded-full text-sm font-bold text-skin-bold shadow-sm border border-skin-primary">
                {product.category}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-2">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-skin-bold shadow-md' : 'border-transparent hover:border-skin-primary/50'}`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx+1}`} fill sizes="96px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-serif text-4xl md:text-5xl text-skin-bold mb-2 leading-tight">
                {product.name}
              </h1>
              
              {product.average_rating ? (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center bg-white/90 px-3 py-1 rounded-full text-sm font-bold text-skin-bold shadow-sm border border-skin-primary/10">
                    <span className="text-red-500 mr-1.5">❤️</span>
                    <span>{product.average_rating.toFixed(1)}</span>
                    <span className="text-gray-500 text-xs font-normal ml-1">({product.review_count} reviews)</span>
                  </div>
                </div>
              ) : null}
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-baseline gap-2">
                  {product.original_price && product.original_price > currentPrice ? (
                    <>
                      <p className="text-3xl font-bold text-skin-bold font-sans">
                        ₹{currentPrice}
                      </p>
                      <span className="line-through text-lg text-gray-400 font-medium font-sans">
                        ₹{product.original_price}
                      </span>
                      <span className="text-red-500 font-extrabold text-sm bg-red-50 px-2.5 py-1 rounded-lg">
                        {product.discount_percentage}% OFF
                      </span>
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-skin-bold font-sans">
                      ₹{currentPrice}
                    </p>
                  )}
                </div>
                {currentStock <= 0 && (
                  <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Multi-Size Variant Selector */}
              {sizesArray.length > 0 && (
                <div className="mb-6 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-skin-primary/20 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-serif font-bold text-base text-skin-bold">
                      Select Size / Volume:
                    </span>
                    {selectedSize && (
                      <span className="text-xs font-semibold text-violet-700 bg-violet-100/60 px-2.5 py-0.5 rounded-full border border-violet-200">
                        Selected: <strong>{selectedSize.size}</strong>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {sizesArray.map((sizeObj, idx) => {
                      const isSelected = selectedSize?.size === sizeObj.size;
                      const isSizeOutOfStock = sizeObj.stock !== undefined && sizeObj.stock <= 0;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isSizeOutOfStock}
                          onClick={() => setSelectedSize(sizeObj)}
                          className={`px-4 py-2.5 rounded-xl border transition-all flex flex-col items-start gap-0.5 cursor-pointer text-left ${
                            isSelected
                              ? 'bg-violet-600 text-white border-violet-600 shadow-md ring-2 ring-violet-200 scale-102'
                              : isSizeOutOfStock
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                              : 'bg-white text-gray-800 border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
                          }`}
                        >
                          <span className="font-bold text-sm">{sizeObj.size}</span>
                          <span className={`text-xs ${isSelected ? 'text-violet-100 font-medium' : 'text-violet-700 font-bold'}`}>
                            {isSizeOutOfStock ? 'Sold Out' : `₹${sizeObj.price}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="prose prose-lg mb-6">
                <p className="text-[#3C096C] text-lg leading-relaxed whitespace-pre-line opacity-100 font-medium">
                  {product.description} 
                </p>
              </div>

              {/* Ingredients Section */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div className="mb-10">
                  <h3 className="font-serif font-bold text-xl text-skin-bold mb-3">Key Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((ingredient, idx) => (
                      <span key={idx} className="bg-skin-primary/10 text-skin-bold font-sans text-sm font-medium px-3 py-1 rounded-full border border-skin-primary/20">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mb-12">
                <motion.button
                  whileHover={{ scale: currentStock > 0 ? 1.02 : 1 }}
                  whileTap={{ scale: currentStock > 0 ? 0.98 : 1 }}
                  disabled={currentStock <= 0}
                  onClick={() => {
                    if (currentStock > 0) {
                      addItem(product, selectedSize?.size, currentPrice);
                      toast.success(`${product.name}${selectedSize ? ` (${selectedSize.size})` : ''} added to cart!`);
                    }
                  }}
                  className={`flex-1 py-4 rounded-xl font-sans font-bold text-lg shadow-md transition-all ${
                    currentStock > 0 
                      ? 'bg-skin-bold text-skin-white hover:shadow-lg cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  {currentStock > 0 
                    ? (selectedSize ? `Add ${selectedSize.size} to Cart • ₹${currentPrice}` : 'Add to Cart')
                    : 'Out of Stock'}
                </motion.button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-skin-primary/20">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="bg-skin-primary/10 p-3 rounded-full text-skin-bold">
                    <Leaf size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-skin-bold">100% Natural</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="bg-skin-primary/10 p-3 rounded-full text-skin-bold">
                    <Heart size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-skin-bold">Cruelty Free</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="bg-skin-primary/10 p-3 rounded-full text-skin-bold">
                    <ShieldCheck size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-skin-bold">Dermatologist Tested</span>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <ProductReviews 
          productId={product.id} 
          reviews={reviews} 
          currentUserId={currentUserId} 
        />
      </div>
    </main>
  );
}
