export default function MailPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mail/Workspace Yönetimi</h1>
      <p className="text-muted-foreground mb-6">50 personel için Google Workspace hesap yönetimi.</p>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Ad Soyad</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Durum</th>
              <th className="px-6 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-6 py-4 font-medium">Ahmet Yılmaz</td>
              <td className="px-6 py-4">ahmet@mercan.com.ts</td>
              <td className="px-6 py-4">Aktif</td>
              <td className="px-6 py-4 text-right">
                <button className="text-blue-600 hover:underline">Şifre Sıfırla</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
