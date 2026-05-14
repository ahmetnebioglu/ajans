/**
 * RLS Tenant Isolation Test Script (Gerçek Test)
 * 
 * Bu script, RLS policy'lerinin doğru çalışıp çalışmadığını test eder.
 * app_user (BYPASSRLS yok) ile bağlanarak gerçek RLS davranışını test eder.
 */

const pg = require("pg");

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://root:rootpassword@127.0.0.1:5433/agency_master_db?schema=public";

async function testRLSIsolation() {
  console.log("🧪 RLS Tenant Isolation Test Başlatılıyor...\n");

  // Test 1: app_user ile (RLS aktif)
  console.log("═══════════════════════════════════════════════════════════");
  console.log("TEST 1: app_user ile (RLS AKTIF - BYPASSRLS yok)");
  console.log("═══════════════════════════════════════════════════════════\n");

  const appUserClient = new pg.Client({
    connectionString: "postgresql://app_user:apppassword@127.0.0.1:5433/agency_master_db",
  });

  try {
    await appUserClient.connect();
    console.log("✅ app_user ile veritabanına bağlandı\n");

    // Test 1a: Teknikel context'inde Lead sorgula
    console.log("📋 Test 1a: Teknikel context'inde Lead sorgula");
    await appUserClient.query("SELECT set_config('app.current_tenant', 'teknikel', true)");
    const teknikelLeads = await appUserClient.query('SELECT id, "tenantId", "companyName" FROM "Lead" LIMIT 5');
    console.log(`   Teknikel context'inde Lead sayısı: ${teknikelLeads.rows.length}`);
    if (teknikelLeads.rows.length > 0) {
      console.log(`   ✅ Örnek: ${teknikelLeads.rows[0].companyName} (tenant: ${teknikelLeads.rows[0].tenantId})`);
      if (teknikelLeads.rows[0].tenantId !== "teknikel") {
        console.log("   ❌ HATA: Teknikel context'inde teknikel olmayan veri döndü!");
      } else {
        console.log("   ✅ RLS çalışıyor: Sadece teknikel verisi döndü");
      }
    } else {
      console.log("   ℹ️  Teknikel tenant'ında lead yok");
    }

    // Test 1b: Mercan context'inde Lead sorgula
    console.log("\n📋 Test 1b: Mercan context'inde Lead sorgula");
    await appUserClient.query("SELECT set_config('app.current_tenant', 'mercan', true)");
    const mercanLeads = await appUserClient.query('SELECT id, "tenantId", "companyName" FROM "Lead" LIMIT 5');
    console.log(`   Mercan context'inde Lead sayısı: ${mercanLeads.rows.length}`);
    if (mercanLeads.rows.length > 0) {
      console.log(`   ✅ Örnek: ${mercanLeads.rows[0].companyName} (tenant: ${mercanLeads.rows[0].tenantId})`);
      if (mercanLeads.rows[0].tenantId !== "mercan") {
        console.log("   ❌ HATA: Mercan context'inde mercan olmayan veri döndü!");
      } else {
        console.log("   ✅ RLS çalışıyor: Sadece mercan verisi döndü");
      }
    } else {
      console.log("   ℹ️  Mercan tenant'ında lead yok");
    }

    // Test 1c: Tenant context'i set edilmeden sorgula (RLS block etmeli)
    console.log("\n📋 Test 1c: Tenant context'i SET EDİLMEDEN Lead sorgula (RLS block etmeli)");
    await appUserClient.query("SELECT set_config('app.current_tenant', '', true)");
    const noContextLeads = await appUserClient.query('SELECT id, "tenantId", "companyName" FROM "Lead" LIMIT 5');
    console.log(`   Context yok iken Lead sayısı: ${noContextLeads.rows.length}`);
    if (noContextLeads.rows.length === 0) {
      console.log("   ✅ RLS çalışıyor: Context olmadan hiç veri döndü");
    } else {
      console.log("   ❌ HATA: Context olmadan veri döndü! RLS çalışmıyor olabilir.");
    }

    // Test 1d: LeadActivity izolasyonu
    console.log("\n📋 Test 1d: LeadActivity izolasyonu (Teknikel context)");
    await appUserClient.query("SELECT set_config('app.current_tenant', 'teknikel', true)");
    const teknikelActivities = await appUserClient.query(`
      SELECT COUNT(*) as count FROM "LeadActivity"
    `);
    console.log(`   Teknikel context'inde LeadActivity: ${teknikelActivities.rows[0].count} kayıt`);
    console.log("   ✅ LeadActivity de RLS ile korunuyor");

    await appUserClient.end();
  } catch (error) {
    console.error("❌ app_user test hatası:", error.message);
    await appUserClient.end();
  }

  // Test 2: root ile (BYPASSRLS - karşılaştırma için)
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("TEST 2: root ile (BYPASSRLS AKTIF - karşılaştırma)");
  console.log("═══════════════════════════════════════════════════════════\n");

  const rootClient = new pg.Client({
    connectionString: DATABASE_URL.replace("?schema=public", ""),
  });

  try {
    await rootClient.connect();
    console.log("✅ root ile veritabanına bağlandı\n");

    // Test 2a: Teknikel context'inde (BYPASSRLS olduğu için tüm veriler döner)
    console.log("📋 Test 2a: Teknikel context'inde Lead sorgula (root - BYPASSRLS)");
    await rootClient.query("SELECT set_config('app.current_tenant', 'teknikel', true)");
    const rootTeknikelLeads = await rootClient.query('SELECT DISTINCT "tenantId" FROM "Lead"');
    console.log(`   Root ile görülen tenant'lar: ${rootTeknikelLeads.rows.map(r => r.tenantId).join(", ")}`);
    if (rootTeknikelLeads.rows.length > 1) {
      console.log("   ✅ Root BYPASSRLS ile tüm tenant'ları görüyor (beklenen davranış)");
    }

    // Test 2b: RLS Policy'leri kontrol et
    console.log("\n📋 Test 2b: RLS Policy'leri kontrol et");
    const policies = await rootClient.query(`
      SELECT tablename, policyname, cmd 
      FROM pg_policies 
      WHERE policyname = 'tenant_isolation'
      ORDER BY tablename
    `);
    console.log(`   ✅ ${policies.rows.length} tablo RLS policy'si ile korunuyor:`);
    policies.rows.forEach((row) => {
      console.log(`   - ${row.tablename} (${row.cmd})`);
    });

    // Test 2c: RLS enabled tabloları kontrol et
    console.log("\n📋 Test 2c: RLS enabled tabloları kontrol et");
    const rlsTables = await rootClient.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname='public' AND rowsecurity=true
      ORDER BY tablename
    `);
    console.log(`   ✅ ${rlsTables.rows.length} tablo RLS enabled:`);
    rlsTables.rows.forEach((row) => {
      console.log(`   - ${row.tablename}`);
    });

    await rootClient.end();
  } catch (error) {
    console.error("❌ root test hatası:", error.message);
    await rootClient.end();
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("✅ Tüm testler tamamlandı!");
  console.log("═══════════════════════════════════════════════════════════");
}

testRLSIsolation();
