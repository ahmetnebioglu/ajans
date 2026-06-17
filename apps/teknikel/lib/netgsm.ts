import axios from 'axios';
import { createSmsRecord, updateSmsRecord } from '@/lib/sms';

// NetGSM hata kodları
const NETGSM_ERROR_CODES: Record<string, string> = {
  '20': 'Mesaj hatalı veya eksik',
  '30': 'Geçersiz kullanıcı adı, şifre veya API erişim izni yok',
  '40': 'Yetersiz bakiye',
  '50': 'SMS gönderim hatası',
  '51': 'SMS gönderilemedi',
  '70': 'Geçersiz parametre hatası',
  '80': 'Geçersiz istek',
};

/** NetGSM çevre değişkenlerini döndürür */
const getNetgsmEnv = () => ({
  usercode: process.env.NETGSM_USERCODE,
  password: process.env.NETGSM_PASSWORD,
  sender: process.env.NETGSM_SENDER,
  baseUrl: process.env.NETGSM_BASE_URL || 'https://api.netgsm.com.tr',
});

/** Yanıt kodunun başarılı olup olmadığını kontrol eder */
const isSuccessCode = (code: string): boolean =>
  code.startsWith('00') || code.startsWith('01') || code.startsWith('02');

/** Yanıt kodundan hata mesajı üretir */
const getErrorFromCode = (code: string): string =>
  NETGSM_ERROR_CODES[code.substring(0, 2)] || 'Bilinmeyen hata kodu';

export interface SendSmsResult {
  success: boolean;
  message: string;
  responseCode?: string;
  messageId?: string | null;
  bulkId?: string | null;
  smsId?: string;
  error?: any;
}

export interface CreditResult {
  success: boolean;
  message: string;
  remainingCredits?: number;
  error?: any;
}

/**
 * NetGSM API üzerinden tek kişiye SMS gönderir
 */
export const sendNetgsmSms = async ({
  receiver,
  message,
  type = 'manual',
  saveToDb = true,
  language = 'tr',
}: {
  receiver: string;
  message: string;
  type?: string;
  saveToDb?: boolean;
  language?: string;
}): Promise<SendSmsResult> => {
  try {
    const { usercode, password, sender, baseUrl } = getNetgsmEnv();

    if (!usercode || !password || !sender) {
      throw new Error('NetGSM bilgileri (NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_SENDER) tanımlanmamış');
    }
    if (!receiver) throw new Error('Alıcı telefon numarası belirtilmemiş');
    if (!message || message.trim() === '') throw new Error('SMS metni boş olamaz');

    // Telefon numarası formatını düzelt (başında 0 varsa kaldır, sonra tekrar ekle)
    const formattedReceiver = receiver.startsWith('0') ? receiver.substring(1) : receiver;

    // Veritabanına bekleyen kayıt oluştur
    let smsRecord = null;
    if (saveToDb) {
      try {
        smsRecord = await createSmsRecord({ recipient: receiver, message, type: type as any });
      } catch {
        // DB hatası SMS gönderimi engellemesin
      }
    }

    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
  <header>
    <company>${sender}</company>
    <usercode>${usercode}</usercode>
    <password>${password}</password>
    <type>1:n</type>
    <msgheader>${sender}</msgheader>
    <dil>${language}</dil>
  </header>
  <body>
    <msg><![CDATA[${message}]]></msg>
    <no>0${formattedReceiver}</no>
  </body>
</mainbody>`;

    const { data } = await axios.post(`${baseUrl}/sms/send/xml`, xmlBody, {
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      timeout: 15000,
    });

    const responseCode = (data?.toString()?.trim() || '') as string;
    const responseArray = responseCode.split(' ');
    const messageId = responseArray.length > 1 ? responseArray[1] : null;

    // Kayıt varsa güncelle
    if (saveToDb && smsRecord) {
      try {
        await updateSmsRecord(smsRecord.id, { responseCode, messageId });
      } catch {
        // Güncelleme başarısız olsa da devam et
      }
    }

    if (isSuccessCode(responseCode)) {
      return {
        success: true,
        message: 'SMS başarıyla gönderildi',
        responseCode,
        messageId,
        smsId: smsRecord?.id,
      };
    } else {
      return {
        success: false,
        message: `SMS gönderilemedi: ${getErrorFromCode(responseCode)}`,
        responseCode,
        smsId: smsRecord?.id,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'SMS gönderilemedi: Sunucu hatası',
      error: error.response?.data || error.message,
    };
  }
};

/**
 * NetGSM API üzerinden birden fazla kişiye SMS gönderir
 */
export const sendNetgsmBulkSms = async ({
  receivers,
  message,
  type = 'manual',
  saveToDb = true,
  language = 'tr',
}: {
  receivers: string[];
  message: string;
  type?: string;
  saveToDb?: boolean;
  language?: string;
}): Promise<SendSmsResult> => {
  try {
    const { usercode, password, sender, baseUrl } = getNetgsmEnv();

    if (!usercode || !password || !sender) {
      throw new Error('NetGSM bilgileri tanımlanmamış');
    }
    if (!receivers || !Array.isArray(receivers) || receivers.length === 0) {
      throw new Error('Alıcı telefon numaraları belirtilmemiş');
    }
    if (!message || message.trim() === '') throw new Error('SMS metni boş olamaz');

    const formattedReceivers = receivers.map((r) =>
      r.startsWith('0') ? r.substring(1) : r
    );

    // Tüm alıcılar için kayıt oluştur
    const smsRecords: any[] = [];
    if (saveToDb) {
      try {
        for (const receiver of receivers) {
          const rec = await createSmsRecord({ recipient: receiver, message, type: type as any });
          smsRecords.push(rec);
        }
      } catch {
        // DB hatası devam ettirme
      }
    }

    const receiverXml = formattedReceivers.map((r) => `    <no>0${r}</no>`).join('\n');

    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
  <header>
    <company>${sender}</company>
    <usercode>${usercode}</usercode>
    <password>${password}</password>
    <type>1:n</type>
    <msgheader>${sender}</msgheader>
    <dil>${language}</dil>
  </header>
  <body>
    <msg><![CDATA[${message}]]></msg>
${receiverXml}
  </body>
</mainbody>`;

    const { data } = await axios.post(`${baseUrl}/sms/send/xml`, xmlBody, {
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      timeout: 15000,
    });

    const responseCode = (data?.toString()?.trim() || '') as string;
    const responseArray = responseCode.split(' ');
    const bulkId = responseArray.length > 1 ? responseArray[1] : null;

    if (saveToDb && smsRecords.length > 0) {
      try {
        for (const smsRecord of smsRecords) {
          await updateSmsRecord(smsRecord.id, { responseCode, messageId: bulkId, bulkId });
        }
      } catch {
        // Güncelleme başarısız olsa da devam et
      }
    }

    if (isSuccessCode(responseCode)) {
      return {
        success: true,
        message: `SMS ${receivers.length} alıcıya başarıyla gönderildi`,
        responseCode,
        messageId: bulkId,
        bulkId,
      };
    } else {
      return {
        success: false,
        message: `SMS gönderilemedi: ${getErrorFromCode(responseCode)}`,
        responseCode,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'SMS gönderilemedi: Sunucu hatası',
      error: error.response?.data || error.message,
    };
  }
};

/**
 * NetGSM'den kalan SMS kredisini sorgular
 */
export const getNetgsmSmsCredit = async (): Promise<CreditResult> => {
  try {
    const { usercode, password, baseUrl } = getNetgsmEnv();

    if (!usercode || !password) {
      throw new Error('NetGSM kullanıcı bilgileri (NETGSM_USERCODE, NETGSM_PASSWORD) tanımlanmamış');
    }

    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
  <header>
    <usercode>${usercode}</usercode>
    <password>${password}</password>
  </header>
</mainbody>`;

    const response = await axios.post(`${baseUrl}/balance/list/xml`, xmlBody, {
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      timeout: 10000,
    });

    const responseText: string =
      typeof response.data === 'string' ? response.data : response.data.toString();

    if (responseText.includes('ERR')) {
      const errorMatch = responseText.match(/ERR\s*(\d+)/);
      const errorCode = errorMatch ? errorMatch[1] : '0';
      throw new Error(`NetGSM hata kodu: ${errorCode}`);
    }

    // "00 17342 AdetSMS" formatı
    const customFormatMatch = responseText.match(/(\d+)\s+(\d+)\s+AdetSMS/);
    if (customFormatMatch) {
      const statusCode = customFormatMatch[1];
      const smsCount = parseInt(customFormatMatch[2], 10);
      if (statusCode === '00') {
        return { success: true, message: 'SMS kredi bilgisi başarıyla alındı', remainingCredits: smsCount };
      }
      throw new Error(`NetGSM durum kodu hatalı: ${statusCode}`);
    }

    // Sadece rakam formatı
    if (/^\d+$/.test(responseText.trim())) {
      return {
        success: true,
        message: 'SMS kredi bilgisi başarıyla alındı',
        remainingCredits: parseInt(responseText.trim(), 10),
      };
    }

    throw new Error('NetGSM API yanıtı anlaşılamadı');
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'SMS kredi bilgisi alınamadı: Sunucu hatası',
      error: error.message,
    };
  }
};
