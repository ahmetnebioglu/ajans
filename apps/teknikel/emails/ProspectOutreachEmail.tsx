import * as React from 'react';
import { Html, Body, Head, Heading, Container, Preview, Section, Text, Button, Img } from '@react-email/components';

interface ProspectEmailProps {
  customerName: string;
}

const TEKNIKEL_RED = '#dc2626';

export const ProspectOutreachEmail = ({ customerName = 'Değerli Müşterimiz' }: ProspectEmailProps) => (
  <Html>
    <Head />
    <Preview>Teknikel Kombi: Servis Operasyonlarınızda Yeni Bir Dönem</Preview>
    <Body style={{ backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', margin: 0, padding: 0 }}>
      <Container style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', margin: '40px auto', padding: '0', maxWidth: '560px', overflow: 'hidden' }}>
        
        {/* ═══ HEADER ═══ */}
        <Section style={{ backgroundColor: '#f8fafc', padding: '24px 32px', textAlign: 'center' as const, borderBottom: '1px solid #e2e8f0' }}>
          <Img 
            src="https://teknikelkombiyedekparca.com.tr/assets/images/logo.png" 
            width="180" 
            alt="Teknikel Kombi Yedek Parça" 
            style={{ display: 'block', margin: '0 auto 8px auto' }}
          />
          <Text style={{ color: '#94a3b8', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' as const, fontWeight: 700, margin: 0 }}>
            Akıllı Servis Ekosistemi
          </Text>
        </Section>

        {/* ═══ ANA İÇERİK ═══ */}
        <Section style={{ padding: '32px 28px 24px 28px' }}>
          <Heading style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', margin: '0 0 24px 0', lineHeight: '1.4' }}>
            Servis Operasyonlarınızda <span style={{ color: TEKNIKEL_RED }}>Yeni Bir Dönem</span> Başlıyor
          </Heading>
          
          <Text style={{ color: '#334155', fontSize: '15px', marginBottom: '12px', fontWeight: 600 }}>
            Sayın {customerName},
          </Text>
          <Text style={{ color: '#475569', fontSize: '15px', marginBottom: '28px', lineHeight: '1.7' }}>
            Teknikel olarak, servis süreçlerinizi dijitalleştiriyoruz. Anlık stok takibi, yapay zeka destekli arıza tahmini ve 
            bulut tabanlı servis formlarımızla operasyon hızınızı %40 artırın.
          </Text>
          
          {/* ═══ VURGU KUTUSU ═══ */}
          <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: '28px' }}>
            <tr>
              <td style={{ backgroundColor: '#fef2f2', padding: '16px 20px', borderRadius: '6px', borderLeft: `4px solid ${TEKNIKEL_RED}` }}>
                <Text style={{ margin: 0, color: '#991b1b', fontSize: '14px', fontWeight: 600, fontStyle: 'italic', lineHeight: '1.6' }}>
                  "Teknolojiyle güçlendirilmiş servis ağına bugün katılın, rakiplerinizin önüne geçin."
                </Text>
              </td>
            </tr>
          </table>
        </Section>

        {/* ═══ BUTON ═══ */}
        <Section style={{ padding: '0 28px 32px 28px', textAlign: 'center' as const }}>
          <Button 
            href="https://teknikelkombi.com/demo" 
            style={{
              backgroundColor: TEKNIKEL_RED,
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '14px',
              padding: '14px 40px',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block',
              textAlign: 'center' as const,
              width: '100%',
              boxSizing: 'border-box' as const,
            }}
          >
            Hemen Bilgi Alın →
          </Button>
        </Section>

        {/* ═══ FOOTER ═══ */}
        <Section style={{ backgroundColor: '#f8fafc', padding: '20px 28px', borderTop: '1px solid #e2e8f0', textAlign: 'center' as const }}>
          <Text style={{ color: '#94a3b8', fontSize: '11px', lineHeight: '1.6', margin: 0 }}>
            © 2026 Teknikel Kombi Yedek Parça. Tüm hakları saklıdır.<br />
            İletişim listesinden çıkmak için <a href="#" style={{ color: TEKNIKEL_RED, textDecoration: 'underline' }}>tıklayın</a>.
          </Text>
        </Section>

      </Container>
    </Body>
  </Html>
);

export default ProspectOutreachEmail;
