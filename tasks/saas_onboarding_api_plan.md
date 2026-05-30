# SaaS Onboarding & Multi-Tenant (Müşteri Bazlı) API Entegrasyon Planı

Kullanıcı bazlı yerine **müşteri/firma (Company) bazlı izolasyon** yapmak ve anında hesap aktivasyonlu bir SaaS sürecini API aracılığıyla yönetmek için gereken mimari plan aşağıdadır. Satış sayfası harici bir ekip/proje tarafından geliştirileceği için, bu proje (mercan-erp) sadece gerekli REST API uçlarını (endpoint) sunan bir backend/dashboard olarak çalışacaktır.

## Açık Sorular ve Kararlar
- Dış satış sistemi ile bizim ERP sistemimiz arasındaki API iletişiminin güvenliği nasıl sağlanacak? (Örn: Sadece o uygulamanın bildiği bir API Anahtarı/Secret Key ile mi, yoksa OAuth2 gibi bir yapı ile mi?)
- Harici satış sistemi ödeme başarısız olduğunda veya iptal edildiğinde (abonelik iptali/iade) ERP tarafına bir webhook veya API çağrısı yapıp hesabı pasife çekecek mi?
- Hizmet paketleri (Örn: Başlangıç, Profesyonel) ve kısıtlamaları (Örn: Maksimum 5 personel) bizim sistemimizde mi yönetilecek yoksa dış satış sistemi sadece "bu firmayı aktif et" mi diyecek?

## Önerilen Değişiklikler

Aşağıda bu sistemi baştan uca kurmak için ERP sisteminde (mercan-erp) yapacağımız teknik değişikliklerin ve yazılacak API uçlarının listesi bulunmaktadır.

### 1. Veritabanı ve Kimlik Doğrulama (Auth) Güncellemesi
Mevcut RLS (Row Level Security) yapısını "Firma = Tenant" mantığına oturtacağız.

#### packages/auth/src/options.ts & next-auth.d.ts
- Session (oturum) objesine `tenantId` eklenecek. Bir kullanıcı giriş yaptığında, ERP sistemi arka planda onun hangi firmaya (`tenantId`) ait olduğunu bilecek ve tüm sorguları o firmanın verisiyle sınırlandıracak.

#### packages/db/prisma/schema.prisma
- `tenantId` varsayılan değerleri `"mercan"` metninden kaldırılacak ve zorunlu hale getirilecek. Yeni bir şirket oluşturulduğunda kendi `id`'si aynı zamanda `tenantId` olarak kullanılacak.
- (Opsiyonel) Dış uygulama entegrasyonu için güvenliği sağlayacak `ApiKey` veya `IntegrationToken` tablosu/alanı eklenebilir.

---

### 2. Güvenli Veri Çekme (ERP İçi Refaktör)
ERP uygulaması içindeki veritabanı sorgularının güvenli hale getirilmesi.

#### apps/mercan-erp/app/... (İlgili Sayfalar ve API'ler)
- `unsecured_prisma` kullanımları bulunup yerine `getSecuredPrisma(session.user.tenantId)` fonksiyonu yazılacak. Bu sayede, geliştirici hata yapsa bile PostgreSQL RLS (Satır Bazlı Güvenlik) devreye girip A firmasının B firmasını görmesini SQL seviyesinde engelleyecek.

---

### 3. Harici Satış Sistemi İçin API Endpointleri (Provisioning API)
Dış projenin bizim sistemimizde otomatik hesap oluşturabilmesi için yazılacak servisler.

#### apps/mercan-erp/app/api/external/provision/route.ts
- **POST /api/external/provision**: Dış sistemden gelen başarılı satın alma bildirimini karşılayacak ana endpoint.
  - **Güvenlik:** Sadece yetkili satış uygulamasından gelen istekleri kabul etmek için bir "Bearer Token" veya "API Key" doğrulaması yapılacak.
  - **İşlem Adımları:**
    1. `Company` tablosunda yeni firmayı oluşturacak ve bir benzersiz ID alacak.
    2. Alınan Company ID'yi `tenantId` olarak kullanarak, ödemeyi yapan kişi için `Role: ADMIN` olan bir `User` oluşturacak.
    3. Gerekli varsayılan klasörleri veya verileri (Örn: Boş departmanlar) bu `tenantId` ile oluşturacak.
    4. Müşteriye "Hesabınız başarıyla oluşturuldu, ERP'ye giriş yapabilirsiniz" şeklinde e-postayı (Resend üzerinden) tetikleyecek (Veya maili dış sistem atacak, bu API sadece "İşlem başarılı, giriş şifresi budur" diye dış sisteme yanıt dönecek).

#### apps/mercan-erp/app/api/external/suspend/route.ts
- **POST /api/external/suspend**: Abonelik iptali veya ödeme çekilememesi durumunda hesabın (ve bağlı kullanıcıların) erişimini donduracak servis.
