"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useCartStore } from "../store/cartStore";
import Link from "next/link";
import { useToast } from "./Toast";

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
  original_price?: number;
  ingredients?: string[]; // Optional ingredients array
  average_rating?: number; // Added for product reviews
  review_count?: number; // Added for product reviews
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

  const originalPrice = comboData?.original_price || product.original_price || product.price;
  const savings = originalPrice > product.price ? originalPrice - product.price : 0;

  return (
    <Link href={`/products/${product.id}`} className="block h-full group">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white rounded-lg sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-skin-primary cursor-pointer h-full flex flex-col"
      >
        <div className="relative w-full h-36 sm:h-56 bg-skin-bg flex items-center justify-center p-1 sm:p-6 shrink-0">
          {product.category === "Combo Packages" && imagesArray.length > 1 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              {imagesArray.slice(0, 3).map((img: string, idx: number) => (
                <div
                  key={idx}
                  className={`absolute w-[55%] max-w-[150px] aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.15)] border-2 sm:border-4 border-white transition-all duration-500 ease-out ${idx === 0 ? "z-30 rotate-0 group-hover:-translate-y-3 group-hover:scale-105" :
                    idx === 1 ? "z-20 rotate-[12deg] translate-x-16 translate-y-1 group-hover:translate-x-24 group-hover:-translate-y-2 group-hover:rotate-[20deg]" :
                      "z-10 -rotate-[12deg] -translate-x-16 translate-y-1 group-hover:-translate-x-24 group-hover:-translate-y-2 group-hover:-rotate-[20deg]"
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
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="text-4xl text-skin-primary"
            >
              ✨
            </motion.div>
          )}
          <div className="hidden sm:block absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-bold text-skin-bold shadow-sm border border-skin-primary z-40">
            {product.category}
          </div>
          {product.discount_percentage && product.discount_percentage > 0 ? (
            <div className="hidden sm:block absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-md z-40">
              {product.discount_percentage}% OFF
            </div>
          ) : null}
          {product.average_rating ? (
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-skin-bold shadow-sm flex items-center gap-1 border border-skin-primary/10 z-40">
              <span className="text-red-500">❤️</span>
              <span>{product.average_rating.toFixed(1)}</span>
              <span className="text-gray-500 text-[10px] font-normal ml-0.5">({product.review_count})</span>
            </div>
          ) : null}
        </div>

        <div className="px-1 py-1 sm:p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-1 sm:mb-2">
              <h3 className="font-serif text-[13px] sm:text-xl font-bold text-skin-bold leading-tight line-clamp-2 pr-1 sm:pr-2">
                {product.name}
              </h3>
            </div>

            <div className="hidden sm:block">
              <p className="text-[#3C096C] font-sans text-sm line-clamp-2 min-h-[2.5rem] opacity-100 font-medium">
                {product.description}
              </p>
            </div>

            {/* Ingredients Section */}
            <div className="hidden sm:flex flex-col mt-2 mb-1 flex-1 justify-start">
              {product.category === "Combo Packages" && (
                <p className="text-[10px] font-bold text-[#3C096C] uppercase tracking-wider mb-1.5 opacity-100">Includes:</p>
              )}
              <div className="flex flex-wrap gap-1.5 items-start">
                {ingredients.map((ing, idx) => (
                  <span key={idx} className="bg-skin-primary/5 text-[#3C096C] px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold border border-skin-primary/20">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1 sm:mt-3">
            <div className="flex flex-col w-full">
              {product.category === "Combo Packages" ? (
                <div className="flex flex-col items-center text-center w-full mt-0.5">
                  <div className="flex flex-col items-center">
                    <span className="hidden sm:inline text-[9px] sm:text-[10px] text-skin-primary uppercase tracking-wider font-bold mb-0.5">Combo Offer:</span>
                    <p className="text-skin-bold font-sans font-extrabold text-[15px] sm:text-2xl leading-tight">
                      ₹{product.price}
                    </p>
                  </div>
                  <div className="flex items-center justify-center mt-0.5 sm:mt-1">
                    {savings > 0 && (
                      <span className="hidden sm:inline-block text-green-700 font-bold bg-green-50 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] uppercase tracking-wider border border-green-100">
                        Save ₹{savings}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {product.original_price && product.original_price > product.price ? (
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="hidden sm:inline text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Original Price:</span>
                      <span className="line-through text-[9px] sm:text-xs font-semibold text-gray-400">
                        ₹{product.original_price}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex flex-col">
                    <span className="hidden sm:inline text-[10px] text-[#3C096C] uppercase tracking-wider font-bold mb-0.5 opacity-100">Price:</span>
                    <p className="text-skin-bold font-sans font-extrabold text-[15px] sm:text-xl leading-tight">
                      ₹{product.price}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.preventDefault();
              useCartStore.getState().addItem(product);
              toast.success(`${product.name} added to cart!`);
            }}
            className="mt-1.5 sm:mt-4 w-full bg-skin-bold hover:bg-skin-primary text-white px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-md sm:rounded-xl text-[10px] sm:text-base font-semibold transition-colors flex items-center justify-center shadow-md"
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
}
