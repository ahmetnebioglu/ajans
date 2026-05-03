import React from 'react';
import { getShowcaseProducts } from '@/src/services/ideasoft';
import { Card, Button, Typography, Tag, Divider, Empty } from 'antd';
import { InfoCircleOutlined, StarFilled, ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

/**
 * Dinamik Ürün Vitrini (Showcase)
 * E-posta üzerinden gelen müşteriler için özelleştirilmiş görünüm.
 */
export default async function ShowcasePage({ params }: { params: Promise<{ leadId: string }> }) {
  // Next.js 15+ ve 16'da params asenkron olarak bekletilmelidir
  const { leadId } = await params;
  const products = await getShowcaseProducts();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20">
      {/* Şık Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Tag color="blue" className="mb-6 px-4 py-1 rounded-full uppercase tracking-[0.2em] text-[10px] font-black border-0 bg-blue-600 text-white">
            Özel Teklif
          </Tag>
          <Title level={1} className="!text-slate-900 dark:!text-white !mb-4 !text-4xl md:!text-6xl font-black tracking-tight">
            Teknikel <span className="text-blue-600">Vitrin</span>
          </Title>
          <Paragraph className="text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            Size özel hazırladığımız kombi yedek parça kataloğumuzda en çok tercih edilen ve stoklarımıza yeni giren ürünleri inceleyin.
          </Paragraph>
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex flex-col items-center">
              <Text className="text-2xl font-bold text-slate-800 dark:text-white">1500+</Text>
              <Text className="text-[10px] uppercase text-slate-400 font-bold">Ürün Çeşidi</Text>
            </div>
            <Divider type="vertical" className="h-8 border-slate-200 dark:border-zinc-700" />
            <div className="flex flex-col items-center">
              <Text className="text-2xl font-bold text-slate-800 dark:text-white">Aynı Gün</Text>
              <Text className="text-[10px] uppercase text-slate-400 font-bold">Kargo</Text>
            </div>
            <Divider type="vertical" className="h-8 border-slate-200 dark:border-zinc-700" />
            <div className="flex flex-col items-center">
              <Text className="text-2xl font-bold text-slate-800 dark:text-white">%100</Text>
              <Text className="text-[10px] uppercase text-slate-400 font-bold">Orijinal</Text>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <StarFilled className="text-amber-400" /> Sizin İçin Seçtiklerimiz
            </h2>
            <p className="text-slate-400 text-sm mt-1">İhtiyacınız olan parçalara hızlıca göz atın.</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <Text className="text-slate-400 text-[11px] font-bold">MÜŞTERİ REFERANS:</Text>
            <Text className="text-blue-600 text-[11px] font-black ml-2">{leadId}</Text>
          </div>
        </div>

        {/* Ürün Gridi */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product) => (
              <Card
                key={product.id}
                hoverable
                className="group overflow-hidden border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-500 dark:bg-zinc-900 rounded-3xl"
                styles={{ body: { padding: '24px' } }}
                cover={
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                      alt={product.name}
                      src={product.image}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <Tag color="rgba(255,255,255,0.9)" className="backdrop-blur-md border-0 text-slate-900 font-black px-4 py-1 rounded-lg text-[10px] uppercase shadow-sm">
                        {product.category}
                      </Tag>
                    </div>
                  </div>
                }
              >
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <Paragraph className="text-slate-500 dark:text-zinc-400 text-sm line-clamp-2 min-h-[40px] leading-relaxed">
                      {product.description}
                    </Paragraph>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50 dark:border-zinc-800">
                    <div className="flex flex-col">
                      <Text className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Peşin Fiyat</Text>
                      <Text className="text-2xl font-black text-slate-900 dark:text-white">{product.price}</Text>
                    </div>
                    
                    {/* Takip API Yönlendirmesi */}
                    <Button
                      type="primary"
                      size="large"
                      icon={<ArrowRightOutlined />}
                      className="bg-blue-600 hover:bg-blue-700 border-0 h-14 px-8 rounded-2xl font-black shadow-xl shadow-blue-500/20 flex items-center gap-2 group-hover:gap-4 transition-all"
                      href={`/api/track?leadId=${leadId}&targetUrl=${encodeURIComponent(product.targetUrl)}&type=CLICK`}
                    >
                      Hemen Al
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 flex justify-center">
            <Empty description="Şu anda vitrin için ürün bulunamadı." />
          </div>
        )}
      </main>
      
      {/* Bilgi Kartı */}
      <footer className="max-w-4xl mx-auto px-6 mt-24">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 rounded-[2.5rem] text-center shadow-2xl shadow-blue-500/30 relative overflow-hidden">
          {/* Süsleme Elementleri */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16 blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-400/20 rounded-full translate-x-20 translate-y-20 blur-3xl"></div>
          
          <div className="relative z-10">
            <InfoCircleOutlined className="text-white/80 text-4xl mb-6" />
            <h4 className="text-white text-2xl font-black mb-4 tracking-tight">Hala Kararsız mısınız?</h4>
            <p className="text-white/80 text-lg mb-10 max-w-md mx-auto font-medium">
              Uyumlu parçayı bulmakta zorlanıyorsanız teknik ekibimiz size yardımcı olmaya hazır.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="large" className="h-14 px-10 rounded-2xl font-bold border-0 bg-white text-blue-600 hover:!bg-slate-50">
                WhatsApp Destek
              </Button>
              <Button size="large" ghost className="h-14 px-10 rounded-2xl font-bold border-white text-white hover:!bg-white/10">
                0850 304 XX XX
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2026 Teknikel Isı Sistemleri. Tüm Hakları Saklıdır.</Text>
        </div>
      </footer>
    </div>
  );
}
