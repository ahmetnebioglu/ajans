/**
 * Ideasoft API Entegrasyon Servisi (Mock)
 */

export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  targetUrl: string;
  category?: string;
  description?: string;
}

export async function getShowcaseProducts(): Promise<Product[]> {
  // TODO: Ideasoft API entegrasyonu tamamlandığında gerçek veriler çekilecek.
  // Şimdilik mock veri dönüyoruz.
  
  return [
    {
      id: 1,
      name: "Vaillant Kombi Pompası (Wilo)",
      price: "2.850 TL",
      image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?auto=format&fit=crop&q=80&w=400",
      targetUrl: "https://teknikelkombi.com/urun/vaillant-kombi-pompasi",
      category: "Pompa Grubu",
      description: "Vaillant ve uyumlu kombiler için yüksek verimli sirkülasyon pompası."
    },
    {
      id: 2,
      name: "Demirdöküm Nitromix Eşanjör",
      price: "4.150 TL",
      image: "https://images.unsplash.com/photo-1585338447937-7082f89763d5?auto=format&fit=crop&q=80&w=400",
      targetUrl: "https://teknikelkombi.com/urun/demirdokum-nitromix-esanjor",
      category: "Isıtma Grubu",
      description: "Orijinal Demirdöküm yedek parçası, uzun ömürlü ve garantili."
    },
    {
      id: 3,
      name: "ECA Confeo Premix Fan Motoru",
      price: "1.950 TL",
      image: "https://images.unsplash.com/photo-1590341328520-63256eb32bc3?auto=format&fit=crop&q=80&w=400",
      targetUrl: "https://teknikelkombi.com/urun/eca-confeo-fan-motoru",
      category: "Fan Grubu",
      description: "Sessiz çalışma ve yüksek performanslı havalandırma ünitesi."
    },
    {
      id: 4,
      name: "Baymak Luna 3 Elektronik Kart",
      price: "3.400 TL",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
      targetUrl: "https://teknikelkombi.com/urun/baymak-luna-elektronik-kart",
      category: "Kontrol Grubu",
      description: "Baymak Luna serisi için revizyonlu ve test edilmiş anakart."
    },
    {
      id: 5,
      name: "Viessmann Vitopend 100 Gaz Valfi",
      price: "2.100 TL",
      image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80&w=400",
      targetUrl: "https://teknikelkombi.com/urun/viessmann-vitopend-gaz-valfi",
      category: "Gaz Grubu",
      description: "Honeywell marka orijinal gaz ayar mekanizması."
    },
    {
      id: 6,
      name: "Buderus GB062 Genleşme Tankı",
      price: "1.750 TL",
      image: "https://images.unsplash.com/photo-1584036561566-baf2418309c0?auto=format&fit=crop&q=80&w=400",
      targetUrl: "https://teknikelkombi.com/urun/buderus-gb062-genlesme-tanki",
      category: "Tank Grubu",
      description: "8 Litre kapasiteli, 3/8 bağlantı çaplı standart tank."
    }
  ];
}
