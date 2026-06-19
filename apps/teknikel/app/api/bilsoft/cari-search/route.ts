import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { getValidToken } from '@/src/services/bilsoft';
import { NextResponse } from 'next/server';

/**
 * Bilsoft carilerinde müşteri adına göre ara.
 * Servis siparişleri için cari seçimi yapmak için kullanılır.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { orderId, customerName, companyName, identityNumber, taxNumber } = await request.json();

    if (
      (!customerName || !customerName.trim()) &&
      (!companyName || !companyName.trim()) &&
      (!identityNumber || !identityNumber.trim()) &&
      (!taxNumber || !taxNumber.trim())
    ) {
      return NextResponse.json({
        success: false,
        error: 'Arama için en az bir müşteri adı, firma adı, TCKN veya vergi numarası sağlamalısınız',
      }, { status: 400 });
    }

    const token = await getValidToken();

    // Türkçe harf dönüşümleri
    const turkishToLower = (str: string) =>
      str
        .replace(/İ/g, 'i')
        .replace(/I/g, 'ı')
        .replace(/Ğ/g, 'ğ')
        .replace(/Ü/g, 'ü')
        .replace(/Ş/g, 'ş')
        .replace(/Ö/g, 'ö')
        .replace(/Ç/g, 'ç')
        .toLowerCase();

    const turkishToUpper = (str: string) =>
      str
        .replace(/i/g, 'İ')
        .replace(/ğ/g, 'Ğ')
        .replace(/ü/g, 'Ü')
        .replace(/ş/g, 'Ş')
        .replace(/ö/g, 'Ö')
        .replace(/ç/g, 'Ç')
        .replace(/ı/g, 'I')
        .toUpperCase();

    const normalize = (value: string) => turkishToLower(value.trim());

    const turkishToAscii = (str: string) =>
      str
        .replace(/ç/g, 'c')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ı/g, 'i');

    const nameValue = customerName?.trim() || '';
    const trLower = nameValue ? normalize(nameValue) : '';
    const asciiLower = trLower ? turkishToAscii(trLower) : '';
    const trUpper = nameValue ? turkishToUpper(nameValue) : '';
    const asciiUpper = trUpper
      ? trUpper
          .replace(/Ç/g, 'C')
          .replace(/Ş/g, 'S')
          .replace(/Ğ/g, 'G')
          .replace(/Ü/g, 'U')
          .replace(/Ö/g, 'O')
          .replace(/İ/g, 'I')
      : '';
      
    const companyValue = companyName?.trim() || '';
    const companyTrLower = companyValue ? normalize(companyValue) : '';
    const companyAsciiLower = companyTrLower ? turkishToAscii(companyTrLower) : '';
    const companyTrUpper = companyValue ? turkishToUpper(companyValue) : '';
    const companyAsciiUpper = companyTrUpper
      ? companyTrUpper
          .replace(/Ç/g, 'C')
          .replace(/Ş/g, 'S')
          .replace(/Ğ/g, 'G')
          .replace(/Ü/g, 'U')
          .replace(/Ö/g, 'O')
          .replace(/İ/g, 'I')
      : '';
      
    const identityValue = identityNumber?.trim() || '';
    const taxValue = taxNumber?.trim() || '';

    const bilsoftCariSearch = async (field: string, value: string) => {
      const response = await fetch('https://apiv3.bilsoft.com/api/CariKart/getall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          aranacakKelime: '',
          searchType: ['Contains'],
          subeAdi: 'Merkez',
          veri: { [field]: value },
          pagingOptions: { pageSize: 1000, pageNumber: 0 },
        }),
      });
      return await response.json();
    };

    let searchResponse: any = null;
    let finalCaris: any[] = [];

    const trySearch = async (field: string, value: string) => {
      if (!value) return null;
      const resp = await bilsoftCariSearch(field, value);
      if (resp?.success && resp?.data && resp.data.length > 0) {
        const filtered = resp.data.filter((cari: any) => cari.grup !== 'PERSONEL');
        if (filtered.length > 0) {
          finalCaris = filtered;
          return resp;
        }
      }
      return null;
    };

    const isDummyNumber = (val: string) => {
      if (!val) return true;
      const cleanVal = val.replace(/\D/g, '');
      if (cleanVal.length < 10) return false;
      if (/^(\d)\1+$/.test(cleanVal)) return true;
      if (cleanVal === '1234567890' || cleanVal === '12345678901' || cleanVal === '0123456789' || cleanVal === '01234567890') return true;
      return false;
    };

    // TCKN / Vergi No aramaları
    if (taxValue && !isDummyNumber(taxValue)) {
      searchResponse = await trySearch('vergiNo', taxValue);
    }
    if (!searchResponse && identityValue && !isDummyNumber(identityValue)) {
      searchResponse = await trySearch('vergiNo', identityValue);
    }

    // Firma Unvan aramaları
    if (!searchResponse && companyValue) searchResponse = await trySearch('faturaUnvan', companyValue);
    if (!searchResponse && companyTrLower) searchResponse = await trySearch('faturaUnvan', companyTrLower);
    if (!searchResponse && companyAsciiLower) searchResponse = await trySearch('faturaUnvan', companyAsciiLower);
    if (!searchResponse && companyTrUpper) searchResponse = await trySearch('faturaUnvan', companyTrUpper);
    if (!searchResponse && companyAsciiUpper) searchResponse = await trySearch('faturaUnvan', companyAsciiUpper);

    // Kişi Unvan aramaları
    if (!searchResponse && nameValue) searchResponse = await trySearch('faturaUnvan', nameValue);
    if (!searchResponse && trLower) searchResponse = await trySearch('faturaUnvan', trLower);
    if (!searchResponse && asciiLower) searchResponse = await trySearch('faturaUnvan', asciiLower);
    if (!searchResponse && trUpper) searchResponse = await trySearch('faturaUnvan', trUpper);
    if (!searchResponse && asciiUpper) searchResponse = await trySearch('faturaUnvan', asciiUpper);

    // Yetkili aramaları
    if (!searchResponse && nameValue) searchResponse = await trySearch('yetkili', nameValue);
    if (!searchResponse && trLower) searchResponse = await trySearch('yetkili', trLower);
    if (!searchResponse && asciiLower) searchResponse = await trySearch('yetkili', asciiLower);
    if (!searchResponse && trUpper) searchResponse = await trySearch('yetkili', trUpper);
    if (!searchResponse && asciiUpper) searchResponse = await trySearch('yetkili', asciiUpper);

    if (!searchResponse) {
      return NextResponse.json({
        success: true,
        caris: [],
        message: 'Cari bulunamadı',
      });
    }

    return NextResponse.json({
      success: true,
      caris: finalCaris,
      message: `${finalCaris.length} cari bulundu`,
    });
  } catch (error) {
    console.error('[CariSearch] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
