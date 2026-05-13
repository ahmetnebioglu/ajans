/**
 * Sipariş yazdırma utility fonksiyonu
 * Hem sipariş listeleme hem de detay sayfasında kullanılır
 */

interface OrderItem {
  productName: string;
  productSku: string;
  productQuantity: number;
  productPrice: number;
  productDiscount?: number;
  productMoneyOrderDiscount?: number;
}

interface ShippingAddress {
  firstname: string;
  surname: string;
  address: string;
  subLocation: string;
  location: string;
  mobilePhoneNumber: string;
}

interface BillingAddress {
  firstname: string;
  surname: string;
  address: string;
  subLocation: string;
  location: string;
  mobilePhoneNumber: string;
}

interface Order {
  id: number;
  createdAt: string;
  updatedAt: string;
  customerFirstname: string;
  customerSurname: string;
  customerPhone?: string;
  status: string;
  finalAmount: number;
  paymentTypeName: string;
  paymentProviderName?: string;
  shippingCompanyName?: string;
  memberGroupName?: string;
  installment?: number;
  installmentRate?: number;
  amount: number;
  taxAmount: number;
  shippingAmount: number;
  couponDiscount?: number;
  promotionDiscount?: number;
  generalAmount?: number;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
}

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(price);
};

const calculateMoneyOrderDiscount = (order: Order): number => {
  if (!order?.orderItems || order.orderItems.length === 0) return 0;

  return order.orderItems.reduce((total, item) => {
    return (
      total +
      ((item.productMoneyOrderDiscount || 0) * (item.productQuantity || 1))
    );
  }, 0);
};

const getStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    new: 'Yeni Sipariş',
    waiting_for_approval: 'Onay bekliyor',
    pending: 'Beklemede',
    waiting_for_payment: 'Ödeme Bekleniyor',
    being_prepared: 'Hazırlanıyor',
    on_accumulation: 'Tedarik Sürecinde',
    shipped: 'Kargoda',
    fulfilled: 'Kargoya Verildi',
    approved: 'Onaylandı',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi',
  };
  return labels[status] || status;
};

/**
 * Sipariş yazdırma fonksiyonu
 * @param {Order} order - Sipariş verisi
 * @param {string} pageFormat - Sayfa formatı ('A4' veya 'A5')
 */
export const printOrder = (order: Order, pageFormat: 'A4' | 'A5' = 'A5'): void => {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert(
      'Yazdırma işlemi için lütfen tarayıcınızın popup engelleyicisini kapatın.'
    );
    return;
  }

  printWindow.document.write('<html><head><title>Sipariş Detayı</title>');
  printWindow.document.write('<style>');
  printWindow.document.write(`
    @page {
      size: ${pageFormat};
      margin: ${pageFormat === 'A4' ? '15mm' : '10mm'};
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      font-size: ${pageFormat === 'A4' ? '11pt' : '10pt'};
      width: ${pageFormat === 'A4' ? '210mm' : '148mm'};
      height: ${pageFormat === 'A4' ? '297mm' : '210mm'};
      color: #000;
    }
    .print-header {
      text-align: center;
      margin-bottom: ${pageFormat === 'A4' ? '10mm' : '8mm'};
    }
    .print-header h2 {
      font-size: ${pageFormat === 'A4' ? '16pt' : '14pt'};
      margin: 0 0 2mm 0;
      color: #000;
    }
    .print-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: ${pageFormat === 'A4' ? '10mm' : '8mm'};
    }
    .print-info-col {
      width: 48%;
    }
    .print-info p {
      margin: 1mm 0;
      font-size: ${pageFormat === 'A4' ? '10pt' : '9pt'};
      color: #000;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: ${pageFormat === 'A4' ? '10pt' : '9pt'};
    }
    th, td {
      border: 0.7pt solid #000;
      padding: ${pageFormat === 'A4' ? '3mm' : '2mm'};
      text-align: left;
      color: #000;
      line-height: 1.5;
    }
    th {
      background-color: #fff;
      font-weight: bold;
      font-size: ${pageFormat === 'A4' ? '10pt' : '9pt'};
    }
    .address-container {
      display: flex;
      justify-content: space-between;
      margin-top: ${pageFormat === 'A4' ? '10mm' : '8mm'};
      font-size: ${pageFormat === 'A4' ? '10pt' : '9pt'};
    }
    .address-box {
      width: 48%;
      padding: ${pageFormat === 'A4' ? '3mm' : '2mm'};
      border: 0.5pt solid #000;
    }
    .address-box h4 {
      margin: 0 0 2mm 0;
      font-size: ${pageFormat === 'A4' ? '11pt' : '10pt'};
      color: #000;
    }
    .address-box p {
      margin: 0;
      font-size: ${pageFormat === 'A4' ? '10pt' : '9pt'};
      color: #000;
    }
    .footer {
      margin-top: ${pageFormat === 'A4' ? '10mm' : '8mm'};
      text-align: center;
      font-size: ${pageFormat === 'A4' ? '9pt' : '8pt'};
      color: #000;
    }
    .total-row {
      font-weight: bold;
    }
    small {
      font-size: ${pageFormat === 'A4' ? '9pt' : '8pt'};
      color: #000;
    }
  `);
  printWindow.document.write('</style></head><body>');

  // Yazdırma içeriğini oluşturma
  printWindow.document.write(`
    <div class="print-header">
      <h2>Sipariş Detayları</h2>
    </div>
    
    <div class="print-info">
      <div class="print-info-col">
        <p><strong>Sipariş No:</strong> ${order.id}</p>
        <p><strong>Sipariş Tarihi:</strong> ${formatDate(order.createdAt)}</p>
        <p><strong>Müşteri:</strong> ${order.customerFirstname} ${
    order.customerSurname
  }</p>
        <p><strong>Telefon:</strong> ${order.customerPhone || '-'}</p>
      </div>
      <div class="print-info-col" style="text-align: left;">
        <p><strong>Durum:</strong> ${getStatusLabel(order.status)}</p>
        <p><strong>Toplam Tutar:</strong> ${formatPrice(order.finalAmount)}</p>
        <p><strong>Ödeme Türü:</strong> ${order.paymentTypeName}</p>
        ${
          order.paymentTypeName === 'Kredi Kartı' &&
          order.installment &&
          order.installment > 1
            ? `<p><strong>Taksit:</strong> ${order.installment} taksit${
                order.installmentRate && order.installmentRate > 1
                  ? ` (Oran: %${((order.installmentRate - 1) * 100).toFixed(
                      2
                    )})`
                  : ''
              }</p>`
            : ''
        }
        <p><strong>Kargo:</strong> ${order.shippingCompanyName || '-'}</p>
        <p><strong>Müşteri Grubu:</strong> ${order.memberGroupName || '-'}</p>
      </div>
    </div>
    
    <h3 style="font-size: ${
      pageFormat === 'A4' ? '11pt' : '10pt'
    }; margin: 3mm 0;">Sipariş Ürünleri</h3>
    <table>
      <thead>
        <tr>
          <th width="45%">Ürün</th>
          <th style="text-align: right;" width="15%">Adet</th>
          <th style="text-align: right;" width="20%">Birim Fiyat</th>
          <th style="text-align: right;" width="20%">Toplam</th>
        </tr>
      </thead>
      <tbody>
        ${order.orderItems
          .map(
            (item) => `
          <tr>
            <td>
              ${item.productName}<br>
              <small>SKU: ${item.productSku}</small>
            </td>
            <td style="text-align: right;">${item.productQuantity}</td>
            <td style="text-align: right;">
              ${
                item.productDiscount && item.productDiscount > 0
                  ? `<span style="text-decoration: line-through; color: #999; font-size: 0.85em;">${formatPrice(
                      item.productPrice
                    )}</span><br><span style="color: #000; font-weight: 600;">${formatPrice(
                      item.productPrice - item.productDiscount
                    )}</span>`
                  : item.productMoneyOrderDiscount && item.productMoneyOrderDiscount > 0
                  ? `<span style="text-decoration: line-through; color: #999; font-size: 0.85em;">${formatPrice(
                      item.productPrice
                    )}</span><br><span style="color: #000; font-weight: 600;">${formatPrice(
                      item.productPrice - item.productMoneyOrderDiscount
                    )}</span>`
                  : formatPrice(item.productPrice)
              }
            </td>
            <td style="text-align: right;">
              ${
                item.productDiscount && item.productDiscount > 0
                  ? `<span style="text-decoration: line-through; color: #999; font-size: 0.85em;">${formatPrice(
                      item.productPrice * item.productQuantity
                    )}</span><br><span style="color: #000; font-weight: 600;">${formatPrice(
                      (item.productPrice - item.productDiscount) *
                        item.productQuantity
                    )}</span>`
                  : item.productMoneyOrderDiscount && item.productMoneyOrderDiscount > 0
                  ? `<span style="text-decoration: line-through; color: #999; font-size: 0.85em;">${formatPrice(
                      item.productPrice * item.productQuantity
                    )}</span><br><span style="color: #000; font-weight: 600;">${formatPrice(
                      (item.productPrice - item.productMoneyOrderDiscount) *
                        item.productQuantity
                    )}</span>`
                  : formatPrice(item.productPrice * item.productQuantity)
              }
            </td>
          </tr>
        `
          )
          .join('')}
        ${(() => {
          const moneyOrderDiscount = calculateMoneyOrderDiscount(order);
          return moneyOrderDiscount > 0
            ? `
        <tr>
          <td colspan="2"></td>
          <td style="text-align: right;"><strong>Havale İndirimi:</strong></td>
          <td style="text-align: right; color: #000;">-${formatPrice(
            moneyOrderDiscount
          )}</td>
        </tr>`
            : '';
        })()}
        <tr>
          <td colspan="2"></td>
          <td style="text-align: right;"><strong>Ara Toplam:</strong></td>
          <td style="text-align: right;">${formatPrice(order.amount)}</td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td style="text-align: right;"><strong>KDV:</strong></td>
          <td style="text-align: right;">${formatPrice(order.taxAmount)}</td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td style="text-align: right;"><strong>Kargo:</strong></td>
          <td style="text-align: right;">${formatPrice(
            order.shippingAmount
          )}</td>
        </tr>
        ${
          order.couponDiscount && order.couponDiscount > 0
            ? `
        <tr>
          <td colspan="2"></td>
          <td style="text-align: right;"><strong>Kupon İndirimi:</strong></td>
          <td style="text-align: right; color: #000;">-${formatPrice(
            order.couponDiscount
          )}</td>
        </tr>`
            : ''
        }
        ${
          order.promotionDiscount && order.promotionDiscount > 0
            ? `
        <tr>
          <td colspan="2"></td>
          <td style="text-align: right;"><strong>Kampanya İndirimi:</strong></td>
          <td style="text-align: right; color: #000;">-${formatPrice(
            order.promotionDiscount
          )}</td>
        </tr>`
            : ''
        }
        ${
          order.paymentTypeName === 'Kredi Kartı' &&
          order.installment &&
          order.installment > 1
            ? `
        <tr>
          <td colspan="2"></td>
          <td style="text-align: right;"><strong>Genel Toplam:</strong></td>
          <td style="text-align: right;">${formatPrice(
            order.generalAmount || order.finalAmount
          )}</td>
        </tr>
        ${
          order.finalAmount !== (order.generalAmount || order.finalAmount)
            ? `
        <tr>
          <td colspan="2"></td>
          <td style="text-align: right;"><strong>Taksit Farkı <br /> (${
            order.installment
          } taksit${
                order.installmentRate && order.installmentRate > 1
                  ? ` <br /> Oran: %${(
                      (order.installmentRate - 1) *
                      100
                    ).toFixed(2)}`
                  : ''
              }):</strong></td>
          <td style="text-align: right; color: #000;">${formatPrice(
            order.finalAmount - (order.generalAmount || order.finalAmount)
          )}</td>
        </tr>`
            : ''
        }
        <tr class="total-row">
          <td colspan="2"></td>
          <td style="text-align: right;"><strong>Son Toplam:</strong></td>
          <td style="text-align: right;"><strong>${formatPrice(
            order.finalAmount
          )}</strong></td>
        </tr>`
            : `
        <tr class="total-row">
          <td colspan="2"></td>
          <td style="text-align: right;"><strong>Genel Toplam:</strong></td>
          <td style="text-align: right;"><strong>${formatPrice(
            order.finalAmount
          )}</strong></td>
        </tr>`
        }
      </tbody>
    </table>
    
    <div class="address-container">
      <div class="address-box">
        <h4>Teslimat Adresi</h4>
        <p>
          ${order.shippingAddress.firstname} ${
    order.shippingAddress.surname
  }<br>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.subLocation} / ${
    order.shippingAddress.location
  }<br>
          ${order.shippingAddress.mobilePhoneNumber}
        </p>
      </div>
      
      <div class="address-box">
        <h4>Fatura Adresi</h4>
        <p>
          ${order.billingAddress.firstname} ${order.billingAddress.surname}<br>
          ${order.billingAddress.address}<br>
          ${order.billingAddress.subLocation} / ${
    order.billingAddress.location
  }<br>
          ${order.billingAddress.mobilePhoneNumber}
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p>Bu belge ${formatDate(new Date().toISOString())} tarihinde oluşturulmuştur.</p>
      <p>Teknikel Kombi Yedek Parça © 2025</p>
    </div>
  `);

  printWindow.document.write('</body></html>');
  printWindow.document.close();

  // Yazdırma işlemi için kısa bir bekleme
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};
