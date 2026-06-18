"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ChevronDown, 
  Heart, 
  Shield, 
  Leaf, 
  Sparkles, 
  Gift, 
  Users, 
  Flame,
  ArrowRight
} from "lucide-react";

// Ingredient details for Section 6
const FEATURED_INGREDIENTS = [
  { name: "Red Sandalwood", benefit: "Reduces pigmentation, heals acne, and cools sunburns for an even complexion.", emoji: "🪵", bg: "from-red-50 to-orange-50", text: "text-red-900", border: "border-red-200" },
  { name: "Neem", benefit: "Antiseptic, antibacterial leaf that calms breakouts and purifies troubled skin.", emoji: "🍃", bg: "from-green-50 to-emerald-50", text: "text-green-900", border: "border-green-200" },
  { name: "Rose", benefit: "Aromatic cooling agent that tones, hydrates, and restores dry or sensitive skin.", emoji: "🌹", bg: "from-rose-50 to-pink-50", text: "text-rose-900", border: "border-rose-200" },
  { name: "Licorice", benefit: "Naturally inhibits melanin production to brighten dull skin and fade dark spots.", emoji: "🪵", bg: "from-amber-50 to-orange-50", text: "text-amber-900", border: "border-amber-200" },
  { name: "Papaya", benefit: "Natural enzyme papain dissolves dead skin cells for a smooth, resurfaced glow.", emoji: "🥭", bg: "from-orange-50 to-yellow-50", text: "text-orange-900", border: "border-orange-200" },
  { name: "Banana Oats", benefit: "Deeply soothing, moisturizing, and skin-softening combination for delicate skin.", emoji: "🥣", bg: "from-yellow-50 to-stone-50", text: "text-yellow-900", border: "border-yellow-200" },
  { name: "Camel Milk", benefit: "High in lactic acid and protective proteins that moisturize and gently renew skin cells.", emoji: "🐫", bg: "from-purple-50 to-indigo-50", text: "text-purple-900", border: "border-purple-200" },
  { name: "Saffron", benefit: "Precious spice containing powerful antioxidants that boost cell repair and radiance.", emoji: "🪡", bg: "from-rose-50 to-red-50", text: "text-rose-900", border: "border-rose-200" },
  { name: "Charcoal", benefit: "Activated bamboo charcoal draws out deep impurities, balancing excess sebum.", emoji: "🖤", bg: "from-zinc-50 to-neutral-100", text: "text-zinc-900", border: "border-zinc-200" },
  { name: "Manjistha", benefit: "Ayurvedic root that purifies locally, reduces pigmentation, and tones the skin.", emoji: "🍁", bg: "from-red-50 to-rose-50", text: "text-red-950", border: "border-red-200" }
];

// Milestones for Section 5
const MILESTONES = [
  {
    id: 1,
    year: "Early 2022",
    title: "Homemade Experiments",
    description: "It began in a small home kitchen. Sourcing raw coconut oils, therapeutic herbs, and organic clays to formulate small, chemical-free soap batches.",
    icon: Flame,
    color: "bg-orange-500"
  },
  {
    id: 2,
    year: "Late 2022",
    title: "Family Testing",
    description: "Our husband and children were the first testers. Seeing dry skin clear up, itchiness fade, and skin barrier strength return verified our recipes.",
    icon: Heart,
    color: "bg-red-500"
  },
  {
    id: 3,
    year: "Mid 2023",
    title: "Friends Requesting Products",
    description: "We started gifting soap batches to close friends. Within weeks, they came back requesting more, shocked by the results on their children's skin.",
    icon: Gift,
    color: "bg-purple-500"
  },
  {
    id: 4,
    year: "Late 2023",
    title: "Growing Local Trust",
    description: "Word of mouth spread. Neighbors and local families began ordering monthly batches, looking to escape commercial chemicals.",
    icon: Users,
    color: "bg-blue-500"
  },
  {
    id: 5,
    year: "Early 2024",
    title: "Launching Vedhathiris",
    description: "Established Vedhathiris Skin Care. We combined scientific standards with the pure, handcrafted integrity of our very first batch.",
    icon: Sparkles,
    color: "bg-violet-600"
  }
];

export default function AboutClient() {
  const [activeMilestone, setActiveMilestone] = useState(0);
  const targetRef = useRef<HTMLDivElement>(null);
  
  // Custom scroll animations for parallax
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div className="flex-1 w-full bg-skin-bg overflow-x-hidden font-sans">
      
      {/* SECTION 1: HERO SECTION */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden select-none">
        {/* Full-screen Hero Banner image background */}
        <div className="absolute inset-0 w-full h-full -z-20 bg-[#f7f4fc]">
          <Image
            src="/story/hero_bg.png"
            alt="Warm sunrise over herbal fields background"
            fill
            sizes="100vw"
            className="object-cover object-center brightness-95 opacity-90"
            priority
          />
        </div>
        {/* Soft elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-skin-bg/30 via-white/10 to-skin-bg/40 -z-10" />

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl px-6 relative z-10"
        >
          <div className="inline-block bg-white/60 backdrop-blur-md px-5 py-2 rounded-full border border-skin-primary/30 shadow-xs mb-6">
            <span className="font-sans font-extrabold tracking-widest uppercase text-xs text-skin-bold">The Heart of Our Brand</span>
          </div>
          <h1 className="font-serif text-5xl md:text-8xl text-skin-bold font-bold mb-6 leading-tight drop-shadow-xs">
            Born From a <br /><span className="italic font-normal">Mother&apos;s</span> Love
          </h1>
          <p className="font-sans font-medium text-lg md:text-xl text-skin-bold max-w-2xl mx-auto leading-relaxed drop-shadow-xs mb-10">
            What began as a search for safe skincare for her husband and children became a journey to create natural products for every family.
          </p>

          <button
            onClick={() => {
              document.getElementById("concern")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-skin-bold hover:bg-skin-bold/90 text-skin-white font-bold px-10 py-4 rounded-full text-lg tracking-wide shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2 group cursor-pointer"
          >
            Discover Our Journey 
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-skin-bold cursor-pointer"
          onClick={() => {
            document.getElementById("concern")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span className="text-xs uppercase tracking-widest font-extrabold text-skin-bold/60">Scroll Down</span>
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* SECTION 2: THE CONCERN */}
      <section id="concern" className="relative py-28 px-6 max-w-7xl mx-auto overflow-hidden">
        {/* Floating ingredient illustrations */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Coconut */}
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 8, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-[5%] bg-white/70 shadow-md p-4 rounded-full border border-skin-primary/30 flex items-center justify-center text-3xl"
          >
            🥥
          </motion.div>
          {/* Neem */}
          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -10, 0], rotate: [0, -12, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 left-[10%] bg-white/70 shadow-md p-4 rounded-full border border-skin-primary/30 flex items-center justify-center text-3xl"
          >
            🍃
          </motion.div>
          {/* Rose */}
          <motion.div
            animate={{ y: [0, -18, 0], x: [0, 12, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-20 right-[5%] bg-white/70 shadow-md p-4 rounded-full border border-skin-primary/30 flex items-center justify-center text-3xl"
          >
            🌹
          </motion.div>
          {/* Saffron */}
          <motion.div
            animate={{ y: [0, 15, 0], x: [0, -8, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-10 right-[15%] bg-white/70 shadow-md p-4 rounded-full border border-skin-primary/30 flex items-center justify-center text-3xl"
          >
            🪡
          </motion.div>
          {/* Camel Milk */}
          <motion.div
            animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute top-[40%] right-[8%] bg-white/70 shadow-md p-4 rounded-full border border-skin-primary/30 flex items-center justify-center text-3xl"
          >
            🐫
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* Left Column: Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative w-full h-[450px] md:h-[550px] rounded-3xl overflow-hidden shadow-2xl border border-skin-primary/30"
          >
            <Image
              src="/story/mother_concern.png"
              alt="A mother examining commercial skincare product ingredients in a sunlit home kitchen"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-skin-bold/20 to-transparent pointer-events-none" />
          </motion.div>

          {/* Right Column: Story Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-6 lg:pl-6"
          >
            <div className="inline-flex items-center gap-2 text-skin-bold font-bold tracking-widest text-xs uppercase bg-white/50 px-4 py-1.5 rounded-full border border-skin-primary/20">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" /> The Challenge
            </div>
            
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-skin-bold leading-tight">
              A Mother&apos;s Growing Concern
            </h2>
            
            <p className="font-sans text-skin-bold/80 text-base md:text-lg leading-relaxed whitespace-pre-line">
              It started simply—reading labels. Like millions of mothers around the world, our founder became increasingly alarmed by the complex list of chemicals printed on the backs of everyday family soaps and baby products. 
              
              Parabens, synthetic foaming agents, artificial fragrances, and chemical petroleum-derivatives were standard additions, even in products marketed as &quot;gentle&quot; or &quot;pure.&quot;
            </p>
            
            <div className="p-6 bg-white/40 border-l-4 border-skin-bold rounded-r-2xl backdrop-blur-xs">
              <p className="font-serif italic text-skin-bold text-lg">
                &quot;My family was developing dry patches, rashes, and breakouts. I realized that to protect them, I had to stop looking for solutions on commercial shelves, and start creating them myself.&quot;
              </p>
            </div>

            <p className="font-sans text-skin-bold/70 text-sm md:text-base leading-relaxed">
              Equipped with botanical research and a deep commitment, she began seeking out raw, traditional skin-calming elements to restore their skin&apos;s natural barrier.
            </p>
          </motion.div>

        </div>
      </section>

      {/* SECTION 3: RETURNING TO NATURE */}
      <section ref={targetRef} className="relative w-full py-32 bg-skin-bold text-skin-white overflow-hidden">
        {/* Parallax background */}
        <motion.div 
          style={{ y: yBg }}
          className="absolute inset-0 w-full h-[120%] -z-10 opacity-15"
        >
          <Image
            src="/story/workspace_bg.png"
            alt="Soap-making workspace background"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto mb-16"
          >
            <span className="font-sans font-bold tracking-widest text-xs uppercase text-skin-primary">Traditional Craftsmanship</span>
            <h2 className="font-serif text-4xl md:text-6xl font-bold mt-2 mb-6 leading-tight">
              Returning To Nature
            </h2>
            <p className="font-sans text-skin-white/80 text-lg md:text-xl leading-relaxed">
              We stepped backward in time to move forward in health. Embracing old-world wisdom, we set up a workspace of wooden bowls, clay grinding vessels, and organic herbs to build clean, traditional soap blocks.
            </p>
          </motion.div>

          {/* Timeline Process */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative mt-12">
            
            {/* Visual connector line for desktop */}
            <div className="hidden md:block absolute top-[44px] left-[12%] right-[12%] h-0.5 bg-white/20 -z-10" />

            {[
              { step: "01", title: "Research", desc: "Studying traditional Siddha & Ayurvedic texts to locate skin-healing botanicals." },
              { step: "02", title: "Learning", desc: "Understanding the science of cold-process saponification and pH balancing." },
              { step: "03", title: "Experimenting", desc: "Blending batches with rich mango butters, clays, and whole oat grains." },
              { step: "04", title: "Creating", desc: "Curing the handmade bars naturally for 6 weeks to achieve gentle perfection." }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-white text-skin-bold flex items-center justify-center font-bold text-lg shadow-md mb-4">
                  {item.step}
                </div>
                <h3 className="font-serif font-bold text-xl mb-2">{item.title}</h3>
                <p className="font-sans text-skin-white/70 text-xs md:text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}

          </div>
        </div>
      </section>

      {/* SECTION 4: CRAFTED FOR FAMILY FIRST */}
      <section className="relative py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-white/50 px-4 py-1.5 rounded-full border border-skin-primary/30 text-skin-bold font-bold text-xs uppercase tracking-widest mb-4">
            <Heart size={14} className="text-skin-bold" />
            Tested On Loved Ones
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-skin-bold leading-tight mb-4">
            Every Product Was First Made For Our Own Family
          </h2>
          <p className="font-sans text-skin-bold/70 text-lg">
            We never set out to launch a commercial product catalog. Every bar and bottle was created to soothe actual skin issues of our own husband, daughters, and sons.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Silhouettes / Family values elements */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: "Husband", icon: "👤", desc: "Formulated to calm heavy shaving burn and dry patches." },
              { title: "Children", icon: "🧒", desc: "Extra-gentle bars created for sensitive, young skin barriers." },
              { title: "Handmade Soap Bars", icon: "🧼", desc: "Cold-cured naturally, retaining healing botanical enzymes." },
              { title: "Natural Ingredients", icon: "🌱", desc: "Hand-picked herbs, raw milk, and premium cold-pressed oils." }
            ].map((el, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white/55 backdrop-blur-xs p-6 rounded-2xl border border-skin-primary/20 flex flex-col items-center text-center shadow-xs"
              >
                <span className="text-4xl mb-3">{el.icon}</span>
                <h4 className="font-serif font-bold text-skin-bold text-base mb-1">{el.title}</h4>
                <p className="font-sans text-skin-bold/60 text-xs leading-relaxed">{el.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Emotional Quote Card Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-full flex flex-col justify-center"
          >
            {/* Visual background image of family sunset */}
            <div className="relative w-full h-80 rounded-3xl overflow-hidden shadow-xl border border-skin-primary/30 mb-6 bg-purple-50">
              <Image
                src="/story/family_bg.png"
                alt="Cozy silhouette of family in sunset field background"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-skin-bold/10" />
            </div>

            <div className="bg-white/80 p-8 rounded-3xl border border-skin-primary/30 shadow-lg relative overflow-hidden backdrop-blur-xs flex flex-col justify-center">
              <span className="text-6xl text-skin-primary/30 font-serif leading-none select-none absolute top-4 left-4">“</span>
              <p className="font-serif italic text-2xl md:text-3xl text-skin-bold leading-relaxed relative z-10 pl-6 mb-4">
                If it wasn&apos;t safe for our family, it wasn&apos;t ready for yours.
              </p>
              <p className="font-sans text-xs uppercase font-extrabold tracking-widest text-skin-bold/50 relative z-10 pl-6">
                - The Family Promise
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* SECTION 5: THE BEGINNING OF VEDHATHIRIS */}
      <section className="relative py-28 px-6 bg-skin-primary/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-sans font-bold tracking-widest text-xs uppercase text-skin-bold/60">Our Timeline</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-skin-bold mt-2">
              The Beginning of Vedhathiris
            </h2>
            <p className="font-sans text-skin-bold/80 text-sm md:text-base mt-3">
              Explore the key milestones that transformed a home remedy project into a trusted natural skincare brand.
            </p>
          </div>

          {/* Interactive Vertical Timeline */}
          <div className="relative border-l-2 border-skin-bold/20 ml-4 md:ml-32 space-y-12">
            {MILESTONES.map((milestone, idx) => {
              const MilestoneIcon = milestone.icon;
              const isActive = activeMilestone === idx;
              
              return (
                <div 
                  key={milestone.id}
                  className="relative pl-8 md:pl-12 group cursor-pointer"
                  onClick={() => setActiveMilestone(idx)}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-0 -translate-x-[11px] top-1.5 w-5 h-5 rounded-full border-2 border-skin-bg transition-all duration-300 ${
                    isActive 
                      ? "bg-skin-bold scale-125 shadow-md shadow-skin-bold/20" 
                      : "bg-white border-skin-bold/40 group-hover:bg-skin-bold/60"
                  }`} />

                  {/* Absolute Year Badge for Desktop */}
                  <div className="hidden md:block absolute -left-[140px] top-1 text-right w-24">
                    <span className={`font-sans font-bold text-sm tracking-wider uppercase transition-colors duration-300 ${
                      isActive ? "text-skin-bold font-extrabold" : "text-skin-bold/50"
                    }`}>
                      {milestone.year}
                    </span>
                  </div>

                  {/* Mobile Year Badge */}
                  <div className="md:hidden block mb-1">
                    <span className="font-sans font-bold text-xs tracking-wider uppercase text-skin-bold/60">
                      {milestone.year}
                    </span>
                  </div>

                  {/* Milestone Card */}
                  <motion.div
                    animate={{ 
                      backgroundColor: isActive ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.4)",
                      borderColor: isActive ? "var(--color-skin-primary)" : "rgba(194, 164, 252, 0.2)"
                    }}
                    className="border p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg text-white ${milestone.color}`}>
                        <MilestoneIcon size={16} />
                      </div>
                      <h3 className="font-serif font-bold text-xl text-skin-bold">
                        {milestone.title}
                      </h3>
                    </div>

                    <p className="font-sans text-skin-bold/75 text-sm leading-relaxed">
                      {milestone.description}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 6: NATURE'S FINEST INGREDIENTS */}
      <section className="relative py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-sans font-bold tracking-widest text-xs uppercase text-skin-bold/60">Pure Botanical Showcase</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-skin-bold mt-2 mb-4">
            Nature&apos;s Finest Ingredients
          </h2>
          <p className="font-sans text-skin-bold/70 text-lg">
            We curate elements loaded with raw vitamins, natural enzymes, and protective minerals. Here are the stars of our soap formulations.
          </p>
        </div>

        {/* Ingredients Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {FEATURED_INGREDIENTS.map((ing, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`bg-white border border-skin-primary/30 rounded-2xl p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between h-full relative overflow-hidden`}
            >
              <div>
                <span className="text-4xl mb-4 block filter drop-shadow-xs">{ing.emoji}</span>
                <h3 className="font-serif font-bold text-lg text-skin-bold mb-2">
                  {ing.name}
                </h3>
                <p className="font-sans text-skin-bold/70 text-xs leading-relaxed">
                  {ing.benefit}
                </p>
              </div>
              
              <div className="mt-4 pt-3 border-t border-skin-primary/10 flex items-center justify-between text-[10px] text-skin-bold/50 uppercase font-bold tracking-wider">
                <span>Botanical Raw</span>
                <span>✓ Active</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 7: TODAY */}
      <section className="relative py-28 px-6 bg-white/60 border-y border-skin-primary/30">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left: Text detail */}
          <div className="flex-1 space-y-6">
            <span className="font-sans font-bold tracking-widest text-xs uppercase text-skin-bold/60">Vedhathiris Today</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-skin-bold leading-tight">
              From Our Family To Yours
            </h2>
            <p className="font-sans text-skin-bold/80 text-lg leading-relaxed">
              Handcrafted with nature&apos;s finest ingredients and inspired by generations of traditional wisdom. What started in our home kitchen is now shipped to families all across the state, ensuring that everyone has access to pure, skin-safe personal care.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/products">
                <button className="bg-skin-bold hover:bg-skin-bold/90 text-skin-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer">
                  Shop Our Collection
                </button>
              </Link>
              <Link href="/contact">
                <button className="border border-skin-bold text-skin-bold hover:bg-skin-bold/5 px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all cursor-pointer">
                  Get in Touch
                </button>
              </Link>
            </div>
          </div>

          {/* Right: Premium floating catalog cards */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: "Handmade Soaps", desc: "Herb-cured, creamy cleansing bars", icon: "🧼", price: "From ₹149" },
              { name: "Organic Oils", desc: "Cold-pressed nourishing elixirs", icon: "🫒", price: "From ₹299" },
              { name: "Natural Shampoos", desc: "Mild, sulfate-free scalp wash", icon: "🌿", price: "From ₹249" }
            ].map((p, idx) => (
              <motion.div
                key={idx}
                animate={{ y: [0, -10 - idx * 4, 0] }}
                transition={{ duration: 5 + idx, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white/80 border border-skin-primary/30 p-6 rounded-2xl text-center shadow-md flex flex-col justify-between min-h-[200px]"
              >
                <div>
                  <span className="text-3xl mb-3 block">{p.icon}</span>
                  <h3 className="font-serif font-bold text-skin-bold text-base mb-1">{p.name}</h3>
                  <p className="font-sans text-skin-bold/60 text-[11px] leading-snug">{p.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-skin-primary/10">
                  <span className="text-xs font-bold text-skin-bold font-sans">{p.price}</span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 8: MISSION & VALUES */}
      <section className="relative py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-sans font-bold tracking-widest text-xs uppercase text-skin-bold/60">Our Core Pillars</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-skin-bold mt-2">
            Mission & Values
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Purity", desc: "Only carefully selected natural ingredients. We never compromise on raw botanical sourcing.", icon: Leaf },
            { title: "Family", desc: "Created from genuine care for loved ones. Every recipe starts with our own children in mind.", icon: Heart },
            { title: "Trust", desc: "Products we proudly use ourselves. Transparent formulas, clean processes, honest labeling.", icon: Shield }
          ].map((val, idx) => {
            const Icon = val.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="bg-white/50 border border-skin-primary/30 p-8 rounded-3xl shadow-xs hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-skin-bold text-white flex items-center justify-center mb-6">
                  <Icon size={24} />
                </div>
                <h3 className="font-serif font-bold text-2xl text-skin-bold mb-3">
                  {val.title}
                </h3>
                <p className="font-sans text-skin-bold/80 text-sm md:text-base leading-relaxed">
                  {val.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* SECTION 9: FOUNDER MESSAGE */}
      <section className="relative py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-tr from-skin-primary/20 via-white/80 to-purple-100/30 border border-skin-primary/30 shadow-xl rounded-3xl p-8 md:p-14 relative overflow-hidden backdrop-blur-md"
          >
            {/* Background design elements */}
            <div className="absolute bottom-0 right-0 p-8 opacity-5 pointer-events-none">
              <Leaf size={160} className="text-skin-bold" />
            </div>

            <div className="relative z-10 text-center max-w-2xl mx-auto space-y-6">
              <span className="text-4xl">🌸</span>
              <h3 className="font-sans font-bold tracking-widest text-xs uppercase text-skin-bold/60">A Message From Our Founder</h3>
              
              <p className="font-serif italic text-2xl md:text-3xl text-skin-bold leading-relaxed">
                &quot;Vedhathiris Skin Care was never started as a business. It began as a promise to my family. Today, that promise continues in every product we create.&quot;
              </p>

              {/* Signature styled line */}
              <div className="pt-6 border-t border-skin-primary/30">
                <span className="font-serif italic text-3xl text-skin-bold/90 block">
                  Vedhathiri
                </span>
                <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-skin-bold/40 mt-1 block">
                  Founder, Mother, & Artisan Maker
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 10: FINAL CTA SECTION */}
      <section className="relative py-28 px-6 bg-skin-bold text-skin-white text-center overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 border border-white/5 pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5 border border-white/5 pointer-events-none" />

        <div className="max-w-2xl mx-auto relative z-10 space-y-8">
          <span className="text-3xl">🌿</span>
          <h2 className="font-serif text-4xl md:text-6xl font-bold leading-tight">
            Join Our Natural <br />Skincare Journey
          </h2>
          <p className="font-sans text-skin-white/80 text-lg max-w-lg mx-auto">
            Experience the difference of truly clean, botanical personal care formulated out of love for a family.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/products" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-white hover:bg-white/95 text-skin-bold font-bold px-10 py-4 rounded-full text-base uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer">
                Shop Collection
              </button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto border-2 border-white/80 hover:bg-white/10 text-white font-bold px-10 py-3.5 rounded-full text-base uppercase tracking-wider transition-all cursor-pointer">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
