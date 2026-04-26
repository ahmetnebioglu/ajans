"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Globe, Share2, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { NewsletterForm } from "../newsletter/NewsletterForm";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-1 space-y-6">
             <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-corporate-blue rounded-[2px] flex items-center justify-center text-white font-bold italic text-lg">M</div>
                <div className="flex flex-col">
                  <span className="font-bold uppercase tracking-tight text-lg leading-none text-slate-900">Mercan <span className="text-corporate-blue">İSG</span></span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">Kurumsal Güvenlik</span>
                </div>
             </div>
             <p className="text-slate-500 text-sm leading-relaxed font-medium italic">
               Türkiye'nin öncü İSG kuruluşu olarak, iş yerlerinizi daha güvenli, çalışanlarınızı daha huzurlu kılıyoruz.
             </p>
             <div className="space-y-4 pt-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-corporate-blue">Bültene Katılın</h4>
                <NewsletterForm />
             </div>
          </div>

          {/* Links */}
          <div className="space-y-8">
             <h4 className="text-sm font-bold uppercase tracking-tight text-slate-900 italic border-l-2 border-corporate-blue pl-4">Hızlı Erişim</h4>
             <ul className="space-y-4">
               {[
                 { name: 'Anasayfa', href: '/' },
                 { name: 'Kurumsal', href: '/kurumsal' },
                 { name: 'Hizmetlerimiz', href: '/hizmetlerimiz' },
                 { name: 'İSG Kütüphanesi', href: '/isg-evrak-destegi' },
                 { name: 'Haberler', href: '/haberler' },
                 { name: 'Kariyer', href: '/kariyer' },
                 { name: 'İletişim', href: '/iletisim' }
               ].map(item => (
                 <li key={item.name}>
                   <Link href={item.href} className="text-slate-500 text-[11px] font-bold uppercase tracking-widest hover:text-corporate-blue transition-colors">{item.name}</Link>
                 </li>
               ))}
             </ul>
          </div>

          {/* Contact */}
          <div className="space-y-8">
             <h4 className="text-sm font-bold uppercase tracking-tight text-slate-900 italic border-l-2 border-corporate-blue pl-4">İletişim Bilgileri</h4>
             <ul className="space-y-6">
                <li className="flex gap-4">
                   <MapPin className="text-corporate-blue shrink-0" size={20} />
                   <span className="text-slate-500 text-sm font-medium leading-relaxed">
                     Cevizli Mah. Bağdat Cad. <br/>
                     Ofistanbul No: 538/7 Maltepe / İSTANBUL
                   </span>
                </li>
                <li className="flex gap-4">
                   <Phone className="text-corporate-blue shrink-0" size={20} />
                   <div className="flex flex-col gap-1">
                      <a href="tel:+902163521050" className="text-slate-500 text-sm font-medium hover:text-corporate-blue transition-colors">0 (216) 352 10 50</a>
                      <a href="tel:+905325784945" className="text-slate-500 text-sm font-medium hover:text-corporate-blue transition-colors">0 (532) 578 49 45</a>
                   </div>
                </li>
                <li className="flex gap-4">
                   <Mail className="text-corporate-blue shrink-0" size={20} />
                   <a href="mailto:info@mercanosgb.com" className="text-slate-500 text-sm font-medium hover:text-corporate-blue transition-colors">info@mercanosgb.com</a>
                </li>
             </ul>
          </div>

          {/* Social */}
          <div className="space-y-8">
             <h4 className="text-sm font-bold uppercase tracking-tight text-slate-900 italic border-l-2 border-corporate-blue pl-4">Sosyal Medya</h4>
             <div className="flex flex-wrap gap-3">
                {[
                  { icon: LinkIcon, href: "#" },
                  { icon: Share2, href: "#" },
                  { icon: Globe, href: "#" }
                ].map((social, i) => (
                  <Link 
                    key={i} 
                    href={social.href} 
                    className="p-2.5 bg-slate-50 text-slate-400 rounded-[2px] hover:bg-corporate-blue hover:text-white hover:shadow-lg transition-all"
                  >
                    <social.icon size={16} />
                  </Link>
                ))}
             </div>
             <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                   <CheckCircle2 className="text-corporate-green" size={14} /> 
                   ISO 9001:2015 SERTİFİKALI
                </div>
             </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">© 2026 Mercan OSGB. Kurumsal Çözüm Ortağınız.</p>
           <div className="flex gap-8">
              <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Gizlilik Politikası</Link>
              <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">KVKK Aydınlatma</Link>
           </div>
        </div>
      </div>
    </footer>
  );
}
