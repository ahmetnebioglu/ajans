import { uploadFile } from "@ajans/core";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

// .env dosyasını yükle (Kök dizindeki .env dosyasını arar)
dotenv.config({ path: path.join(__dirname, "../../../.env") });

async function uploadResults() {
  const reportPath = path.join(__dirname, "../playwright-report/results.json");

  console.log("--- Playwright Rapor Köprüsü Başlatıldı ---");

  if (!fs.existsSync(reportPath)) {
    console.error(`Hata: Rapor dosyası bulunamadı: ${reportPath}`);
    console.log("Lütfen testlerin başarıyla tamamlandığından emin olun.");
    return;
  }

  try {
    const fileContent = fs.readFileSync(reportPath);
    
    // Tarih ve saat formatla: report_YYYY-MM-DD_HH-mm.json
    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0].slice(0, 16);
    const fileName = `report_${timestamp}.json`;

    console.log(`[R2/S3] Yükleniyor: ${fileName}...`);

    const result = await uploadFile(
      fileContent,
      fileName,
      "application/json",
      "system",
      "e2e-reports"
    );

    if (result && result.key) {
      console.log(`[R2/S3] Başarıyla yüklendi! Dosya Key: ${result.key}`);
      console.log(`[R2/S3] URL: ${result.url}`);
    } else {
      console.error("[R2/S3] Yükleme tamamlandı ancak dosya Key alınamadı.");
    }
  } catch (error) {
    console.error("[R2/S3] Yükleme sırasında bir hata oluştu:");
    console.error(error instanceof Error ? error.message : error);
  }
}

uploadResults();
