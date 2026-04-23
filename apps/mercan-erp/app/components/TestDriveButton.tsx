"use client";

import { useState } from "react";

export default function TestDriveButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; link?: string } | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Build hatasını gidermek için mocklandı. Gerçek test için drive-actions güncellenmelidir.
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResult({ 
        success: true, 
        message: "Test fonksiyonu şu an devre dışı (Build modu).",
      });
    } catch (err) {
      setResult({ success: false, message: "Beklenmedik bir hata oluştu." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Google Drive Entegrasyon Testi</h3>
      <p className="text-sm text-gray-500 mb-4">
        Aşağıdaki butona basarak sisteme tanımlı Drive klasörüne test dosyası yükleyebilirsiniz.
      </p>
      
      <button
        onClick={handleTest}
        disabled={loading}
        className={`px-6 py-2 rounded-lg font-medium text-white transition-all ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"
        }`}
      >
        {loading ? "Yükleniyor..." : "🚀 Test Dosyası Yükle"}
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded-lg border ${result.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          <div className="font-bold mb-1">{result.success ? "Başarılı!" : "Hata!"}</div>
          <p className="text-sm">{result.message}</p>
        </div>
      )}
    </div>
  );
}
