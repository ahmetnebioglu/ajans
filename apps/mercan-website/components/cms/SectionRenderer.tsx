import React from 'react';

interface SectionContent {
  title?: string;
  description?: string;
  image?: string;
  items?: Array<{ title: string; description: string; image?: string }>;
}

interface Section {
  id: string;
  type: string;
  content: SectionContent;
}

interface Props {
  sections: Section[];
}

export function SectionRenderer({ sections }: Props) {
  if (!sections || sections.length === 0) {
    return <div className="py-20 text-center text-slate-500 italic">Bu sayfaya henüz içerik eklenmemiş.</div>;
  }

  return (
    <div className="w-full">
      {sections.map((section) => {
        switch (section.type) {
          case 'CONTENT':
            return (
              <section key={section.id} className="py-16 max-w-4xl mx-auto px-6 prose prose-slate">
                <div dangerouslySetInnerHTML={{ __html: section.content?.description || '' }} />
              </section>
            );
          case 'SLIDER':
            return (
              <section key={section.id} className="py-20 bg-corporate-blue text-white text-center">
                <h2 className="text-4xl font-bold uppercase italic">{section.content?.title || 'SLIDER BÖLÜMÜ'}</h2>
                {section.content?.description && <p className="mt-4 max-w-2xl mx-auto">{section.content.description.replace(/<[^>]+>/g, '')}</p>}
              </section>
            );
          case 'FEATURES':
            return (
              <section key={section.id} className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                  <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{section.content?.title || 'Özelliklerimiz'}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(section.content?.items || []).map((item, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-semibold mb-3 text-corporate-blue">{item.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          default:
            return (
              <section key={section.id} className="py-16 bg-slate-50 border-y my-4 text-center">
                <p className="text-sm text-slate-400">Bilinmeyen bölüm tipi: {section.type}</p>
              </section>
            );
        }
      })}
    </div>
  );
}
