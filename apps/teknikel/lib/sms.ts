import { unsecured_prisma as prisma } from '@ajans/db';
import { SmsRecord } from '@prisma/client';

export type SmsType = 'manual' | 'order' | 'notification' | 'reminder' | 'other';
export type SmsStatus = 'pending' | 'sent' | 'failed';
export type OrderEvent = 'create' | 'update' | 'unknown';

interface CreateSmsRecordParams {
  recipient: string;
  message: string;
  type?: SmsType;
  orderId?: string | null;
  orderEvent?: OrderEvent | null;
  orderInfo?: Record<string, any> | null;
}

interface UpdateSmsRecordParams {
  responseCode?: string;
  messageId?: string | null;
  status?: string | null;
  bulkId?: string | null;
  jobId?: string | null;
  orderInfo?: Record<string, any> | null;
  errorDetail?: string | null;
}

/**
 * NetGSM yanıt kodundan hata mesajı döndürür
 */
const getErrorMessage = (responseCode?: string): string => {
  if (!responseCode) return 'Yanıt kodu yok';

  const errorCodes: Record<string, string> = {
    '00': 'Başarılı',
    '01': 'Başarılı',
    '02': 'Başarılı',
    '20': 'Mesaj hatalı veya eksik',
    '30': 'Geçersiz kullanıcı adı, şifre veya API erişim izni yok',
    '40': 'Yetersiz bakiye',
    '50': 'SMS gönderim hatası',
    '51': 'SMS gönderilemedi',
    '70': 'Geçersiz parametre hatası',
    '80': 'Geçersiz istek',
  };

  const codePrefix = responseCode.substring(0, 2);
  return errorCodes[codePrefix] || 'Bilinmeyen hata kodu';
};

/**
 * Veritabanına yeni bir SMS kaydı oluşturur
 */
export const createSmsRecord = async ({
  recipient,
  message,
  type = 'manual',
  orderId = null,
  orderEvent = null,
  orderInfo = null,
}: CreateSmsRecordParams): Promise<SmsRecord> => {
  return await prisma.smsRecord.create({
    data: {
      recipient,
      message,
      type,
      status: 'pending',
      orderId,
      orderEvent,
      orderInfo: orderInfo || undefined,
    },
  });
};

/**
 * SMS kaydını API yanıtıyla günceller
 */
export const updateSmsRecord = async (
  id: string,
  responseData: UpdateSmsRecordParams
): Promise<SmsRecord | null> => {
  const {
    responseCode,
    messageId = null,
    status: providedStatus = null,
    bulkId = null,
    jobId = null,
    orderInfo = null,
    errorDetail = null,
  } = responseData;

  // Yanıt kodundan durumu belirle
  let status = providedStatus || 'failed';
  if (!providedStatus && responseCode) {
    status =
      responseCode.startsWith('00') ||
      responseCode.startsWith('01') ||
      responseCode.startsWith('02')
        ? 'sent'
        : 'failed';
  }

  const updateObj: Record<string, any> = {
    status,
    responseCode,
    responseMessage: getErrorMessage(responseCode),
  };

  if (messageId) updateObj.messageId = messageId;
  if (bulkId) updateObj.bulkId = bulkId;
  if (jobId) updateObj.jobId = jobId;
  if (errorDetail) updateObj.errorDetail = errorDetail;
  if (orderInfo) updateObj.orderInfo = orderInfo;

  return await prisma.smsRecord.update({
    where: { id },
    data: updateObj,
  });
};

/**
 * SMS kayıtlarını filtreli şekilde listeler
 */
export const getSmsRecords = async (
  filter: Record<string, any> = {}
): Promise<SmsRecord[]> => {
  const prismaWhere: Record<string, any> = {};

  if (filter.type) prismaWhere.type = filter.type;
  if (filter.status) prismaWhere.status = filter.status;
  if (filter.recipient) prismaWhere.recipient = filter.recipient;

  if (filter.createdAt) {
    prismaWhere.createdAt = {};
    if (filter.createdAt.$gte) prismaWhere.createdAt.gte = filter.createdAt.$gte;
    if (filter.createdAt.$lte) prismaWhere.createdAt.lte = filter.createdAt.$lte;
  }

  return await prisma.smsRecord.findMany({
    where: prismaWhere,
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * ID'ye göre tek bir SMS kaydı döndürür
 */
export const getSmsRecord = async (
  id: string
): Promise<SmsRecord | null> => {
  return await prisma.smsRecord.findUnique({
    where: { id },
  });
};
