"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Kurumsal", href: "/kurumsal" },
  { name: "Hizmetlerimiz", href: "/hizmetlerimiz" },
  { name: "Referanslar", href: "/referanslar" },
  { name: "İSG Kütüphanesi", href: "/isg-evrak-destegi" },
  { name: "Haberler", href: "/haberler" },
  { name: "Kariyer", href: "/kariyer" },
  { name: "İletişim", href: "/iletisim" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/90 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm" 
          : "bg-white py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-slate-900 rounded-[2px] flex items-center justify-center text-white font-black italic text-xl shadow-xl group-hover:bg-blue-600 transition-colors group-hover:rotate-3 duration-500">M</div>
          <div className="flex flex-col">
            <span className="font-black uppercase tracking-tighter text-2xl leading-none text-slate-900 italic">Mercan <span className="text-blue-600">OSGB</span></span>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Kurumsal Güvenlik</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors italic relative group/nav"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover/nav:w-full" />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-6">
          <Link href="http://localhost:3001" target="_blank" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 flex items-center gap-2 transition-colors">
             PORTAL <ExternalLink size={14} />
          </Link>
          <Link href="/iletisim#teklif" className="px-6 py-2.5 bg-slate-900 text-white rounded-[2px] text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95">
             TEKLİF ALIN
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-slate-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b shadow-xl animate-in slide-in-from-top-4 duration-300">
           <div className="p-8 space-y-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="block text-lg font-bold text-slate-900"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 border-t flex flex-col gap-4">
                 <Button variant="outline" className="w-full" asChild>
                    <Link href="#">Müşteri Girişi</Link>
                 </Button>
                 <Button className="w-full bg-corporate-blue text-white" asChild>
                    <Link href="#">Teklif İsteyin</Link>
                 </Button>
              </div>
           </div>
        </div>
      )}
    </header>
  );
}
