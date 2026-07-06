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
}

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
  const imageUrl = product.images?.[0] || product.image_url;
  const toast = useToast();
  const ingredients = product.ingredients && product.ingredients.length > 0 
    ? product.ingredients.slice(0, 4) 
    : getIngredients(product.name, product.category);

  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-skin-primary cursor-pointer h-full flex flex-col"
      >
        <div className="relative w-full h-56 bg-skin-bg flex items-center justify-center p-6 shrink-0">
          {imageUrl ? (
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
          <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-bold text-skin-bold shadow-sm border border-skin-primary">
            {product.category}
          </div>
          {product.discount_percentage && product.discount_percentage > 0 ? (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-md">
              {product.discount_percentage}% OFF
            </div>
          ) : null}
        </div>

        <div className="p-5 flex flex-col gap-1 flex-1">
          <h3 className="font-serif font-bold text-lg text-skin-bold leading-tight min-h-[3rem]">
            {product.name}
          </h3>
          <p className="text-skin-primary font-sans text-sm line-clamp-2 min-h-[2.5rem]">
            {product.description}
          </p>
          
          {/* Ingredients Section */}
          <div className="flex flex-wrap gap-1.5 mt-2 mb-1 flex-1 items-start">
            {ingredients.map((ingredient, idx) => (
              <span key={idx} className="bg-skin-primary/10 text-skin-bold font-sans text-[10px] font-medium px-2 py-0.5 rounded-full border border-skin-primary/20 whitespace-nowrap">
                {ingredient}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-col">
              {product.original_price && product.original_price > product.price ? (
                <span className="line-through text-xs font-semibold text-gray-400">
                  ₹{product.original_price}
                </span>
              ) : null}
              <p className="text-skin-bold font-sans font-extrabold text-xl leading-tight">
                ₹{product.price}
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                useCartStore.getState().addItem(product);
                toast.success(`${product.name} added to cart!`);
              }}
              className="bg-skin-bold text-skin-white font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              aria-label="Add to cart"
            >
              Add to Cart
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
