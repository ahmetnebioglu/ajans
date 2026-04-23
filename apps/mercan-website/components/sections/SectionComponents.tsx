import React from "react";

export function HeroSlider({ content }: { content: any }) {
  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
      {content.image && (
        <img 
          src={`/api/assets/${content.image}`} 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          alt={content.title}
        />
      )}
      <div className="relative z-10 text-center max-w-4xl px-6 space-y-6">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase leading-none">
          {content.title}
        </h1>
        {content.subtitle && (
          <p className="text-xl md:text-2xl font-medium text-slate-300 max-w-2xl mx-auto italic">
            {content.subtitle}
          </p>
        )}
        {content.ctaText && (
          <button className="px-10 py-5 bg-white text-slate-900 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform">
            {content.ctaText}
          </button>
        )}
      </div>
    </section>
  );
}

export function FeatureGrid({ content }: { content: any }) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
           <h2 className="text-4xl font-black tracking-tighter uppercase italic">{content.title}</h2>
           {content.description && (
             <div 
               className="text-slate-500 max-w-2xl mx-auto prose prose-slate"
               dangerouslySetInnerHTML={{ __html: content.description }}
             />
           )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           {(content.items || []).map((item: any, i: number) => (
             <div key={i} className="p-10 bg-slate-50 rounded-[3rem] space-y-4 hover:shadow-2xl transition-all group">
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl group-hover:rotate-6 transition-transform flex items-center justify-center text-white font-black text-2xl">
                   {i + 1}
                </div>
                <h3 className="text-xl font-black uppercase italic">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed italic font-medium">{item.description}</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}

export function RichText({ content }: { content: any }) {
  return (
    <section className="py-24 max-w-4xl mx-auto px-6 prose prose-slate lg:prose-xl dark:prose-invert">
      {content.title && <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">{content.title}</h2>}
      <div 
        className="font-medium italic text-slate-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content.body || content.description }} 
      />
    </section>
  );
}
