"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroSliderProps {
  images: string[];
}

export default function HeroSlider({ images }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 italic font-black uppercase tracking-widest">
        Görsel Bulunamadı
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[4rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0, scale: 1.15 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={images[current].includes('id=') 
              ? `https://drive.google.com/thumbnail?id=${images[current].split('id=')[1]}&sz=w1600` 
              : images[current]}
            alt={`Hero Slide ${current + 1}`}
            className="w-full h-full object-cover"
          />
          {/* Görsel üzerine hafif bir gradyan ekleyelim ki başlıklar daha iyi okunsun */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Slider Noktaları (Dots) */}
      {images.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                current === i ? "w-10 bg-blue-600" : "w-4 bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
