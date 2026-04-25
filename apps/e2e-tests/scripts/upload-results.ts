import { uploadToDrive } from "@ajans/google-api";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

// .env dosyasını yükle (Kök dizindeki .env dosyasını arar)
dotenv.config({ path: path.join(__dirname, "../../../.env") });

async function uploadResults() {
  const reportPath = path.join(__dirname, "../playwright-report/results.json");
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  console.log("--- Playwright Rapor Köprüsü Başlatıldı ---");

  if (!fs.existsSync(reportPath)) {
    console.error(`Hata: Rapor dosyası bulunamadı: ${reportPath}`);
    console.log("Lütfen testlerin başarıyla tamamlandığından emin olun.");
    return;
  }

  if (!folderId) {
    console.error("Hata: GOOGLE_DRIVE_FOLDER_ID .env dosyasında tanımlı değil.");
    return;
  }

  try {
    const fileContent = fs.readFileSync(reportPath);
    
    // Tarih ve saat formatla: report_YYYY-MM-DD_HH-mm.json
    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0].slice(0, 16);
    const fileName = `report_${timestamp}.json`;

    console.log(`[Drive] Yükleniyor: ${fileName}...`);

    const result = await uploadToDrive(
      fileContent,
      fileName,
      "application/json",
      folderId
    );

    if (result && result.id) {
      console.log(`[Drive] Başarıyla yüklendi! Dosya ID: ${result.id}`);
    } else {
      console.error("[Drive] Yükleme tamamlandı ancak dosya ID alınamadı.");
    }
  } catch (error) {
    console.error("[Drive] Yükleme sırasında bir hata oluştu:");
    console.error(error instanceof Error ? error.message : error);
    // Hata test sürecini durdurmasın (Kullanıcı isteği)
  }
}

uploadResults();
