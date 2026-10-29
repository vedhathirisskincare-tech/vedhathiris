"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useCartStore } from "../store/cartStore";
import Link from "next/link";
import { useToast } from "./Toast";

export interface ProductSize {
  size: string;
  price: number;
  stock?: number;
  mrp_price?: number;
  original_price?: number;
  benefits?: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
  image_url?: string; // For backward compatibility if needed
  discount_percentage?: number;
  mrp_price?: number;
  original_price?: number;
  ingredients?: string[]; // Optional ingredients array
  benefits?: string[]; // Key product benefits
  average_rating?: number; // Added for product reviews
  review_count?: number; // Added for product reviews
  sizes?: ProductSize[];
}

export const COMBO_DETAILS: Record<string, { original_price: number, products: string[] }> = {
  "Herbal Soap Trio": { original_price: 666, products: ["Neem Shuddhi Soap", "Manjistha With Green Gram Soap", "Carrot Fresh Soap"] },
  "Natural Glow Soap Trio": { original_price: 666, products: ["Rose Radiance Soap", "Potato, Beetroot & Tomato Soap", "Carrot Fresh Soap"] },
  "Luxury Soap Trio": { original_price: 999, products: ["Charcoal Detox Soap", "Saffron, Tomato & Camel Milk Soap", "Licorice Coffee & Camel Milk Soap"] },
  "Natural Care Trio": { original_price: 1554, products: ["Neem Shuddhi Soap", "Veda Tress Oil", "Crown Elixir 17 Shampoo"] },
  "Premium Family Trio": { original_price: 1665, products: ["Saffron, Tomato & Camel Milk Soap", "Veda Tress Oil", "Keravance Luxe Shampoo"] },
  "Hair Growth Duo": { original_price: 1332, products: ["Veda Tress Oil", "Crown Elixir 17 Shampoo"] },
  "Hair Repair Duo": { original_price: 2332, products: ["Luxury Hair Oil", "Keravance Luxe Shampoo"] },
  "Complete Hair Ritual": { original_price: 2332, products: ["Luxury Hair Oil", "Crown Elixir 17 Shampoo"] },
  "Luxury Hair & Skin Trio": { original_price: 2776, products: ["Papaya Nourish Soap", "Luxury Hair Oil", "Keravance Luxe Shampoo"] }
};

// Helper to generate 4 main ingredients if not provided
function getIngredients(name: string, category: string): string[] {
  const lowerName = name.toLowerCase();
  let main: string[] = [];

  if (lowerName.includes("manjistha")) main.push("Manjistha");
  if (lowerName.includes("green gram")) main.push("Green Gram");
  if (lowerName.includes("potato")) main.push("Potato Extract");
  if (lowerName.includes("beetroot")) main.push("Beetroot");
  if (lowerName.includes("tomato")) main.push("Tomato Extract");
  if (lowerName.includes("rose")) main.push("Rose Petals");
  if (lowerName.includes("carrot")) main.push("Carrot Extract");
  if (lowerName.includes("saffron")) main.push("Saffron");
  if (lowerName.includes("camel milk")) main.push("Camel Milk");
  if (lowerName.includes("charcoal")) main.push("Activated Charcoal");
  if (lowerName.includes("neem")) main.push("Neem Extract");
  if (lowerName.includes("papaya")) main.push("Papaya Extract");
  if (lowerName.includes("banana")) main.push("Banana Extract");
  if (lowerName.includes("oats")) main.push("Oats");
  if (lowerName.includes("almond")) main.push("Almond Oil");
  if (lowerName.includes("rice")) main.push("Rice Water");
  if (lowerName.includes("redsandal") || lowerName.includes("red sandal")) main.push("Red Sandalwood");
  if (lowerName.includes("coffee")) main.push("Coffee Beans");
  if (lowerName.includes("licorice")) main.push("Licorice Extract");

  const defaults = category.toLowerCase().includes("soap") || category.toLowerCase().includes("collection")
    ? ["Coconut Oil", "Shea Butter", "Olive Oil", "Essential Oils"]
    : ["Coconut Oil", "Bhringraj", "Amla", "Hibiscus"];

  return Array.from(new Set([...main, ...defaults])).slice(0, 4);
}

// Helper to get size / capacity strings
function getProductCapacity(product: Product, sizesArray: ProductSize[]): string[] {
  if (sizesArray && sizesArray.length > 0) {
    return sizesArray.map(s => s.size);
  }
  const cat = (product.category || "").toLowerCase();
  const name = product.name.toLowerCase();
  if (name.includes("trio")) return ["3 × 100g"];
  if (name.includes("duo")) return ["2 Units"];
  if (name.includes("shampoo") || cat.includes("shampoo")) return ["200ml"];
  if (name.includes("oil") || cat.includes("oil")) return ["100ml"];
  if (name.includes("mist")) return ["100ml"];
  if (name.includes("serum")) return ["30ml"];
  if (name.includes("wash")) return ["100ml"];
  if (cat.includes("soap") || cat.includes("collection")) return ["100g"];
  if (cat.includes("face") || name.includes("pack") || name.includes("cream")) return ["50g"];
  return ["100g"];
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const rawImagesArray = Array.isArray(product.images)
    ? product.images
    : (typeof product.images === 'string' ? (() => {
      try { return JSON.parse(product.images); } catch {
        // Handle postgres array syntax {url1,url2}
        const imgStr = product.images as unknown as string;
        if (imgStr.startsWith('{') && imgStr.endsWith('}')) {
          return imgStr.slice(1, -1).split(',').map(s => s.replace(/^"|"$/g, '').trim());
        }
        return [];
      }
    })() : []);
  const imagesArray = rawImagesArray.filter((img: any) => typeof img === 'string' && img.trim().length > 0 && (img.startsWith('http') || img.startsWith('/')));
  const imageUrl = imagesArray.length > 0 ? imagesArray[0] : (product.image_url && typeof product.image_url === 'string' && (product.image_url.startsWith('http') || product.image_url.startsWith('/')) ? product.image_url : null);
  const toast = useToast();

  const comboData = product.category === "Combo Packages" ? COMBO_DETAILS[product.name] : null;

  const ingredients = comboData?.products || (product.ingredients && Array.isArray(product.ingredients) && product.ingredients.length > 0
    ? product.ingredients.slice(0, 4)
    : getIngredients(product.name, product.category));

  const sizesArray: ProductSize[] = Array.isArray(product.sizes)
    ? product.sizes
    : (typeof product.sizes === 'string' ? (() => { try { return JSON.parse(product.sizes as string); } catch { return []; } })() : []);

  const hasSizes = sizesArray.length > 0;
  const baseSize = hasSizes ? sizesArray[0] : null;
  const displayPrice = baseSize ? baseSize.price : product.price;

  // Resolve MRP Price: prioritize explicit mrp_price, size mrp_price, combo original_price, or calculated discount
  const mrpPrice = product.mrp_price
    || baseSize?.mrp_price
    || comboData?.original_price
    || product.original_price
    || baseSize?.original_price
    || (product.discount_percentage && product.discount_percentage > 0
        ? Math.round(displayPrice / (1 - product.discount_percentage / 100))
        : null);

  const hasDiscount = Boolean(mrpPrice && mrpPrice > displayPrice);
  const savings = hasDiscount && mrpPrice ? mrpPrice - displayPrice : 0;
  const capacities = getProductCapacity(product, sizesArray);

  return (
    <Link href={`/products/${product.id}`} className="block h-full group">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-skin-primary cursor-pointer h-full flex flex-col"
      >
        {/* Thumbnail Image Section */}
        <div className="relative w-full h-40 sm:h-56 bg-skin-bg flex items-center justify-center p-2 sm:p-6 shrink-0">
          {product.category === "Combo Packages" && imagesArray.length > 1 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              {imagesArray.slice(0, 3).map((img: string, idx: number) => (
                <div
                  key={idx}
                  className={`absolute w-[55%] max-w-[150px] aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.15)] border-2 sm:border-4 border-white transition-all duration-500 ease-out ${
                    idx === 0
                      ? "z-30 rotate-0 group-hover:-translate-y-3 group-hover:scale-105"
                      : idx === 1
                      ? "z-20 rotate-[12deg] translate-x-14 translate-y-1 group-hover:translate-x-20 group-hover:-translate-y-2 group-hover:rotate-[20deg]"
                      : "z-10 -rotate-[12deg] -translate-x-14 translate-y-1 group-hover:-translate-x-20 group-hover:-translate-y-2 group-hover:-rotate-[20deg]"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : imageUrl ? (
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={`object-cover transition-all duration-500 ease-out ${
                  imagesArray.length > 1
                    ? "group-hover:opacity-0 group-hover:scale-105"
                    : "group-hover:scale-105"
                }`}
              />
              {imagesArray.length > 1 && (
                <Image
                  src={imagesArray[1]}
                  alt={`${product.name} - alternate view`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
                />
              )}
            </div>
          ) : (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="text-4xl text-skin-primary"
            >
              ✨
            </motion.div>
          )}

          <div className="hidden sm:block absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-skin-bold shadow-sm border border-skin-primary/30 z-40">
            {product.category}
          </div>

          {hasDiscount && (
            <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-red-600 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold shadow-md z-40">
              {product.discount_percentage && product.discount_percentage > 0
                ? `${product.discount_percentage}% OFF`
                : mrpPrice
                ? `${Math.round(((mrpPrice - displayPrice) / mrpPrice) * 100)}% OFF`
                : "OFFER"}
            </div>
          )}

          {product.average_rating ? (
            <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-skin-bold shadow-sm flex items-center gap-1 border border-skin-primary/15 z-40">
              <span className="text-red-500">❤️</span>
              <span>{product.average_rating.toFixed(1)}</span>
              <span className="text-gray-500 text-[9px] sm:text-[10px] font-normal">({product.review_count})</span>
            </div>
          ) : null}
        </div>

        {/* Card Body: strictly Name, Key Ingredients, Size/Capacity, Pricing, Add to Cart (no description) */}
        <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* 1. Name of the Product */}
            <h3 className="font-serif text-sm sm:text-base md:text-lg font-bold text-skin-bold leading-snug line-clamp-2 min-h-[2.5rem] mb-2.5 group-hover:text-violet-700 transition-colors">
              {product.name}
            </h3>

            {/* 2. Key Ingredients */}
            <div className="mb-2.5">
              <p className="text-[10px] sm:text-[11px] font-bold text-violet-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>🌱</span>
                <span>{product.category === "Combo Packages" ? "Includes" : "Key Ingredients"}</span>
              </p>
              <div className="flex flex-wrap gap-1">
                {ingredients.slice(0, 3).map((ing, idx) => (
                  <span
                    key={idx}
                    className="bg-violet-50 text-violet-900 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium border border-violet-100"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Size / Capacity */}
            <div className="mb-3">
              <p className="text-[10px] sm:text-[11px] font-bold text-violet-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>⚖️</span>
                <span>Size / Capacity</span>
              </p>
              <div className="flex flex-wrap gap-1">
                {capacities.map((cap, idx) => (
                  <span
                    key={idx}
                    className="bg-amber-50 text-amber-900 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold border border-amber-200"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Pricing & 5. Add to Cart */}
          <div className="pt-2.5 border-t border-skin-primary/10 mt-auto">
            {/* Pricing Section: MRP Price Striked Out & Selling Price Clearly Visible */}
            <div className="flex flex-col mb-2.5">
              {hasDiscount && mrpPrice ? (
                <div className="flex items-center gap-1.5 text-xs mb-0.5">
                  <span className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    MRP:
                  </span>
                  <span className="line-through text-gray-400 font-semibold text-xs sm:text-sm">
                    ₹{mrpPrice}
                  </span>
                  {savings > 0 && (
                    <span className="text-green-700 font-bold bg-green-50 px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wider border border-green-200">
                      Save ₹{savings}
                    </span>
                  )}
                </div>
              ) : null}
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] sm:text-xs text-violet-900 font-bold uppercase tracking-wider">
                  Selling Price:
                </span>
                <span className="text-skin-bold font-sans font-extrabold text-base sm:text-xl leading-tight">
                  ₹{displayPrice}
                </span>
              </div>
            </div>

            {/* 5. Add to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault();
                if (hasSizes && baseSize) {
                  useCartStore.getState().addItem(product, baseSize.size, baseSize.price);
                  toast.success(`${product.name} (${baseSize.size}) added to cart!`);
                } else {
                  useCartStore.getState().addItem(product);
                  toast.success(`${product.name} added to cart!`);
                }
              }}
              className="w-full bg-skin-bold hover:bg-violet-700 text-white px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center shadow-md cursor-pointer"
              aria-label={`Add ${product.name} to cart`}
            >
              {hasSizes && baseSize ? `Add ${baseSize.size} to Cart` : "Add to Cart"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
