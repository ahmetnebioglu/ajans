# Güncellenmiş Legacy Fatura Sistemi Geçiş Planı

Bu plan, `teknikel` legacy projesindeki fatura kesme (invoice) aksiyonlarında yapılan en son güncellemelerin (özellikle `cari-search.js` içinde TCKN aramalarının da `vergiNo` alanı üzerinden yapılması değişikliğinin), yeni App Router tabanlı `teknikel` projesine uygulanmasını hedefler.

## User Review Required

> [!IMPORTANT]
> Aşağıdaki plana göre değişiklikleri baştan uygulayacağım. Lütfen planı inceleyip onay verin. (Eski loglama mekanizmasını -CariSearchLog- yeni veritabanında olmadığı için atlıyor, sadece arama mantığını geçiriyorum).

## Proposed Changes

### UI Katmanı Güncellemeleri

- Fatura oluşturma modalını tetikleyen butonda, cari arama yapılırken sadece müşteri adı değil, siparişteki TCKN ve Vergi No bilgileri de gönderilecek.

#### [MODIFY] [InvoiceCreatorButton.tsx](file:///c:/GitHub/ajans/apps/teknikel/app/siparisler/InvoiceCreatorButton.tsx)
- `openHandler` fonksiyonunda `order` içerisinden `identityNumber` ve `taxNumber` çekilecek (Önceki adımda eklemiştim, üzerinden geçeceğim).
- `fetch('/api/bilsoft/cari-search')` isteğine `orderId`, `identityNumber` ve `taxNumber` parametreleri eklenecek.

---

### Backend API Güncellemeleri (Cari Arama)

- Gelişmiş çapraz arama (VKN, İsim varyasyonları vb.) mekanizması eklenecek.
- **Son Değişiklik Notu:** Bilsoft tarafında TCKN'nin ayrı bir alan olarak çalışmaması/kullanılmaması nedeniyle, hem Vergi No hem de TCKN bilgileri Bilsoft'un `vergiNo` alanında aranacak şekilde güncellendi.

#### [MODIFY] [cari-search/route.ts](file:///c:/GitHub/ajans/apps/teknikel/app/api/bilsoft/cari-search/route.ts)
- `customerName`, `identityNumber`, `taxNumber` parametreleri alınacak.
- Sırasıyla şu çapraz aramalar yapılacak:
  1. `taxNumber` varsa `vergiNo` alanı üzerinden sorgulama
  2. `identityNumber` varsa `vergiNo` alanı üzerinden sorgulama (Yeni legacy değişikliği)
  3. `customerName`'in Türkçe/ASCII, büyük/küçük harf varyasyonları ile `faturaUnvan` ve `yetkili` üzerinden sorgulama.
- Bulunan ilk başarılı sonuçta 'PERSONEL' grubunda olanlar filtrelenip istemciye dönülecek.

---

### Backend API Güncellemeleri (Fatura Kesimi)

- Sipariş üzerinden cari seçildiğinde, faturayı oluşturmadan hemen önce Bilsoft'tan o carinin eksiksiz, güncel verisi çekilerek faturaya yansıtılacak.

#### [MODIFY] [invoice/route.ts](file:///c:/GitHub/ajans/apps/teknikel/app/api/bilsoft/invoice/route.ts)
- Fatura kesim işlemi öncesi `getBilsoftCariById(cariInfo.cariId)` çağrılacak.
- Dönen detaylarla `cariInfo` nesnesi (unvan, yetkili, vergiDairesi, vergiNo vb.) doldurulacak.

#### [MODIFY] [invoice-credit-card/route.ts](file:///c:/GitHub/ajans/apps/teknikel/app/api/bilsoft/invoice-credit-card/route.ts)
- Kredi kartı faturası servisinde de `getBilsoftCariById` ile güncel cari verisi çekilip eklenecek.

## Verification Plan

### Manual Verification
1. Ideasoft üzerinden gelen örnek bir sipariş için "Fatura Oluştur" butonuna basılıp, TCKN'nin Bilsoft'ta Vergi No üzerinden aranıp carinin doğru bulunup bulunmadığı gözlemlenecek.
2. Seçilen cari ile fatura kesme isteği atıldığında, Bilsoft'a giden fatura bilgilerinde carinin vergi numarası ve vergi dairesinin tam geldiği incelenecek.
