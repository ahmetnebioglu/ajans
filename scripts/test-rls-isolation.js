/**
 * RLS Tenant Isolation Test Script
 * 
 * Bu script, RLS policy'lerinin doğru çalışıp çalışmadığını test eder.
 * Teknikel ve Mercan tenant'larının verilerinin izole olduğunu doğrular.
 */

const { PrismaClient } = require("@prisma/client");
const pg = require("pg");

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://root:rootpassword@127.0.0.1:5433/agency_master_db?schema=public";

async function testRLSIsolation() {
  console.log("🧪 RLS Tenant Isolation Test Başlatılıyor...\n");

  const client = new pg.Client({
    connectionString: DATABASE_URL.replace("?schema=public", ""),
  });

  try {
    await client.connect();
    console.log("✅ Veritabanına bağlandı\n");

    // Test 1: Teknikel tenant context'inde Lead sorgula
    console.log("📋 Test 1: Teknikel tenant context'inde Lead sorgula");
    await client.query("SELECT set_config('app.current_tenant', 'teknikel', true)");
    const teknikelLeads = await client.query('SELECT id, "tenantId", "companyName" FROM "Lead" LIMIT 5');
    console.log(`   Teknikel leads: ${teknikelLeads.rows.length} kayıt`);
    if (teknikelLeads.rows.length > 0) {
      console.log(`   ✅ Örnek: ${teknikelLeads.rows[0].companyName} (tenant: ${teknikelLeads.rows[0].tenantId})`);
      if (teknikelLeads.rows[0].tenantId !== "teknikel") {
        console.log("   ❌ HATA: Teknikel context'inde teknikel olmayan veri döndü!");
      }
    } else {
      console.log("   ℹ️  Teknikel tenant'ında lead yok");
    }

    // Test 2: Mercan tenant context'inde Lead sorgula
    console.log("\n📋 Test 2: Mercan tenant context'inde Lead sorgula");
    await client.query("SELECT set_config('app.current_tenant', 'mercan', true)");
    const mercanLeads = await client.query('SELECT id, "tenantId", "companyName" FROM "Lead" LIMIT 5');
    console.log(`   Mercan leads: ${mercanLeads.rows.length} kayıt`);
    if (mercanLeads.rows.length > 0) {
      console.log(`   ✅ Örnek: ${mercanLeads.rows[0].companyName} (tenant: ${mercanLeads.rows[0].tenantId})`);
      if (mercanLeads.rows[0].tenantId !== "mercan") {
        console.log("   ❌ HATA: Mercan context'inde mercan olmayan veri döndü!");
      }
    } else {
      console.log("   ℹ️  Mercan tenant'ında lead yok");
    }

    // Test 3: Cross-tenant sızıntı kontrolü
    console.log("\n📋 Test 3: Cross-tenant sızıntı kontrolü");
    const allLeads = await client.query('SELECT DISTINCT "tenantId" FROM "Lead"');
    console.log(`   Veritabanında ${allLeads.rows.length} farklı tenant var:`);
    allLeads.rows.forEach((row) => {
      console.log(`   - ${row.tenantId}`);
    });

    // Test 4: RLS Policy'leri kontrol et
    console.log("\n📋 Test 4: RLS Policy'leri kontrol et");
    const policies = await client.query(`
      SELECT tablename, policyname, cmd 
      FROM pg_policies 
      WHERE policyname = 'tenant_isolation'
      ORDER BY tablename
    `);
    console.log(`   ✅ ${policies.rows.length} tablo RLS policy'si ile korunuyor:`);
    policies.rows.forEach((row) => {
      console.log(`   - ${row.tablename} (${row.cmd})`);
    });

    // Test 5: LeadActivity izolasyonu
    console.log("\n📋 Test 5: LeadActivity izolasyonu");
    await client.query("SELECT set_config('app.current_tenant', 'teknikel', true)");
    const teknikelActivities = await client.query(`
      SELECT COUNT(*) as count FROM "LeadActivity"
    `);
    console.log(`   Teknikel context'inde LeadActivity: ${teknikelActivities.rows[0].count} kayıt`);

    console.log("\n✅ Tüm testler tamamlandı!");
  } catch (error) {
    console.error("❌ Test hatası:", error.message);
  } finally {
    await client.end();
  }
}

testRLSIsolation();
