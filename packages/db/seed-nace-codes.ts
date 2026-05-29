import type { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";

const NACE_SOURCE_URL =
  "https://mercanosgb.com/tehlike-siniflari-listesi/";

export async function seedNaceCodes(prisma: PrismaClient) {
  console.log(`>>> NACE kodları çekiliyor: ${NACE_SOURCE_URL}`);

  const res = await fetch(NACE_SOURCE_URL);
  if (!res.ok) {
    throw new Error(`NACE kaynağına erişilemedi: HTTP ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const naceCodes: { code: string; description: string; dangerClass: string }[] =
    [];

  $("table tr").each((_i, el) => {
    const tds = $(el).find("td");
    if (tds.length < 3) return;

    const code = $(tds[0]).text().trim().replace(/\s+/g, " ");
    const description = $(tds[1]).text().trim().replace(/\s+/g, " ");
    const dangerClass = $(tds[2]).text().trim().replace(/\s+/g, " ");

    if (code && /\d/.test(code) && description.length > 3) {
      naceCodes.push({ code, description, dangerClass });
    }
  });

  if (naceCodes.length === 0) {
    throw new Error(
      "NACE kodları bulunamadı. Kaynak sayfa yapısı değişmiş olabilir.",
    );
  }

  console.log(`>>> ${naceCodes.length} NACE kodu bulundu, yazılıyor...`);

  for (const item of naceCodes) {
    await prisma.naceCode.upsert({
      where: { code: item.code },
      update: {
        description: item.description,
        dangerClass: item.dangerClass,
      },
      create: item,
    });
  }

  console.log(`>>> ${naceCodes.length} NACE kodu eklendi/güncellendi.`);
}
