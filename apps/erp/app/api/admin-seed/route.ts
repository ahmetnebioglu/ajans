import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    console.log("🚀 İSG Simülasyonu başlatılıyor...");

    // 1. Kullanıcılar ve Roller
    const userData = [
      { email: "admin@mercan.com", name: "Mercan Sistem Yöneticisi", role: "ADMIN" },
      { email: "uzman1@mercan.com", name: "Mehmet İş Güvenliği Uzmanı", role: "EXPERT" },
      { email: "uzman2@mercan.com", name: "Ayşe Teknik Denetçi", role: "EXPERT" },
      { email: "musteri_tekstil@mercan.com", name: "Mercan Tekstil Yöneticisi", role: "CLIENT" },
      { email: "musteri_insaat@mercan.com", name: "Zirve İnşaat Proje Müdürü", role: "CLIENT" },
      { email: "ahmetnebioglu89@gmail.com", name: "Ahmet Admin", role: "ADMIN" },
    ] as const;

    const users: Record<string, any> = {};
    for (const u of userData) {
      users[u.email] = await prisma.user.upsert({
        where: { email: u.email },
        update: { name: u.name, role: u.role },
        create: { email: u.email, name: u.name, role: u.role }
      });
    }
    console.log("✅ Kullanıcılar sisteme işlendi.");

    // 2. Workspace'ler (eski adıyla Firmalar)
    const companyData = [
      { id: "seed-ws-mercan-tekstil", name: "Mercan Tekstil Fabrikası" },
      { id: "seed-ws-zirve-insaat", name: "Zirve İnşaat Projesi" },
      { id: "seed-ws-anadolu-lojistik", name: "Anadolu Lojistik Merkezi" },
    ];

    const workspaceMap: Record<string, any> = {};
    for (const c of companyData) {
      workspaceMap[c.name] = await prisma.workspace.upsert({
        where: { id: c.id },
        update: { name: c.name },
        create: { 
          id: c.id,
          name: c.name, 
          createdById: users["admin@mercan.com"].id
        }
      });
    }
    console.log("✅ Workspace'ler oluşturuldu.");

    // 3. Yetkilendirme ve İlişkiler (RBAC & Multi-tenancy)
    const assignments = [
       { user: "uzman1@mercan.com", comps: ["Mercan Tekstil Fabrikası", "Anadolu Lojistik Merkezi"] },
       { user: "uzman2@mercan.com", comps: ["Zirve İnşaat Projesi"] },
       { user: "musteri_tekstil@mercan.com", comps: ["Mercan Tekstil Fabrikası"] },
       { user: "musteri_insaat@mercan.com", comps: ["Zirve İnşaat Projesi"] },
       { user: "ahmetnebioglu89@gmail.com", comps: Object.keys(workspaceMap) },
    ];

    for (const a of assignments) {
      for (const cName of a.comps) {
        await prisma.workspaceUser.upsert({
          where: { 
            userId_workspaceId: { 
              userId: users[a.user].id, 
              workspaceId: workspaceMap[cName].id 
            } 
          },
          update: {},
          create: { 
            userId: users[a.user].id, 
            workspaceId: workspaceMap[cName].id 
          }
        });
      }
    }
    console.log("✅ Yetki atamaları tamamlandı.");

    // 4. Örnek Raporlar (Her workspace için 3 rapor)
    const reportTemplates = [
      { 
        ws: "Mercan Tekstil Fabrikası", 
        reports: [
          { title: "Boyahane Havalandırma Denetimi", status: "COZULDU", note: "Filtreler değiştirildi." },
          { title: "Yangın Tüpü Periyodik Kontrolü", status: "AKSIYON_GEREKLI", note: "3 adet tüpün son kullanım tarihi geçmiş." },
          { title: "Personel KKD Kullanım Raporu", status: "BEKLEMEDE", note: "Gözlük kullanımı %80 civarında." }
        ]
      },
      { 
        ws: "Zirve İnşaat Projesi", 
        reports: [
          { title: "İskele Güvenliği Haftalık Rapor", status: "AKSIYON_GEREKLI", note: "C blok iskele bağlantıları gevşek." },
          { title: "Vinç Operatörü Belge Kontrolü", status: "COZULDU", note: "Tüm belgeler güncel." },
          { title: "Toz Ölçüm Raporu (Nisan)", status: "BEKLEMEDE", note: "Limit değerlerin altında." }
        ]
      },
      { 
        ws: "Anadolu Lojistik Merkezi", 
        reports: [
          { title: "Forklift Bakım Takip Formu", status: "COZULDU", note: "Yıllık bakım tamamlandı." },
          { title: "Depo Zemin İşaretleme Denetimi", status: "AKSIYON_GEREKLI", note: "Palet alanları silinmiş." },
          { title: "Acil Çıkış Kapısı Kontrolü", status: "COZULDU", note: "Mekanizmalar yağlandı." }
        ]
      }
    ];

    for (const t of reportTemplates) {
      const ws = workspaceMap[t.ws];
      for (const r of t.reports) {
        await prisma.report.create({
          data: {
            title: r.title,
            fileName: `${r.title.toLowerCase().replace(/ /g, "_")}.pdf`,
            fileUrl: "https://drive.google.com/sample_file",
            s3Key: `mock_id_${Math.random().toString(36).slice(-8)}`,
            status: r.status as any,
            note: r.note,
            uploadedById: users["uzman1@mercan.com"].id,
            workspaceId: ws.id,
            tenantId: ws.tenantId,
          }
        });
      }
    }
    console.log("✅ Örnek raporlar yüklendi.");

    // 5. Sistem Günlüğü (Audit Logs)
    console.log("📜 Sistem günlüğü mühürleniyor...");
    const auditLogs = [
      { action: "CREATED_FOLDER", details: "Acil Durum Planları klasörü oluşturuldu.", user: "uzman1@mercan.com", ws: "Mercan Tekstil Fabrikası" },
      { action: "UPLOADED", details: '"Boyahane Havalandırma Denetimi" raporu yüklendi.', user: "uzman1@mercan.com", ws: "Mercan Tekstil Fabrikası" },
      { action: "STATUS_CHANGED", details: '"Vinç Operatörü Belge Kontrolü" durumu COZULDU yapıldı.', user: "uzman2@mercan.com", ws: "Zirve İnşaat Projesi" },
      { action: "MOVED", details: '"Forklift Bakım Takip Formu" Teknik Bakım klasörüne taşındı.', user: "uzman1@mercan.com", ws: "Anadolu Lojistik Merkezi" },
      { action: "CREATED_FOLDER", details: "Şantiye Güvenliği klasörü oluşturuldu.", user: "uzman2@mercan.com", ws: "Zirve İnşaat Projesi" },
    ];

    for (const log of auditLogs) {
      const ws = workspaceMap[log.ws];
      await prisma.auditLog.create({
        data: {
          action: log.action,
          details: log.details,
          userId: users[log.user].id,
          workspaceId: ws.id,
          tenantId: ws.tenantId,
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "İSG Operasyon Simülasyonu ve Sistem Günlüğü Başarıyla Kuruldu!",
      stats: {
        users: userData.length,
        workspaces: companyData.length,
        reports: reportTemplates.length * 3,
        logs: auditLogs.length
      }
    });
  } catch (error: any) {
    console.error("SEED ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
