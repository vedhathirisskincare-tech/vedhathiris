"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Search, Sparkles, X, Check, Heart, Leaf, Shield, Flame, Zap, HelpCircle, Layers, ShoppingBag, ArrowRight } from "lucide-react";
import { INGREDIENTS, Ingredient } from "@/data/ingredients";
import { Product } from "@/components/ProductCard";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/Toast";

// Helper to parse product name and return corresponding ingredient IDs
const getProductIngredients = (productName: string): string[] => {
  const name = productName.toLowerCase();
  const matched: string[] = [];

  if (name.includes("neem")) {
    matched.push("neem-powder", "neem-essential-oil");
  }
  if (name.includes("redsandal") || name.includes("red sandal") || name.includes("sandal")) {
    matched.push("red-sandal", "sandalwood");
  }
  if (name.includes("saffron")) {
    matched.push("saffron");
  }
  if (name.includes("camel milk") || name.includes("camel-milk")) {
    matched.push("camel-milk");
  }
  if (name.includes("potato")) {
    matched.push("potato-powder");
  }
  if (name.includes("almond")) {
    matched.push("almond-oil");
  }
  if (name.includes("rice")) {
    matched.push("rice", "rice-starch");
  }
  if (name.includes("manjistha")) {
    matched.push("manjistha-root");
  }
  if (name.includes("green gram")) {
    matched.push("green-gram");
  }
  if (name.includes("carrot")) {
    matched.push("carrot-powder");
  }
  if (name.includes("licorice")) {
    matched.push("licorice");
  }
  if (name.includes("coffe") || name.includes("coffee")) {
    matched.push("coffee");
  }
  if (name.includes("beetroot")) {
    matched.push("beetroot-powder");
  }
  if (name.includes("tomato")) {
    matched.push("tomato-powder");
  }
  if (name.includes("charcoal")) {
    matched.push("bamboo-charcoal");
  }
  if (name.includes("oat")) {
    matched.push("oats");
  }
  if (name.includes("rose")) {
    matched.push("rose-petals", "rose-essential-oil");
  }
  if (name.includes("pappaya") || name.includes("papaya")) {
    matched.push("papaya-powder");
  }
  if (name.includes("grow well") || name.includes("kids hair oil")) {
    matched.push("tulsi", "neem-powder", "betel-leaves", "curry-leaves", "almond-oil", "rosemary", "lavender", "karpooravalli");
  }
  if (name.includes("veda tress")) {
    matched.push("neem-powder", "curry-leaves", "rosemary", "orange-peel", "almond-oil", "sesame-oil", "coconut-oil", "lotus-essential-oil", "tea-tree-oil", "jadamanji", "avuri");
  }
  if (name.includes("seraphine aura") || name.includes("hair elixir")) {
    matched.push("argan-oil", "avocado-oil", "olive-oil", "almond-oil", "lotus-essential-oil", "tea-tree-oil", "lavender", "castor-oil");
  }
  if (name.includes("crown elixir")) {
    matched.push("garlic", "onion", "aloe-vera", "pomegranate", "clove", "rosemary", "lavender", "fenugreek", "neem-powder", "hibiscus", "kalonji", "black-pepper", "tea-tree-oil", "herbal-blend");
  }
  if (name.includes("keravance luxe") || name.includes("keravance")) {
    matched.push("aloe-vera", "pomegranate", "keratin", "coconut-cleanser", "milk-protein", "vitamin-e", "vitamin-b5", "natural-fragrance");
  }

  return matched;
};

// Skin type definitions with metadata
const SKIN_TYPES = [
  { id: "Dry", label: "Dry", icon: Flame, desc: "Flaky, tight, or parched skin seeking rich hydration." },
  { id: "Oily", label: "Oily", icon: Zap, desc: "Shiny skin, visible pores, and excess sebum seeking balance." },
  { id: "Sensitive", label: "Sensitive", icon: Heart, desc: "Prone to redness, itching, or irritation seeking gentle care." },
  { id: "Acne-Prone", label: "Acne-Prone", icon: Shield, desc: "Prone to breakouts, blemishes, and inflammation seeking purification." },
  { id: "Dull", label: "Dull", icon: Sparkles, desc: "Lacks radiance, uneven texture, seeking a natural glow." },
  { id: "Mature", label: "Mature", icon: Leaf, desc: "Fine lines, loss of elasticity, seeking cellular renewal." },
  { id: "Combination", label: "Combination", icon: Layers, desc: "Oily T-zone with dry or normal cheeks, seeking balanced hydration." },
  { id: "Normal", label: "Normal", icon: Check, desc: "Balanced, clear skin seeking maintenance and hydration." }
] as const;

type SkinType = typeof SKIN_TYPES[number]["id"];

export default function IngredientsClient({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedSkinType, setSelectedSkinType] = useState<SkinType | null>(null);
  const [activeIngredient, setActiveIngredient] = useState<Ingredient | null>(null);
  const toast = useToast();

  // Category list derived from data
  const categories = useMemo(() => {
    return ["All", "Oils", "Butters", "Clays", "Powders", "Grains", "Luxury", "Essential Oils", "Herbs"];
  }, []);

  // Filter logic
  const filteredIngredients = useMemo(() => {
    return INGREDIENTS.filter((ing) => {
      // Search matches
      const matchesSearch =
        ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ing.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ing.benefits.some(b => b.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ing.properties.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category matches
      const matchesCategory = activeCategory === "All" || ing.category === activeCategory;

      // Skin type matches
      const matchesSkinType = !selectedSkinType || ing.skinTypes.includes(selectedSkinType);

      return matchesSearch && matchesCategory && matchesSkinType;
    });
  }, [searchTerm, activeCategory, selectedSkinType]);

  // Handle click on Skin Type
  const handleSkinTypeToggle = (skinType: SkinType) => {
    if (selectedSkinType === skinType) {
      setSelectedSkinType(null); // Clear filter
    } else {
      setSelectedSkinType(skinType);
    }
  };

  // Get current skin type icon/meta
  const activeSkinTypeInfo = useMemo(() => {
    if (!selectedSkinType) return null;
    return SKIN_TYPES.find(t => t.id === selectedSkinType) || null;
  }, [selectedSkinType]);

  // Get products suited for selected skin type
  const matchingProducts = useMemo(() => {
    if (!selectedSkinType) return [];
    
    return products.filter(product => {
      const ingredientIds = getProductIngredients(product.name);
      return ingredientIds.some(id => {
        const ing = INGREDIENTS.find(i => i.id === id);
        return ing?.skinTypes.includes(selectedSkinType);
      });
    });
  }, [products, selectedSkinType]);

  return (
    <div className="min-h-screen bg-skin-bg pb-24 pt-28 px-4 md:px-8">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-skin-primary/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-96 right-10 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-skin-bold/10 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-skin-bold uppercase mb-4"
          >
            <Sparkles size={14} className="text-skin-bold" />
            The Apothecary Library
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl font-bold text-skin-bold leading-tight mb-6"
          >
            Sacred <span className="italic font-normal">Botanical</span> Elements
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-sans text-skin-bold/80 text-lg leading-relaxed"
          >
            Explore our curated database of the {INGREDIENTS.length} organic oils, pure mineral clays, protective butters, and therapeutic essential oils crafted into our signature skincare collection.
          </motion.p>
        </div>

        {/* 1. Skin Type Matcher Quiz Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/60 border border-skin-primary/30 shadow-lg rounded-3xl p-6 md:p-8 backdrop-blur-md max-w-4xl mx-auto mb-16 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Leaf size={180} className="text-skin-bold" />
          </div>

          <div className="relative z-10">
            <h2 className="font-serif text-2xl font-bold text-skin-bold mb-2 flex items-center gap-2">
              <span className="text-xl">✨</span> Identify Your Skin Match
            </h2>
            <p className="font-sans text-skin-bold/70 text-sm md:text-base mb-6">
              Select your skin type below. Our apothecary system will instantly highlight and filter the natural elements best suited for your daily skin ritual.
            </p>

            {/* Quiz Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
              {SKIN_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedSkinType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleSkinTypeToggle(type.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 ${
                      isSelected
                        ? "bg-skin-bold border-skin-bold text-white shadow-md scale-105"
                        : "bg-white/40 border-skin-primary/30 text-skin-bold hover:bg-white/80 hover:border-skin-primary"
                    }`}
                  >
                    <Icon size={20} className={isSelected ? "text-white mb-2 animate-pulse" : "text-skin-bold/70 mb-2"} />
                    <span className="font-sans font-bold text-xs tracking-wide">{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Selection Description Box */}
            <AnimatePresence mode="wait">
              {selectedSkinType ? (
                <motion.div
                  key={selectedSkinType}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-skin-primary/20 border border-skin-primary/40 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-sans font-bold text-skin-bold text-sm">
                      Ritual Focus: <span className="underline decoration-skin-bold">{selectedSkinType} Skin</span>
                    </h3>
                    <p className="font-sans text-skin-bold/80 text-xs md:text-sm mt-1">
                      {activeSkinTypeInfo?.desc} We found <strong className="text-skin-bold font-bold">{filteredIngredients.length} elements</strong> suited to nourish your skin profile.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSkinType(null)}
                    className="self-start md:self-auto text-xs font-semibold bg-white/80 hover:bg-white text-skin-bold px-3 py-1.5 rounded-full border border-skin-primary/30 shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    Clear Filter <X size={12} />
                  </button>
                </motion.div>
              ) : (
                <div className="text-center py-2 text-xs text-skin-bold/50 italic flex items-center justify-center gap-1">
                  <HelpCircle size={14} /> Click a skin profile above to customize your botanical matches.
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Recommended Products Section */}
        <AnimatePresence>
          {selectedSkinType && matchingProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="mb-16 bg-white/40 border border-skin-primary/30 shadow-lg rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden"
            >
              {/* Subtle visual touch - background blur circles */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-skin-bold/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-skin-primary/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-skin-bold/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-skin-bold uppercase mb-2">
                      <Sparkles size={11} className="text-skin-bold animate-spin" style={{ animationDuration: '3s' }} />
                      Formulations Matched
                    </div>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-skin-bold">
                      Recommended for <span className="italic font-normal text-skin-bold/90">{selectedSkinType} Skin</span>
                    </h2>
                  </div>
                  <Link
                    href="/products"
                    className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-skin-bold hover:text-skin-bold/70 transition-colors self-start sm:self-auto"
                  >
                    View Collection
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchingProducts.map((product) => {
                    const imageUrl = product.images?.[0] || product.image_url;
                    const ingredientIds = getProductIngredients(product.name);
                    
                    // Find which ingredients in this product match the skin type
                    const matchingIngredients = ingredientIds
                      .map(id => INGREDIENTS.find(i => i.id === id))
                      .filter((ing): ing is Ingredient => !!ing && ing.skinTypes.includes(selectedSkinType));

                    return (
                      <motion.div
                        key={product.id}
                        whileHover={{ y: -6 }}
                        className="bg-white/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-skin-primary/20 hover:border-skin-primary/50 flex flex-col h-full"
                      >
                        {/* Product Image */}
                        <Link href={`/products/${product.id}`} className="relative w-full h-48 bg-skin-bg flex items-center justify-center p-4 overflow-hidden group shrink-0">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="text-4xl text-skin-primary animate-pulse">✨</div>
                          )}
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold text-skin-bold shadow-xs border border-skin-primary/30">
                            {product.category}
                          </span>
                        </Link>

                        {/* Product Info */}
                        <div className="p-5 flex flex-col flex-1">
                          <Link href={`/products/${product.id}`} className="block group mb-1">
                            <h3 className="font-serif font-bold text-lg text-skin-bold leading-tight group-hover:text-skin-bold/80 line-clamp-1">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-skin-bold/70 font-sans text-xs line-clamp-2 mb-4 flex-1">
                            {product.description}
                          </p>

                          {/* Matching Ingredients Pill List */}
                          {matchingIngredients.length > 0 && (
                            <div className="mb-4">
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-skin-bold/40 mb-1.5">
                                Active Synergistic Ingredients:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {matchingIngredients.map((ing) => (
                                  <span
                                    key={ing.id}
                                    className="inline-flex items-center gap-1 bg-skin-bold/5 border border-skin-bold/15 text-[10px] font-bold text-skin-bold px-2 py-0.5 rounded-md"
                                  >
                                    <span>{ing.emoji}</span>
                                    <span>{ing.name}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Price & Action */}
                          <div className="flex items-center justify-between pt-3 border-t border-skin-primary/10 mt-auto">
                            <p className="text-skin-bold font-sans font-extrabold text-lg">
                              ₹{product.price}
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => {
                                useCartStore.getState().addItem(product);
                                toast.success(`${product.name} added to cart!`);
                              }}
                              className="bg-skin-bold hover:bg-skin-bold/90 text-white font-sans font-bold text-[10px] tracking-wider uppercase px-4.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <ShoppingBag size={12} />
                              Add to Cart
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Live Search & Categories Tab Bar */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, benefit, or property..."
                className="w-full pl-11 pr-4 py-3 bg-white/70 backdrop-blur-xs border border-skin-primary/40 rounded-full text-skin-bold placeholder-skin-bold/50 focus:outline-hidden focus:ring-2 focus:ring-skin-bold focus:border-transparent transition-all shadow-xs"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-skin-bold/50" size={18} />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-skin-bold/50 hover:text-skin-bold"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Category Scrollable Container */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4 lg:-mx-0 lg:px-0 scrollbar-none flex gap-2">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`relative px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${
                      isActive ? "text-white" : "text-skin-bold/80 hover:text-skin-bold hover:bg-white/40"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryTab"
                        className="absolute inset-0 bg-skin-bold rounded-full -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {cat}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* 3. Results Meta & Grid */}
        <div className="mb-6 flex justify-between items-center text-sm text-skin-bold/60 px-2">
          <p>
            Showing {filteredIngredients.length} of {INGREDIENTS.length} Botanical Elements
          </p>
          {(searchTerm || activeCategory !== "All" || selectedSkinType) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("All");
                setSelectedSkinType(null);
              }}
              className="text-skin-bold font-semibold hover:underline"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {filteredIngredients.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredIngredients.map((ing) => {
                const matchesSkinType = selectedSkinType && ing.skinTypes.includes(selectedSkinType);
                return (
                  <motion.div
                    key={ing.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -6 }}
                    onClick={() => setActiveIngredient(ing)}
                    className="group bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-skin-primary/30 hover:border-skin-primary hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between h-full relative overflow-hidden"
                  >
                    {/* Glowing highlight indicator for skin matcher */}
                    {matchesSkinType && (
                      <div className="absolute inset-0 bg-skin-bold/3 pointer-events-none rounded-3xl border-2 border-skin-bold/40 z-10" />
                    )}

                    <div>
                      {/* Top Header Card */}
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <span className="text-3xl filter drop-shadow-sm">{ing.emoji}</span>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-skin-bold/40 bg-skin-bold/5 px-2 py-0.5 rounded-sm">
                            {ing.category}
                          </span>
                          {matchesSkinType && (
                            <span className="text-[9px] uppercase font-extrabold tracking-wider text-white bg-skin-bold px-2 py-0.5 rounded-full mt-1.5 flex items-center gap-0.5 shadow-xs">
                              Skin Match
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Scientific */}
                      <h3 className="font-serif font-bold text-xl text-skin-bold group-hover:text-skin-bold/80 leading-tight">
                        {ing.name}
                      </h3>
                      <p className="font-serif italic text-xs text-skin-bold/60 mt-0.5 mb-3">
                        {ing.scientificName}
                      </p>

                      {/* Bio Snippet */}
                      <p className="font-sans text-skin-bold/70 text-xs leading-relaxed line-clamp-3 mb-4">
                        {ing.description}
                      </p>
                    </div>

                    {/* Benefit tags and explore button */}
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-1 mb-4">
                        {ing.benefits.slice(0, 2).map((benefit, idx) => (
                          <span
                            key={idx}
                            className="bg-white/80 border border-skin-primary/20 text-[10px] font-bold text-skin-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                      
                      <span className="font-sans font-bold text-[11px] text-skin-bold uppercase tracking-wider group-hover:underline flex items-center gap-1 mt-2">
                        Explore Botanical Profile &rarr;
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/30 rounded-3xl border border-skin-primary/20 backdrop-blur-xs max-w-lg mx-auto"
          >
            <span className="text-4xl">🔍</span>
            <h3 className="font-serif font-bold text-xl text-skin-bold mt-4">No Elements Found</h3>
            <p className="font-sans text-skin-bold/60 text-sm mt-2 px-6">
              We couldn&apos;t find any ingredients matching your current search parameters. Try clearing some filters or searching for terms like &quot;brightening&quot;, &quot;calms&quot;, or &quot;oil&quot;.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("All");
                setSelectedSkinType(null);
              }}
              className="mt-6 bg-skin-bold text-white px-6 py-2 rounded-full font-bold text-xs tracking-wider uppercase hover:bg-skin-bold/90 shadow-md transition-all"
            >
              Reset Filters
            </button>
          </motion.div>
        )}

        {/* 4. Educational Footer Card */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 bg-skin-bold text-skin-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-lg border border-skin-primary/30 flex flex-col md:flex-row items-center gap-8"
        >
          {/* Subtle floral background icon */}
          <div className="absolute -bottom-10 -left-10 text-white/5 pointer-events-none select-none">
            <Sparkles size={200} />
          </div>

          <div className="flex-1 relative z-10 text-center md:text-left">
            <span className="font-sans text-xs tracking-widest uppercase font-bold text-skin-primary/80">Our Purity Standard</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-2 mb-4 leading-tight">
              Honest Formulations, <br />Crafted by Hand
            </h2>
            <p className="font-sans text-skin-white/80 text-sm md:text-base leading-relaxed max-w-xl">
              At Vedhathiri&apos;s, we believe what you put on your body is just as important as what you put in it. We source our herbs, clays, and butters directly from trusted organic farms, preparing each small batch by hand to preserve the active botanical enzymes.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row md:flex-col gap-4 w-full md:w-auto shrink-0 justify-center">
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 flex items-center gap-3">
              <span className="text-2xl">🌱</span>
              <div>
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-skin-primary">100% Organic</h4>
                <p className="font-sans text-[11px] text-skin-white/70">No artificial fillers or synthetic minerals</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 flex items-center gap-3">
              <span className="text-2xl">🧪</span>
              <div>
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-skin-primary">Chemical Free</h4>
                <p className="font-sans text-[11px] text-skin-white/70">Free from SLS, parabens, and phthalates</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 5. Apothecary Detailed Profile Modal Overlay */}
      <AnimatePresence>
        {activeIngredient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIngredient(null)}
            className="fixed inset-0 z-50 bg-skin-bold/40 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()} // Prevent close on clicking modal contents
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative border border-skin-primary/30 max-h-[90vh] flex flex-col"
            >
              {/* Decorative top colored header based on category */}
              <div className="h-4 bg-skin-bold w-full shrink-0" />

              {/* Close Button */}
              <button
                onClick={() => setActiveIngredient(null)}
                className="absolute top-8 right-6 p-2 rounded-full bg-skin-bg text-skin-bold hover:bg-skin-primary/20 transition-colors z-20"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="overflow-y-auto p-6 md:p-8 space-y-6">
                {/* Header Information */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-4xl">{activeIngredient.emoji}</span>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-skin-bold/50 bg-skin-primary/20 px-2 py-0.5 rounded-sm">
                        {activeIngredient.category}
                      </span>
                    </div>
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-skin-bold">
                    {activeIngredient.name}
                  </h2>
                  <p className="font-serif italic text-sm text-skin-bold/60 mt-1">
                    INCI: {activeIngredient.scientificName}
                  </p>
                </div>

                {/* Botanical Overview */}
                <div className="space-y-2">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-skin-bold/50">
                    Botanical Profile
                  </h4>
                  <p className="font-sans text-skin-bold text-sm md:text-base leading-relaxed bg-skin-bg/25 p-4 rounded-2xl border border-skin-primary/10">
                    {activeIngredient.description}
                  </p>
                </div>

                {/* Key Benefits List */}
                <div className="space-y-3">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-skin-bold/50">
                    Primary Skin Benefits
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeIngredient.benefits.map((benefit, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-skin-primary/30 p-3 rounded-xl flex items-center gap-2 shadow-xs"
                      >
                        <div className="bg-skin-bold text-white rounded-full p-1 shrink-0">
                          <Check size={12} />
                        </div>
                        <span className="font-sans font-bold text-xs text-skin-bold leading-tight">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata details (Properties & Skin Types) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-skin-primary/10">
                  
                  {/* Suitable Skin Types */}
                  <div>
                    <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-skin-bold/50 mb-2.5">
                      Recommended Skin Profiles
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeIngredient.skinTypes.map((type) => (
                        <span
                          key={type}
                          className="bg-skin-bold/5 border border-skin-bold/10 text-skin-bold text-[10px] font-bold px-2.5 py-1 rounded-md"
                        >
                          {type} Skin
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Apothecary Attributes */}
                  <div>
                    <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-skin-bold/50 mb-2.5">
                      Apothecary Attributes
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeIngredient.properties.map((prop) => (
                        <span
                          key={prop}
                          className="bg-skin-primary/10 border border-skin-primary/30 text-skin-bold text-[10px] font-bold px-2.5 py-1 rounded-md"
                        >
                          {prop}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Footer Link to products page */}
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href={`/products?category=${activeIngredient.category === "Oils" || activeIngredient.category === "Butters" || activeIngredient.category === "Luxury" ? "Soap" : activeIngredient.category === "Essential Oils" ? "Soap" : activeIngredient.category === "Clays" ? "Soap" : "Soap"}`}
                    onClick={() => setActiveIngredient(null)}
                    className="w-full text-center bg-skin-bold text-white font-sans font-bold text-sm tracking-wider uppercase py-3 rounded-xl shadow-md hover:bg-skin-bold/90 hover:shadow-lg transition-all"
                  >
                    Browse Soaps & Formulations
                  </Link>
                  <button
                    onClick={() => setActiveIngredient(null)}
                    className="w-full sm:w-auto font-sans font-bold text-xs text-skin-bold/60 hover:text-skin-bold uppercase tracking-wider py-3 px-6 text-center"
                  >
                    Close Profile
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
