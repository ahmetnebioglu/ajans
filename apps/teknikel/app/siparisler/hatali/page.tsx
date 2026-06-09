import OrdersByPaymentStatus from "../OrdersByPaymentStatus";

export default function HataliSiparislerPage() {
  return (
    <OrdersByPaymentStatus
      title="Hatalı Siparişler"
      params={{
        paymentProviderCode: "Iyzico",
        paymentStatus: "failed",
      }}
    />
  );
}
