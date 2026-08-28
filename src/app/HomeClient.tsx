"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ProductCard, Product } from "@/components/ProductCard";
import { ShieldCheck, Leaf, Heart, Sparkles, HandHeart, Droplet, Waves, FlaskConical, ChevronDown, MapPin, Award } from "lucide-react";
import { generateFAQSchema } from "@/utils/seo";

const HOME_FAQS = [
  {
    q: "Where can I buy authentic natural soap and herbal skincare in Chennai?",
    a: "Vedhathiri's is a Chennai-based artisan brand delivering pure natural soap in Chennai and organic herbal skincare products in Chennai. Handcrafted in Chetpet, Chennai, we offer fast doorstep delivery across Chennai and Tamil Nadu."
  },
  {
    q: "What makes your handmade soap in Chennai different from commercial soaps?",
    a: "Unlike commercial bars that use harsh synthetic detergents, our handmade soap in Chennai is crafted through traditional cold-process techniques using cold-pressed carrier oils, pure herbal extracts (neem, red sandalwood, saffron, papaya), and natural clays that retain glycerin to protect your skin barrier."
  },
  {
    q: "Do you make natural hair oil and herbal shampoo in Chennai?",
    a: "Yes! We formulate Ayurvedic herbal hair oil in Chennai and natural hair shampoo in Chennai made with hibiscus, bhringraj, rosemary, and cold-pressed botanical oils for comprehensive natural hair care."
  },
  {
    q: "Are your natural skincare products suitable for sensitive skin?",
    a: "Yes. All our herbal skincare and natural soap formulations are free from parabens, sulfates, and artificial fragrances, making them gentle and safe for sensitive skin, teens, and all skin types."
  },
  {
    q: "How fast is delivery for natural skincare orders in Chennai?",
    a: "Orders in Chennai are dispatched within 24 to 48 hours, ensuring you receive fresh, small-batch handmade soaps, shampoos, and hair oils right at your doorstep."
  }
];

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
      {/* FAQ Schema for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(HOME_FAQS)),
        }}
      />

      {/* Hero Section */}
      <section className="relative w-full min-h-[80vh] py-20 md:py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden isolate">
        {/* Video Background with Poster Fallback */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/bg_video/bg_hero.webp"
          className="absolute inset-0 w-full h-full object-cover -z-20"
        >
          <source src="/bg_video/bg_hero.webm" type="video/webm" />
        </video>

        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-skin-bg/40 -z-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 bg-skin-primary/30 backdrop-blur-sm px-6 py-2 rounded-full mb-6 border border-skin-primary shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-skin-bold" />
            <span className="font-sans font-medium tracking-widest uppercase text-xs text-skin-bold">Handcrafted in Chennai • 100% Organic & Chemical-Free</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-skin-bold mb-6 leading-tight drop-shadow-md">
            Natural Skincare & <span className="text-skin-bold/80 italic">Handmade Soap</span> in Chennai
          </h1>
          <p className="font-sans font-medium text-lg md:text-xl text-skin-bold mb-10 max-w-3xl mx-auto drop-shadow">
            Experience the finest herbal skincare in Chennai. Handcrafted cold-processed soaps, authentic herbal hair oils, and natural shampoos made with pure organic botanicals.
          </p>
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-skin-bold text-skin-white px-10 py-4 rounded-full font-sans font-bold text-lg tracking-wide shadow-md transition-all"
            >
              Explore Chennai Collection
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Trust Badges */}
      <section className="w-full py-12 bg-skin-bg shadow-sm z-20 border-y border-skin-primary/30">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-x-8 gap-y-10 md:grid md:grid-cols-5 md:gap-6 text-center">
          {[
            { icon: Sparkles, label: "Premium Quality" },
            { icon: Leaf, label: "100% Organic Herbs" },
            { icon: Heart, label: "Cruelty-Free" },
            { icon: ShieldCheck, label: "Dermatologist Approved" },
            { icon: HandHeart, label: "Handmade in Chennai" },
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
          <h2 className="font-serif text-4xl text-skin-bold mb-4">Handcrafted Personal Care Categories</h2>
          <p className="font-sans text-skin-primary text-lg">Pure, chemical-free wellness crafted locally in Chennai for the entire family.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Natural & Handmade Soaps",
              desc: "Cold-processed herbal soap in Chennai enriched with red sandalwood, neem, and saffron.",
              path: "/products?category=Soap",
              icon: Droplet
            },
            {
              title: "Herbal Hair Shampoos",
              desc: "Natural hair shampoo in Chennai free from sulfates, parabens, and silicones.",
              path: "/products?category=Shampoo",
              icon: Waves
            },
            {
              title: "Natural Hair Oils & Elixirs",
              desc: "Pure herbal hair oil in Chennai for deep nourishment and natural hair care.",
              path: "/products?category=Hair Oil",
              icon: FlaskConical
            },
          ].map((cat, idx) => (
            <Link key={idx} href={cat.path}>
              <motion.div
                whileHover={{ y: -8 }}
                className="bg-skin-white rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer shadow-sm hover:shadow-xl transition-all border border-skin-primary/30 h-full"
              >
                <div className="mb-6 text-skin-primary">
                  <cat.icon size={48} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif font-bold text-2xl text-skin-bold mb-2">{cat.title}</h3>
                <p className="font-sans text-sm text-skin-primary/80 mb-6">{cat.desc}</p>
                <span className="mt-auto font-sans text-sm font-bold tracking-wide text-skin-bold/70 uppercase">Explore Collection &rarr;</span>
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
            🌿 Natural Soap in Chennai • Handmade Herbal Soap • Herbal Skincare Products in Chennai • Natural Hair Oil in Chennai • Herbal Hair Shampoo • Delivery Across Chennai & Tamil Nadu • 100% Chemical-Free & Cruelty-Free 🌿
          </span>
          <span className="font-sans font-medium text-lg tracking-wider pr-8">
            🌿 Natural Soap in Chennai • Handmade Herbal Soap • Herbal Skincare Products in Chennai • Natural Hair Oil in Chennai • Herbal Hair Shampoo • Delivery Across Chennai & Tamil Nadu • 100% Chemical-Free & Cruelty-Free 🌿
          </span>
        </motion.div>
      </section>

      {/* Best Sellers */}
      <section className="w-full py-24 px-6 bg-skin-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-4xl text-skin-bold mb-4">Chennai's Favorite Natural Formulations</h2>
              <p className="font-sans text-skin-primary text-lg">Our top-rated herbal soaps, shampoos, and hair oils loved by customers.</p>
            </div>
            <Link href="/products" className="hidden md:block">
              <span className="font-sans text-skin-bold font-bold border-b border-skin-bold pb-1 hover:text-skin-bold/70 transition-colors">
                View All Products
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

      {/* SEO Feature Block: Chennai Craftsmanship */}
      <section className="w-full py-20 px-6 max-w-7xl mx-auto bg-white rounded-3xl border border-skin-primary/30 my-12 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-skin-primary/20 px-4 py-1.5 rounded-full mb-4 text-xs font-bold text-skin-bold uppercase tracking-wider">
              Authentic Local Craft
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-skin-bold mb-6 font-bold leading-snug">
              Handmade Natural Soap & Herbal Skincare in Chennai
            </h2>
            <p className="font-sans text-skin-bold/80 leading-relaxed mb-4">
              At <strong>Vedhathiri's Skin Care</strong>, we take pride in formulating high-potency <strong>natural skincare in Chennai</strong>. Every batch of <strong>handmade soap in Chennai</strong> is produced using traditional slow-cured cold process methods, locking in natural plant glycerin, vitamins, and therapeutic Ayurvedic botanicals.
            </p>
            <p className="font-sans text-skin-bold/80 leading-relaxed mb-6">
              Whether you are looking for <strong>herbal soap in Chennai</strong> to heal blemishes, <strong>natural hair oil in Chennai</strong> for hair growth, or a gentle <strong>herbal shampoo in Chennai</strong> for your family, our formulations are 100% free of artificial sulfates, parabens, and mineral oils.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Natural Soap in Chennai", "Handmade Soap in Chennai", "Herbal Hair Oil", "Natural Shampoo", "Organic Skincare"].map((tag) => (
                <span key={tag} className="bg-skin-primary/10 text-skin-bold text-xs font-semibold px-3 py-1.5 rounded-lg border border-skin-primary/20">
                  ✓ {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#faf7ff] p-6 rounded-2xl border border-violet-100 flex flex-col gap-2">
              <Leaf className="w-8 h-8 text-violet-600 mb-2" />
              <h3 className="font-serif font-bold text-lg text-skin-bold">Pure Herbs</h3>
              <p className="text-xs text-skin-bold/70 leading-relaxed">Sourced directly from native Tamil Nadu organic farms and trusted botanical suppliers.</p>
            </div>
            <div className="bg-[#faf7ff] p-6 rounded-2xl border border-violet-100 flex flex-col gap-2">
              <HandHeart className="w-8 h-8 text-violet-600 mb-2" />
              <h3 className="font-serif font-bold text-lg text-skin-bold">Small-Batch</h3>
              <p className="text-xs text-skin-bold/70 leading-relaxed">Crafted with precision in small batches in Chennai to preserve natural phytonutrients.</p>
            </div>
            <div className="bg-[#faf7ff] p-6 rounded-2xl border border-violet-100 flex flex-col gap-2">
              <ShieldCheck className="w-8 h-8 text-violet-600 mb-2" />
              <h3 className="font-serif font-bold text-lg text-skin-bold">Chemical Free</h3>
              <p className="text-xs text-skin-bold/70 leading-relaxed">No synthetic fragrances, sodium lauryl sulfate (SLS), or harmful preservatives.</p>
            </div>
            <div className="bg-[#faf7ff] p-6 rounded-2xl border border-violet-100 flex flex-col gap-2">
              <Award className="w-8 h-8 text-violet-600 mb-2" />
              <h3 className="font-serif font-bold text-lg text-skin-bold">Chennai Delivery</h3>
              <p className="text-xs text-skin-bold/70 leading-relaxed">Fast local door-to-door delivery across Chennai and Tamil Nadu districts.</p>
            </div>
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
            <h2 className="font-serif text-4xl text-skin-bold mb-4">Real Experiences from Chennai & Beyond</h2>
            <p className="font-sans text-skin-bold/70 text-lg max-w-xl mx-auto">Hear how our natural handmade soaps and herbal haircare transformed daily skincare rituals.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { id: 1, videoSrc: "/testi/t1.webm", name: "Ananya R. (Chennai)", rating: 5, quote: "The best handmade soap in Chennai! Super gentle on my sensitive skin." },
              { id: 2, videoSrc: "/testi/t2.webm", name: "Vikram S. (Chennai)", rating: 5, quote: "Their herbal hair oil in Chennai has completely stopped my hair fall." },
              { id: 3, videoSrc: "/testi/t3.webm", name: "Priya D. (Chennai)", rating: 5, quote: "Pure herbal ingredients! The natural aroma is therapeutic and authentic." },
              { id: 4, videoSrc: "/testi/t4.webm", name: "Karthik M. (Chennai)", rating: 5, quote: "Excellent quality and handmade care. Highly recommend the shampoo bar!" }
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

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
            <img src="/l1.webp" alt="Handmade Natural Soap Label" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l2.webp" alt="Herbal Skincare Label" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l3.webp" alt="Natural Hair Oil Label" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l4.webp" alt="Herbal Shampoo Label" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l5.webp" alt="Organic Skincare Certification Label" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
          </div>
          {/* Group 2 for seamless loop */}
          <div className="flex gap-8 md:gap-16 items-center">
            <img src="/l1.webp" alt="Handmade Natural Soap Label" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l2.webp" alt="Herbal Skincare Label" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l3.webp" alt="Natural Hair Oil Label" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l4.webp" alt="Herbal Shampoo Label" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
            <img src="/l5.webp" alt="Organic Skincare Certification Label" className="h-32 w-32 md:h-48 md:w-48 object-contain rounded-full shadow-md border border-skin-primary/10 bg-white" />
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl text-skin-bold mb-4">Frequently Asked Questions</h2>
          <p className="font-sans text-skin-primary text-lg">Everything you need to know about our natural soaps, shampoos, and hair oils in Chennai.</p>
        </div>
        <div className="space-y-6">
          {HOME_FAQS.map((faq, idx) => (
            <FAQItem key={idx} faq={faq} />
          ))}
        </div>
      </section>

    </main>
  );
}
