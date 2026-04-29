import * as React from "react";
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Preview,
  Section,
  Text,
  Button,
  Img,
  Hr,
} from "@react-email/components";

interface EmailProps {
  customerName?: string;
  deviceModel: string;
  warrantyPeriod?: string;
  actionUrl: string;
}

const TEKNIKEL_RED = "#dc2626";
const TEKNIKEL_RED_DARK = "#b91c1c";

export const ServiceNotificationEmail = ({
  customerName,
  deviceModel,
  warrantyPeriod = "6 Ay",
  actionUrl,
}: EmailProps) => {
  const salutation = customerName
    ? `Sayın ${customerName}`
    : "Değerli Müşterimiz";

  return (
    <Html>
      <Head />
      <Preview>{deviceModel} Servis İşlemleri Tamamlandı</Preview>
      <Body
        style={{
          backgroundColor: "#f8fafc",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            margin: "40px auto",
            padding: "0",
            maxWidth: "560px",
            overflow: "hidden",
          }}
        >
          {/* ═══ HEADER - Logo & Kurumsal Bant ═══ */}
          <Section
            style={{
              backgroundColor: "#f8fafc",
              padding: "24px 32px",
              textAlign: "center" as const,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <Img
              src="https://teknikelkombiyedekparca.com.tr/assets/images/logo.png"
              width="180"
              alt="Teknikel Kombi Yedek Parça"
              style={{ display: "block", margin: "0 auto 8px auto" }}
            />
            <Text
              style={{
                color: "#94a3b8",
                fontSize: "10px",
                letterSpacing: "2px",
                textTransform: "uppercase" as const,
                fontWeight: 700,
                margin: 0,
              }}
            >
              Resmi Teknik Servis Bildirimi
            </Text>
          </Section>

          {/* ═══ ANA İÇERİK ═══ */}
          <Section style={{ padding: "32px 28px 24px 28px" }}>
            <Heading
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#1e293b",
                margin: "0 0 24px 0",
                lineHeight: "1.4",
              }}
            >
              Cihazınızın Servis İşlemleri Başarıyla Tamamlandı
            </Heading>

            <Text
              style={{
                color: "#334155",
                fontSize: "15px",
                marginBottom: "12px",
                fontWeight: 600,
              }}
            >
              {salutation},
            </Text>
            <Text
              style={{
                color: "#475569",
                fontSize: "15px",
                marginBottom: "28px",
                lineHeight: "1.7",
              }}
            >
              <strong>{deviceModel}</strong> cihazınızın tüm bakım ve onarım
              işlemleri uzman ekibimiz tarafından tamamlanmış ve kalite
              testlerinden geçirilmiştir.
            </Text>

            {/* ═══ GARANTİ KUTUSU ═══ */}
            <table
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              style={{ marginBottom: "28px" }}
            >
              <tr>
                <td
                  style={{
                    backgroundColor: "#fef2f2",
                    padding: "16px 20px",
                    borderRadius: "6px",
                    border: `2px solid ${TEKNIKEL_RED}20`,
                    borderLeft: `4px solid ${TEKNIKEL_RED}`,
                  }}
                >
                  <table cellPadding={0} cellSpacing={0}>
                    <tr>
                      <td
                        style={{
                          verticalAlign: "middle",
                          paddingRight: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: TEKNIKEL_RED,
                            borderRadius: "50%",
                            textAlign: "center" as const,
                            lineHeight: "32px",
                            color: "#fff",
                            fontSize: "16px",
                            fontWeight: 800,
                          }}
                        >
                          ✓
                        </div>
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        <Text
                          style={{
                            margin: 0,
                            color: "#991b1b",
                            fontSize: "13px",
                            fontWeight: 700,
                          }}
                        >
                          Bu işlem için <strong>{warrantyPeriod}</strong> yedek
                          parça ve işçilik garantisi verilmiştir.
                        </Text>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </Section>

          {/* ═══ BUTON ═══ */}
          <Section
            style={{
              padding: "0 28px 32px 28px",
              textAlign: "center" as const,
            }}
          >
            <Button
              href={actionUrl}
              style={{
                backgroundColor: TEKNIKEL_RED,
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "14px",
                padding: "14px 40px",
                borderRadius: "6px",
                textDecoration: "none",
                display: "inline-block",
                textAlign: "center" as const,
                width: "100%",
                boxSizing: "border-box" as const,
              }}
            >
              Dijital Servis Formunu Görüntüle →
            </Button>
          </Section>

          {/* ═══ FOOTER ═══ */}
          <Section
            style={{
              backgroundColor: "#f8fafc",
              padding: "20px 28px",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <Text
              style={{
                color: "#94a3b8",
                fontSize: "11px",
                lineHeight: "1.6",
                textAlign: "center" as const,
                margin: 0,
              }}
            >
              Teknikel Kombi Yedek Parça — Dijital Servis Altyapısı
              <br />
              Herhangi bir sorunuz için{" "}
              <strong style={{ color: TEKNIKEL_RED }}>
                0850 XXX XX XX
              </strong>{" "}
              numaralı hattımızdan bize ulaşabilirsiniz.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ServiceNotificationEmail;
