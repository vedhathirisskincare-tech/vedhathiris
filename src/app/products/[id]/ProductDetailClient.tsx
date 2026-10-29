"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { ShieldCheck, Leaf, Heart, ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard, type Product, type ProductSize } from "@/components/ProductCard";
import { useToast } from "@/components/Toast";
import { ProductReviews, type Review } from "./ProductReviews";

export function ProductDetailClient({
  product,
  reviews,
  currentUserId,
  relevantProducts = []
}: {
  product: Product;
  reviews: Review[];
  currentUserId: string | null;
  relevantProducts?: Product[];
}) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const toast = useToast();

  // Keyboard listener for Backspace key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea or contentEditable
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable
      );
      if (e.key === 'Backspace' && !isInput) {
        e.preventDefault();
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push('/products');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const rawImagesArray = Array.isArray(product.images)
    ? product.images
    : (typeof product.images === 'string' ? (() => {
      try { return JSON.parse(product.images); } catch {
        const imgStr = product.images as unknown as string;
        if (imgStr.startsWith('{') && imgStr.endsWith('}')) {
          return imgStr.slice(1, -1).split(',').map((s: string) => s.replace(/^"|"$/g, ''));
        }
        return [];
      }
    })() : []);
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

  // Resolve MRP Price for current variant or product
  const currentMrp = selectedSize?.mrp_price
    || selectedSize?.original_price
    || product.mrp_price
    || product.original_price
    || (product.discount_percentage && product.discount_percentage > 0
      ? Math.round(currentPrice / (1 - product.discount_percentage / 100))
      : null);

  const hasDiscount = Boolean(currentMrp && currentMrp > currentPrice);
  const discountPercent = hasDiscount && currentMrp
    ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100)
    : 0;
  const savings = hasDiscount && currentMrp ? currentMrp - currentPrice : 0;

  return (
    <main className="flex-1 min-h-screen bg-skin-bg pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Backspace Navigation Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/products');
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-skin-bold border border-skin-primary/20 shadow-xs hover:shadow-md hover:bg-violet-50/60 hover:border-violet-300 transition-all text-sm font-bold group cursor-pointer"
            title="Press Backspace key or click to go back"
            aria-label="Back to products collection"
          >
            <ArrowLeft className="w-4 h-4 text-violet-700 transition-transform group-hover:-translate-x-1" />
            <span>Back to Products</span>

          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">

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
              <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-xs px-4 py-2 rounded-full text-sm font-bold text-skin-bold shadow-sm border border-skin-primary/30">
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
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-skin-bold shadow-md' : 'border-transparent hover:border-skin-primary/50'
                      }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="96px" className="object-cover" />
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
              <h1 className="font-serif text-3xl md:text-5xl text-skin-bold mb-3 leading-tight font-bold">
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

              {/* Pricing Section: Striked out MRP & Clearly Visible Selling Price */}
              <div className="mb-6 p-4 rounded-2xl bg-white/80 border border-violet-100 shadow-xs">
                {hasDiscount && currentMrp && (
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider">
                      MRP:
                    </span>
                    <span className="line-through text-lg sm:text-xl text-gray-400 font-bold font-sans">
                      ₹{currentMrp}
                    </span>
                    <span className="text-red-600 bg-red-50 text-xs sm:text-sm font-extrabold px-2.5 py-0.5 rounded-full border border-red-200">
                      {discountPercent}% OFF
                    </span>
                    <span className="text-green-700 bg-green-50 text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full border border-green-200">
                      Save ₹{savings}
                    </span>
                  </div>
                )}

                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-violet-900 uppercase tracking-wider">
                    Selling Price:
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-skin-bold font-sans">
                    ₹{currentPrice}
                  </span>
                  {currentStock <= 0 && (
                    <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Multi-Size Variant Selector */}
              {sizesArray.length > 0 && (
                <div className="mb-6 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-skin-primary/20 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-serif font-bold text-base text-skin-bold">
                      Select Size / Capacity:
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
                      const sizeMrp = sizeObj.mrp_price || sizeObj.original_price;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isSizeOutOfStock}
                          onClick={() => setSelectedSize(sizeObj)}
                          className={`px-4 py-2.5 rounded-xl border transition-all flex flex-col items-start gap-0.5 cursor-pointer text-left ${isSelected
                            ? 'bg-violet-600 text-white border-violet-600 shadow-md ring-2 ring-violet-200 scale-102'
                            : isSizeOutOfStock
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                              : 'bg-white text-gray-800 border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
                            }`}
                        >
                          <span className="font-bold text-sm">{sizeObj.size}</span>
                          <div className="flex items-center gap-1.5 text-xs">
                            {sizeMrp && sizeMrp > sizeObj.price && (
                              <span className={`line-through ${isSelected ? 'text-violet-200' : 'text-gray-400'}`}>
                                ₹{sizeMrp}
                              </span>
                            )}
                            <span className={`${isSelected ? 'text-white font-extrabold' : 'text-violet-700 font-bold'}`}>
                              {isSizeOutOfStock ? 'Sold Out' : `₹${sizeObj.price}`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="prose prose-lg mb-6">
                <p className="text-[#3C096C] text-base sm:text-lg leading-relaxed whitespace-pre-line opacity-100 font-medium">
                  {product.description}
                </p>
              </div>

              {/* Benefits Section */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-amber-950 flex items-center gap-2">
                      <span className="text-amber-600 text-lg">✨</span>
                      <span>Key Benefits</span>
                    </h3>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {product.benefits.length} Benefits
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-y-2.5 gap-x-2 text-xs sm:text-sm font-medium">
                    {product.benefits.map((benefit, idx) => (
                      <Fragment key={idx}>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 border border-amber-200 text-amber-950 font-semibold shadow-2xs">
                          <span className="text-amber-600 font-bold text-xs">✓</span>
                          <span>{benefit}</span>
                        </div>
                        {idx < product.benefits!.length - 1 && (
                          <span className="text-amber-400 font-extrabold text-sm select-none px-1" aria-hidden="true">
                            /
                          </span>
                        )}
                      </Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients Section */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-serif font-bold text-lg text-skin-bold mb-2.5">Key Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((ingredient, idx) => (
                      <span key={idx} className="bg-skin-primary/10 text-skin-bold font-sans text-xs sm:text-sm font-medium px-3 py-1 rounded-full border border-skin-primary/20">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="flex gap-4 mb-10">
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
                  className={`flex-1 py-4 rounded-xl font-sans font-bold text-base sm:text-lg shadow-md transition-all ${currentStock > 0
                    ? 'bg-skin-bold text-white hover:bg-violet-700 hover:shadow-lg cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    }`}
                >
                  {currentStock > 0
                    ? (selectedSize ? `Add ${selectedSize.size} to Cart • ₹${currentPrice}` : `Add to Cart • ₹${currentPrice}`)
                    : 'Out of Stock'}
                </motion.button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-skin-primary/20">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="bg-skin-primary/10 p-3 rounded-full text-skin-bold">
                    <Leaf size={22} strokeWidth={1.5} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-skin-bold">100% Natural</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="bg-skin-primary/10 p-3 rounded-full text-skin-bold">
                    <Heart size={22} strokeWidth={1.5} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-skin-bold">Cruelty Free</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="bg-skin-primary/10 p-3 rounded-full text-skin-bold">
                    <ShieldCheck size={22} strokeWidth={1.5} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-skin-bold">Dermatologist Tested</span>
                </div>
              </div>

            </motion.div>
          </div>
        </div>

        {/* Relevant Products Section */}
        {relevantProducts && relevantProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-skin-primary/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 text-violet-700 font-bold text-xs uppercase tracking-wider mb-1">
                  <span>🌿</span>
                  <span>Handcrafted Recommendations</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-skin-bold">
                  Relevant Products ({relevantProducts.length})
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-violet-700 hover:text-violet-900 group"
              >
                <span>View all products</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {relevantProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}

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
