"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Droplet, Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden px-4 py-20 bg-stone-50">
      <style>{`
        header, footer, #offer-bar {
          display: none !important;
        }
        main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
      `}</style>
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <motion.div 
          animate={{ y: [0, -30, 0], x: [0, 15, 0], rotate: [0, 15, 0] }} 
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute top-20 left-[10%] text-green-500/10 md:text-green-500/20"
        >
          <Leaf size={100} />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 40, 0], x: [0, -20, 0], rotate: [0, -15, 0] }} 
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute bottom-20 right-[15%] text-blue-500/10 md:text-blue-500/20"
        >
          <Droplet size={120} />
        </motion.div>
        
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute top-1/3 right-[20%] text-amber-500/10 md:text-amber-500/20"
        >
          <Sparkles size={80} />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, -50, 0], x: [0, 25, 0], rotate: [0, -25, 0] }} 
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute bottom-1/4 left-[20%] text-green-600/10"
        >
          <Leaf size={70} />
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 max-w-2xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.2 }}
          className="relative inline-block"
        >
          <h1 className="text-9xl md:text-[180px] font-black text-violet-600 mb-4 drop-shadow-sm leading-none tracking-tighter">
            404
          </h1>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -right-8 md:-right-12 text-amber-400"
          >
            <Sparkles size={64} className="drop-shadow-md" />
          </motion.div>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-3xl md:text-5xl font-bold text-gray-800 mb-6 tracking-tight"
        >
          Oops! Looks like you wandered off.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-gray-600 mb-12 text-lg md:text-xl leading-relaxed max-w-lg mx-auto"
        >
          The magical skincare product or page you're looking for doesn't seem to exist. Let's get you back to something wonderful.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            href="/products" 
            className="inline-flex items-center gap-3 bg-violet-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_8px_30px_rgb(124,58,237,0.3)] hover:bg-violet-700 hover:shadow-[0_8px_30px_rgb(124,58,237,0.5)] transition-all duration-300"
          >
            <ArrowLeft size={24} />
            Back to Products
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
