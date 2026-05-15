import { getValidToken, fetchWithIdeasoftRetry } from './tokenManager';
import { unstable_cache } from 'next/cache';

/**
 * Ideasoft API Servis
 * Tüm Ideasoft API çağrılarını merkezi olarak yönetir
 */

// ============================================================================
// MÜŞTERILER (Customers)
// ============================================================================

interface IdeasoftCustomer {
  id: number;
  firstname: string;
  surname: string;
  email: string;
  phoneNumber?: string;
  mobilePhoneNumber?: string;
  commercialName?: string;
  taxNumber?: string;
  taxOffice?: string;
  address?: string;
  location?: { name: string };
  district?: string;
  zipCode?: string;
  country?: { name: string };
  status?: string;
  createdAt?: string;
  lastLoginDate?: string;
  updatedAt?: string;
  memberGroup?: { name: string };
  pointAmount?: number;
  kvkkStatus?: number;
  allowedToPhone?: number;
  allowedToSms?: number;
  allowedToCampaigns?: number;
  deviceType?: string;
  lastIp?: string;
  gender?: string;
  birthDate?: string;
  tcId?: string;
}

const _getIdeasoftCustomers = async (): Promise<IdeasoftCustomer[]> => {
  const domain = process.env.domain || 'https://teknikelkombi.myideasoft.com';

  let allCustomers: IdeasoftCustomer[] = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const response = await fetchWithIdeasoftRetry(
      `${domain}/admin-api/members?limit=${limit}&page=${page}&sort=-id`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ideasoft API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to fetch customers: ${response.statusText}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      allCustomers = allCustomers.concat(data);

      if (data.length < limit) {
        break;
      }

      page++;
    } else {
      break;
    }
  }

  return allCustomers;
};

// Cache 8 saat
export const getIdeasoftCustomers = unstable_cache(
  _getIdeasoftCustomers,
  ['ideasoft-musteriler'],
  { revalidate: 28800, tags: ['ideasoft-musteriler'] }
);

export async function getIdeasoftCustomerById(id: number): Promise<IdeasoftCustomer | null> {
  const domain = process.env.domain || 'https://teknikelkombi.myideasoft.com';

  const response = await fetchWithIdeasoftRetry(`${domain}/admin-api/members/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch customer ${id}:`, response.statusText);
    return null;
  }

  return response.json();
}

// ============================================================================
// ÜRÜNLER (Products)
// ============================================================================

interface IdeasoftProduct {
  id: number;
  name: string;
  sku: string;
  barcode?: string;
  price1: number;
  price2?: number;
  price3?: number;
  tax: number;
  taxIncluded?: boolean;
  stockAmount: number;
  stockTypeLabel?: string;
  brand?: { name: string };
  categories?: Array<{ name: string }>;
  images?: Array<{ thumbUrl: string; originalUrl: string }>;
  detail?: { details?: string; extraDetails?: string };
  createdAt?: string;
  updatedAt?: string;
}

interface IdeasoftProductsResponse {
  data: IdeasoftProduct[];
  totalCount: number;
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
  };
}

const _getIdeasoftProducts = async (
  sort: string = '-id',
  page: number = 1,
  limit: number = 30,
  searchTerm?: string
): Promise<IdeasoftProductsResponse> => {
  const domain = process.env.domain || 'https://teknikelkombi.myideasoft.com';

  const params = new URLSearchParams();
  params.append('sort', sort);
  params.append('limit', limit.toString());
  params.append('page', page.toString());

  if (searchTerm) {
    params.append('s', searchTerm);
  }

  const response = await fetchWithIdeasoftRetry(`${domain}/admin-api/products?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ideasoft Products API Error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  const data = await response.json();
  const totalCount = response.headers.get('total_count') || response.headers.get('x-total-count');

  return {
    data: Array.isArray(data) ? data : [],
    totalCount: totalCount ? parseInt(totalCount) : 0,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: totalCount ? Math.ceil(parseInt(totalCount) / limit) : 0,
    },
  };
};

// Cache 24 saat
export const getIdeasoftProducts = unstable_cache(
  _getIdeasoftProducts,
  ['ideasoft-urunler'],
  { revalidate: 86400, tags: ['ideasoft-urunler'] }
);

export async function getIdeasoftProductById(id: number): Promise<IdeasoftProduct | null> {
  const domain = process.env.domain || 'https://teknikelkombi.myideasoft.com';

  const response = await fetchWithIdeasoftRetry(`${domain}/admin-api/products/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch product ${id}:`, response.statusText);
    return null;
  }

  return response.json();
}

// ============================================================================
// SİPARİŞLER (Orders)
// ============================================================================

interface IdeasoftOrder {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  customerFirstname: string;
  customerSurname: string;
  customerEmail: string;
  customerPhone: string;
  memberGroupName?: string;
  paymentTypeName: string;
  paymentProviderName: string;
  paymentStatus?: string;
  shippingCompanyName: string;
  finalAmount: number;
  generalAmount?: number;
  amount: number;
  taxAmount: number;
  shippingAmount: number;
  couponDiscount?: number;
  promotionDiscount?: number;
  installment?: number;
  installmentRate?: number;
  orderItems?: Array<any>;
  shippingAddress?: any;
  billingAddress?: any;
  clientIp?: string;
  transactionId?: string;
  orderDetails?: Array<any>;
  [key: string]: any;
}

interface IdeasoftOrdersResponse {
  data: IdeasoftOrder[];
  totalCount: number;
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
  };
}

const _getIdeasoftOrders = async (
  sort: string = '-id',
  page: number = 1,
  limit: number = 50,
  status?: string
): Promise<IdeasoftOrdersResponse> => {
  const domain = process.env.domain || 'https://teknikelkombi.myideasoft.com';

  const params = new URLSearchParams();
  params.append('sort', sort);
  params.append('limit', limit.toString());
  params.append('page', page.toString());

  if (status) {
    params.append('status', status);
  }

  const response = await fetchWithIdeasoftRetry(`${domain}/admin-api/orders?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ideasoft Orders API Error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(`Failed to fetch orders: ${response.statusText}`);
  }

  const data = await response.json();
  const totalCount = response.headers.get('total_count') || response.headers.get('x-total-count');

  return {
    data: Array.isArray(data) ? data : [],
    totalCount: totalCount ? parseInt(totalCount) : 0,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: totalCount ? Math.ceil(parseInt(totalCount) / limit) : 0,
    },
  };
};

// Cache 2 saat
export const getIdeasoftOrders = unstable_cache(
  _getIdeasoftOrders,
  ['ideasoft-siparisler'],
  { revalidate: 7200, tags: ['ideasoft-siparisler'] }
);

export async function getIdeasoftOrderById(id: number): Promise<IdeasoftOrder | null> {
  const domain = process.env.domain || 'https://teknikelkombi.myideasoft.com';

  const response = await fetchWithIdeasoftRetry(`${domain}/admin-api/orders/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch order ${id}:`, response.statusText);
    return null;
  }

  return response.json();
}

export async function updateIdeasoftOrderStatus(
  id: number,
  status: string,
  trackingNumber?: string
): Promise<IdeasoftOrder | null> {
  const domain = process.env.domain || 'https://teknikelkombi.myideasoft.com';

  const body: any = { status };

  if (trackingNumber && (status === 'fulfilled' || status === 'shipped')) {
    body.shippingTrackingCode = trackingNumber;
    body.cargoTrackingUrl = `https://www.suratkargo.com.tr/tr/online-servisler/gonderi-sorgula?code=${trackingNumber}`;
  }

  const response = await fetchWithIdeasoftRetry(`${domain}/admin-api/orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error(`Failed to update order ${id}:`, response.statusText);
    return null;
  }

  return response.json();
}

// ============================================================================
// STOK SİNKRONİZASYONU (Stock Sync)
// ============================================================================

/**
 * SKU'ya göre Ideasoft ürünü bulur.
 */
export async function getIdeasoftProductBySku(sku: string): Promise<IdeasoftProduct | null> {
  const domain = process.env.domain || 'https://teknikelkombi.myideasoft.com';

  try {
    const response = await fetchWithIdeasoftRetry(`${domain}/admin-api/products?s=${encodeURIComponent(sku)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch product by SKU ${sku}:`, response.statusText);
      return null;
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      // Tam eşleşmeyi bul
      const exact = data.find((p: IdeasoftProduct) => p.sku === sku);
      return exact || data[0];
    }
    return null;
  } catch (error) {
    console.error(`Error fetching product by SKU ${sku}:`, error);
    return null;
  }
}

/**
 * Tüm Ideasoft ürünlerini toplu olarak çeker (sayfalı).
 */
export async function getIdeasoftAllProducts(
  limit: number = 100
): Promise<IdeasoftProduct[]> {
  const domain = process.env.domain || 'https://teknikelkombi.myideasoft.com';

  let allProducts: IdeasoftProduct[] = [];
  let page = 1;

  try {
    while (true) {
      const response = await fetchWithIdeasoftRetry(
        `${domain}/admin-api/products?limit=${limit}&page=${page}&sort=-id`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error(`Failed to fetch products page ${page}:`, response.statusText);
        break;
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        allProducts = allProducts.concat(data);

        if (data.length < limit) {
          break;
        }

        page++;
      } else {
        break;
      }
    }

    return allProducts;
  } catch (error) {
    console.error('Error fetching all products:', error);
    return allProducts;
  }
}

/**
 * Ideasoft ürününü günceller (stok ve fiyat).
 */
export async function updateIdeasoftProduct(
  id: number,
  data: {
    stockAmount?: number;
    price1?: number;
    price2?: number;
    price3?: number;
  }
): Promise<IdeasoftProduct | null> {
  const domain = process.env.domain || 'https://teknikelkombi.myideasoft.com';

  try {
    const response = await fetchWithIdeasoftRetry(`${domain}/admin-api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`Failed to update product ${id}:`, response.statusText);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    return null;
  }
}
