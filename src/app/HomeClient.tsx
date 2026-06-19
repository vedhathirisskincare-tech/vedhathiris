"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ProductCard, Product } from "@/components/ProductCard";
import { ShieldCheck, Leaf, Heart, Sparkles, HandHeart, Droplet, Waves, FlaskConical, ChevronDown } from "lucide-react";

function FAQItem({ faq }: { faq: { q: string, a: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div 
      className="bg-white p-6 rounded-2xl shadow-sm border border-skin-primary/20 cursor-pointer hover:border-skin-primary/40 transition-colors"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center gap-4">
        <h3 className="font-serif font-bold text-xl text-skin-bold">{faq.q}</h3>
        <button className="text-skin-primary flex-shrink-0" aria-label="Toggle FAQ">
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={24} />
          </motion.div>
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="font-sans text-skin-primary leading-relaxed mt-4">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HomeClient({ bestSellers }: { bestSellers: Product[] }) {
  return (
    <main className="flex-1 flex flex-col min-h-screen bg-skin-bg">
      {/* Hero Section */}
      <section className="relative w-full min-h-[80vh] py-20 md:py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden isolate">
        {/* Desktop Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          poster="/bg_video/bg_hero.webp"
          className="hidden md:block absolute inset-0 w-full h-full object-cover -z-20"
        >
          <source src="/bg_video/bg_hero.mp4" type="video/mp4" />
        </video>
        
        {/* Mobile Image Background */}
        <Image
          src="/bg_video/bg_hero.webp"
          alt="Hero Background"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1px"
          className="md:hidden object-cover -z-20"
        />
        
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-skin-bg/40 -z-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-4xl"
        >
          <div className="inline-block bg-skin-primary/30 backdrop-blur-sm px-6 py-2 rounded-full mb-6 border border-skin-primary shadow-sm">
            <span className="font-sans font-medium tracking-widest uppercase text-xs text-skin-bold">High-End Personal Care</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-skin-bold mb-6 leading-tight drop-shadow-md">
            Elevate Your <span className="text-skin-bold/80 italic">Routine</span>
          </h1>
          <p className="font-sans font-medium text-lg md:text-xl text-skin-bold mb-10 max-w-2xl mx-auto drop-shadow">
            Discover sophisticated, high-end skincare formulated for ultimate radiance and comfort.
          </p>
          <Link href="/products">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-skin-bold text-skin-white px-10 py-4 rounded-full font-sans font-bold text-lg tracking-wide shadow-md transition-all"
            >
              Explore Collection
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Trust Badges */}
      <section className="w-full py-12 bg-skin-bg shadow-sm z-20 border-y border-skin-primary/30">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-x-8 gap-y-10 md:grid md:grid-cols-5 md:gap-6 text-center">
          {[
            { icon: Sparkles, label: "Premium Quality" },
            { icon: Leaf, label: "100% Organic" },
            { icon: Heart, label: "Cruelty-Free" },
            { icon: ShieldCheck, label: "Dermatologist Approved" },
            { icon: HandHeart, label: "Hand Made" },
          ].map((badge, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center gap-3 w-[calc(50%-1rem)] max-w-[150px] md:w-auto shrink-0">
              <div className="text-skin-bold">
                <badge.icon size={36} strokeWidth={1.5} />
              </div>
              <span className="font-sans tracking-wide text-sm font-bold text-skin-bold">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Category Blocks */}
      <section className="w-full py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl text-skin-bold mb-4">Curated Categories</h2>
          <p className="font-sans text-skin-primary text-lg">Find the perfect addition to your ritual.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Cleansing Bars", path: "/products?category=Soap", color: "bg-skin-white", icon: Droplet },
            { title: "Nourishing Washes", path: "/products?category=Shampoo", color: "bg-skin-white", icon: Waves },
            { title: "Elixirs & Oils", path: "/products?category=Hair Oil", color: "bg-skin-white", icon: FlaskConical },
          ].map((cat, idx) => (
            <Link key={idx} href={cat.path}>
              <motion.div 
                whileHover={{ y: -8 }}
                className={`${cat.color} rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer shadow-sm hover:shadow-xl transition-all border border-skin-primary/30`}
              >
                <div className="mb-6 text-skin-primary">
                  <cat.icon size={48} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif font-bold text-2xl text-skin-bold">{cat.title}</h3>
                <span className="mt-4 font-sans text-sm font-bold tracking-wide text-skin-bold/60 uppercase">Explore &rarr;</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Marquee Section */}
      <section className="w-full py-6 bg-skin-bold text-skin-white overflow-hidden border-y border-skin-primary/30 flex items-center">
        <motion.div
          className="flex whitespace-nowrap gap-8"
          animate={{ x: [0, "-50%"] }} 
          transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
        >
          <span className="font-sans font-medium text-lg tracking-wider">
            🌿 100% Handmade Organic Soaps • Chemical-Free Skincare • Pure Herbal Ingredients • Crafted with Traditional Care • Suitable for All Skin Types • Natural Glow, Naturally • Tamil Nadu Wide Delivery • Premium Herbal Soaps, Oils & Shampoos • Cruelty-Free & Eco-Friendly • Freshly Handmade in Small Batches 🌿
          </span>
          <span className="font-sans font-medium text-lg tracking-wider pr-8">
            🌿 100% Handmade Organic Soaps • Chemical-Free Skincare • Pure Herbal Ingredients • Crafted with Traditional Care • Suitable for All Skin Types • Natural Glow, Naturally • Tamil Nadu Wide Delivery • Premium Herbal Soaps, Oils & Shampoos • Cruelty-Free & Eco-Friendly • Freshly Handmade in Small Batches 🌿
          </span>
        </motion.div>
      </section>

      {/* Best Sellers */}
      <section className="w-full py-24 px-6 bg-skin-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-4xl text-skin-bold mb-4">Signature Collection</h2>
              <p className="font-sans text-skin-primary text-lg">Our most coveted formulations.</p>
            </div>
            <Link href="/products" className="hidden md:block">
              <span className="font-sans text-skin-bold font-bold border-b border-skin-bold pb-1 hover:text-skin-bold/70 transition-colors">
                View All
              </span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="w-full py-24 px-6 bg-skin-white/60 backdrop-blur-sm border-t border-skin-primary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-skin-primary/25 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4 border border-skin-primary/40 shadow-sm">
              <span className="font-sans font-bold tracking-widest uppercase text-[10px] text-skin-bold">Customer Stories</span>
            </div>
            <h2 className="font-serif text-4xl text-skin-bold mb-4">Real Results, Real Experiences</h2>
            <p className="font-sans text-skin-bold/70 text-lg max-w-xl mx-auto">Hear what our community has to say about their journey to healthy, glowing skin with Vedhathiri's.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { id: 1, videoSrc: "/testi/t1.webm", name: "Ananya R.", rating: 5, quote: "The organic soaps feel so luxurious and soft on my sensitive skin." },
              { id: 2, videoSrc: "/testi/t2.webm", name: "Vikram S.", rating: 5, quote: "My hair texture has improved drastically since using the elixirs." },
              { id: 3, videoSrc: "/testi/t3.webm", name: "Priya D.", rating: 5, quote: "Pure herbal ingredients! The natural aroma is absolutely therapeutic." },
              { id: 4, videoSrc: "/testi/t4.webm", name: "Karthik M.", rating: 5, quote: "Excellent quality and handmade care. Highly recommend the shampoo bar!" }
            ].map((testi) => (
              <motion.div 
                key={testi.id}
                whileHover={{ scale: 1.03 }}
                className="relative aspect-[9/16] w-full rounded-3xl overflow-hidden bg-black border border-skin-primary/30 shadow-md hover:shadow-2xl transition-all duration-300 group"
              >
                <video 
                  src={testi.videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Dark gradient overlay for text readability at the bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />
                
                {/* Testimonial Quote & Details Overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-10 text-white flex flex-col gap-2 pointer-events-none">
                  <div className="flex gap-0.5 text-amber-400 text-xs select-none">
                    {"★".repeat(testi.rating)}
                  </div>
                  <p className="font-sans text-xs italic font-medium leading-relaxed text-white/95 drop-shadow-md">
                    "{testi.quote}"
                  </p>
                  <span className="font-sans text-[10px] font-bold text-violet-200 mt-1 uppercase tracking-wider">
                    — {testi.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Label Carousel */}
      <section className="w-full py-16 overflow-hidden bg-white border-y border-skin-primary/20">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl text-skin-bold">Our Quality Labels</h2>
        </div>
        <motion.div
          className="flex whitespace-nowrap gap-8 md:gap-16 items-center w-max"
          animate={{ x: ["0%", "-50%"] }} 
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
        >
          {/* Group 1 */}
          <div className="flex gap-8 md:gap-16 items-center">
            <img src="/l1.webp" alt="Label 1" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l2.webp" alt="Label 2" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l3.webp" alt="Label 3" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l4.webp" alt="Label 4" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l5.webp" alt="Label 5" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
          </div>
          {/* Group 2 for seamless loop */}
          <div className="flex gap-8 md:gap-16 items-center">
            <img src="/l1.webp" alt="Label 1" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l2.webp" alt="Label 2" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l3.webp" alt="Label 3" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l4.webp" alt="Label 4" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l5.webp" alt="Label 5" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl text-skin-bold mb-4">Frequently Asked Questions</h2>
          <p className="font-sans text-skin-primary text-lg">Everything you need to know about our products.</p>
        </div>
        <div className="space-y-6">
          {[
            { q: "Are your products suitable for sensitive skin?", a: "Yes! All our products are formulated with gentle, natural ingredients and are dermatologist approved for sensitive skin types." },
            { q: "Do you use artificial fragrances?", a: "No, we use 100% natural essential oils and botanical extracts to scent our products, avoiding any synthetic fragrances." },
            { q: "Are your products cruelty-free?", a: "Absolutely. We never test on animals and ensure all our suppliers follow strict cruelty-free practices." },
            { q: "How long does a soap bar typically last?", a: "With daily use and proper drainage between uses, our soap bars typically last 3-4 weeks." }
          ].map((faq, idx) => (
            <FAQItem key={idx} faq={faq} />
          ))}
        </div>
      </section>

    </main>
  );
}
