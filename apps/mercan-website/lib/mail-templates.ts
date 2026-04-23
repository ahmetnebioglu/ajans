/**
 * MERCAN OSGB - E-POSTA ŞABLONLARI
 */

const COMMON_STYLES = `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #1e293b;
  line-height: 1.6;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
`;

const CONTAINER_STYLE = `
  width: 100%;
  max-width: 600px;
  margin: 40px auto;
  background-color: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const HEADER_STYLE = `
  background-color: #0f172a;
  padding: 40px;
  text-align: center;
`;

const CONTENT_STYLE = `
  padding: 48px;
`;

const FOOTER_STYLE = `
  padding: 32px 48px;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  text-align: center;
`;

const BUTTON_STYLE = `
  display: inline-block;
  padding: 18px 36px;
  background-color: #2563eb;
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 800;
  border-radius: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
`;

const SOCIAL_LINK_STYLE = `
  color: #64748b;
  text-decoration: none;
  margin: 0 10px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
`;

const UNSUBSCRIBE_STYLE = `
  display: block;
  margin-top: 24px;
  color: #94a3b8;
  font-size: 11px;
  text-decoration: underline;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * ŞABLON 1: ABONELİK DOĞRULAMA (VERIFICATION)
 */
export const VERIFICATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${COMMON_STYLES} background-color: #f1f5f9;">
    <div style="${CONTAINER_STYLE}">
        <div style="${HEADER_STYLE}">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -1px; font-style: italic; text-transform: uppercase;">
                Mercan <span style="color: #3b82f6;">İSG</span>
            </h1>
        </div>
        <div style="${CONTENT_STYLE}">
            <h2 style="font-size: 24px; font-weight: 800; margin: 0 0 20px 0; letter-spacing: -0.5px; color: #0f172a;">Mercan dünyasına hoş geldiniz!</h2>
            <p style="margin: 0 0 32px 0; font-size: 16px; color: #475569;">
                Güncel mevzuat, sektörel duyurular ve özel dökümanlardan haberdar olmak için lütfen aşağıdaki butona tıklayarak aboneliğinizi onaylayın.
            </p>
            <div style="text-align: center; margin-bottom: 32px;">
                <a href="{{verify_url}}" style="${BUTTON_STYLE}">Aboneliği Onayla</a>
            </div>
            <p style="margin: 0; font-size: 13px; color: #94a3b8; font-style: italic;">
                Bu talebi siz yapmadıysanız lütfen bu maili dikkate almayın. Linkin süresi 24 saat içinde dolacaktır.
            </p>
        </div>
        <div style="${FOOTER_STYLE}">
            <p style="margin: 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">
                Mercan OSGB Danışmanlık ve Eğitim Ltd. Şti.
            </p>
            <a href="{{unsubscribe_url}}" style="${UNSUBSCRIBE_STYLE}">Abonelikten Ayrıl</a>
        </div>
    </div>
</body>
</html>
`;

/**
 * ŞABLON 2: HOŞ GELDİN VE ONAY (WELCOME)
 */
export const WELCOME_TEMPLATE = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${COMMON_STYLES} background-color: #f1f5f9;">
    <div style="${CONTAINER_STYLE}">
        <div style="${HEADER_STYLE}">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -1px; font-style: italic; text-transform: uppercase;">
                Mercan <span style="color: #3b82f6;">İSG</span>
            </h1>
        </div>
        <div style="${CONTENT_STYLE}">
            <div style="width: 56px; h-56px; background-color: #dcfce7; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
               <span style="font-size: 24px;">🎉</span>
            </div>
            <h2 style="font-size: 24px; font-weight: 800; margin: 0 0 20px 0; letter-spacing: -0.5px; color: #0f172a;">Aramıza Hoş Geldiniz!</h2>
            <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569;">
                Aboneliğiniz başarıyla onaylandı. Artık en güncel İSG evraklarına, sektörel duyurulara ve rehberlere doğrudan ulaşabileceksiniz.
            </p>
            <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid #f1f5f9;">
                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Sizi Neler Bekliyor?</p>
                <ul style="margin: 0; padding: 0 0 0 20px; font-size: 14px; color: #64748b; line-height: 2;">
                    <li>Haftalık Mevzuat Güncellemeleri</li>
                    <li>Özel İSG Form ve Döküman Taslakları</li>
                    <li>Sektörel Web seminerleri ve Eğitim Duyuruları</li>
                </ul>
            </div>
            <div style="text-align: center;">
                <a href="{{site_url}}" style="${BUTTON_STYLE}">SİTEYE GÖZ AT</a>
            </div>
        </div>
        <div style="${FOOTER_STYLE}">
            <div style="margin-bottom: 24px;">
                <a href="#" style="${SOCIAL_LINK_STYLE}">LinkedIn</a>
                <a href="#" style="${SOCIAL_LINK_STYLE}">Twitter</a>
                <a href="#" style="${SOCIAL_LINK_STYLE}">Instagram</a>
            </div>
            <p style="margin: 0; font-size: 11px; font-weight: 600; color: #94a3b8; line-height: 1.8; text-transform: uppercase; letter-spacing: 0.5px;">
                Ataşehir, İstanbul, Türkiye<br>
                © 2026 Mercan OSGB Danışmanlık. Tüm hakları saklıdır.
            </p>
            <a href="{{unsubscribe_url}}" style="${UNSUBSCRIBE_STYLE}">Abonelikten Ayrıl</a>
        </div>
    </div>
</body>
</html>
`;
