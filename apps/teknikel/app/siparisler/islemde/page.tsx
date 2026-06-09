import OrdersByPaymentStatus from "../OrdersByPaymentStatus";

export default function IslemdeSiparislerPage() {
  return (
    <OrdersByPaymentStatus
      title="İşlemdeki Siparişler"
      params={{
        paymentProviderCode: "Iyzico",
        paymentStatus: "in_transaction",
      }}
    />
  );
}
