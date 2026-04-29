import * as React from 'react';
import { Html, Body, Head, Heading, Container, Preview, Section, Text, Button, Img } from '@react-email/components';

interface MasterEmailProps {
  customerName: string;
}

const TEKNIKEL_RED = '#dc2626';

export const MasterNetworkEmail = ({ customerName = 'Değerli Ustamız' }: MasterEmailProps) => (
  <Html>
    <Head />
    <Preview>Teknikel Onaylı Usta Ağına Katılın: Hazır Müşteri ve İndirimli Parça!</Preview>
    <Body style={{ backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', margin: 0, padding: 0 }}>
      <Container style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', margin: '40px auto', padding: '0', maxWidth: '560px', overflow: 'hidden', borderTop: `6px solid ${TEKNIKEL_RED}` }}>
        
        {/* ═══ HEADER ═══ */}
        <Section style={{ backgroundColor: '#f8fafc', padding: '28px 28px 16px 28px', textAlign: 'center' as const, borderBottom: '1px solid #e2e8f0' }}>
          <Img 
            src="https://teknikelkombiyedekparca.com.tr/assets/images/logo.png" 
            width="160" 
            alt="Teknikel Kombi Yedek Parça" 
            style={{ display: 'block', margin: '0 auto 4px auto' }}
          />
          <Text style={{ color: '#94a3b8', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' as const, fontWeight: 700, margin: 0 }}>
            Usta İş Ortağı Programı
          </Text>
        </Section>

        {/* ═══ ANA İÇERİK ═══ */}
        <Section style={{ padding: '8px 28px 24px 28px' }}>
          <Heading style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', margin: '0 0 24px 0', lineHeight: '1.4' }}>
            Kendi İşinizin Patronu Olun,<br />
            <span style={{ color: TEKNIKEL_RED }}>Müşteriniz Bizden Gelsin!</span>
          </Heading>
          
          <Text style={{ color: '#334155', fontSize: '15px', marginBottom: '12px', fontWeight: 600 }}>
            Merhaba {customerName},
          </Text>
          <Text style={{ color: '#475569', fontSize: '15px', marginBottom: '24px', lineHeight: '1.7' }}>
            Teknikel Onaylı Usta Ağına katılarak bölgenizdeki hazır müşterilere ulaşın. İşte avantajlarınız:
          </Text>
          
          {/* ═══ AVANTAJ LİSTESİ ═══ */}
          <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: '28px' }}>
            <tr>
              <td style={{ padding: '12px 16px', backgroundColor: '#fef2f2', borderRadius: '4px', marginBottom: '8px' }}>
                <Text style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '14px', lineHeight: '1.6' }}>
                  ✅ <strong>Hazır Müşteri:</strong> Reklamla uğraşmayın, işler telefonunuza düşsün.
                </Text>
                <Text style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '14px', lineHeight: '1.6' }}>
                  ✅ <strong>İndirimli Parça:</strong> Tüm kombi ve kart parçalarında %20'ye varan özel indirim.
                </Text>
                <Text style={{ margin: 0, color: '#1e293b', fontSize: '14px', lineHeight: '1.6' }}>
                  ✅ <strong>Teknik Destek:</strong> Takıldığınız her yerde uzman ekibimiz bir telefon uzağınızda.
                </Text>
              </td>
            </tr>
          </table>
        </Section>

        {/* ═══ BUTON ═══ */}
        <Section style={{ padding: '0 28px 32px 28px', textAlign: 'center' as const }}>
          <Button 
            href="https://teknikelkombi.com/usta-kayit" 
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
            Usta Ağına Katıl →
          </Button>
        </Section>

        {/* ═══ FOOTER ═══ */}
        <Section style={{ backgroundColor: '#f8fafc', padding: '20px 28px', borderTop: '1px solid #e2e8f0', textAlign: 'center' as const }}>
          <Text style={{ color: '#94a3b8', fontSize: '11px', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
            "Ustalığınızı Teknikel gücüyle birleştirin, kazancınızı katlayın."
          </Text>
        </Section>

      </Container>
    </Body>
  </Html>
);

export default MasterNetworkEmail;
