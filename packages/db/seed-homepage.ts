import { config } from "dotenv";
import path from "path";
config({ path: "C:/GitHub/ajans/packages/db/.env" });

import { prisma } from "./index";

async function main() {
  console.log("Initializing homepage settings...");
  
  const settings = await prisma.homepageSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      heroTitle: "İşletmenizin Güvenliği İçin Uzman Dokunuş.",
      heroSubtitle: "20 yıllık sektörel tecrübemiz ve uzman kadromuzla, iş kazalarını minimize ediyor, çalışan sağlığını koruyan profesyonel sistemler kuruyoruz.",
      heroButtonText: "Hizmetlerimizi Keşfedin",
      katipProcess: [
        { title: "Sözleşme Girişi", desc: "İSG-KATİP sistemi üzerinden kurumumuz tarafından sözleşme girişi yapılır." },
        { title: "İşveren Onayı", desc: "İşveren veya vekili e-Devlet üzerinden İSG-KATİP'e girerek sözleşmeyi onaylar." },
        { title: "Hizmet Başlangıcı", desc: "Onay işlemi tamamlandığı an yasal hizmet süreci ve atamalar aktifleşir." }
      ],
      naceBannerTitle: "Tehlike Sınıfınızı Doğru Biliyor Musunuz?",
      naceBannerSubtitle: "İşletmenizin NACE kodu, yasal İSG sürelerinizden uzman atamanıza kadar her şeyi belirler. Yanlış bildirimler ciddi cezai yaptırımlara yol açabilir."
    },
  });

  console.log("Homepage settings initialized:", settings.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
