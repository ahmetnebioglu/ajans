import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth/options";
import { redirect } from "next/navigation";
import { 
  getPendingRequests, 
  getParentStudents, 
  updatePermissionStatus 
} from "../../lib/actions/permission-actions";
import { 
  Button, 
  Card, 
  CardHeader, 
  CardContent 
} from "@ajans/ui";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User as UserIcon, 
  Calendar, 
  FileText,
  PlusCircle,
  GraduationCap,
  ShieldCheck
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const user = session.user as { id: string; role: string; name: string };
  const isParent = user.role === "USER"; // Varsayılan USER rolünü Veli olarak kabul ediyoruz
  const isAdminOrTeacher = user.role === "ADMIN" || user.role === "TEACHER" || user.role === "EXPERT";

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* WELCOME BANNER */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-600">
          <GraduationCap size={200} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                <ShieldCheck className="text-white" size={24} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Okul ERP // Güvenli İzin Sistemi</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
            Hoş Geldiniz, <br />
            <span className="text-blue-600">{user.name || "Kullanıcı"}</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] max-w-md italic">
            Öğrenci izin ve mutabakat süreçlerini buradan yönetebilirsiniz.
          </p>
        </div>
      </div>

      {isParent && <ParentDashboardView />}
      {isAdminOrTeacher && <AdminDashboardView />}
      
      {!isParent && !isAdminOrTeacher && (
        <div className="p-20 text-center text-slate-400 italic font-bold uppercase tracking-widest text-[10px]">
           Görüntülenecek veri bulunamadı.
        </div>
      )}
    </div>
  );
}

async function ParentDashboardView() {
  const { students = [] } = await getParentStudents();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] italic flex items-center gap-3">
          <UserIcon className="text-blue-600" size={20} /> Çocuklarım
        </h2>
        <Button size="sm" className="gap-2">
          <PlusCircle size={14} /> Yeni İzin Talebi
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student: any) => (
          <Card key={student.id} className="hover:scale-[1.02] transition-transform cursor-pointer group">
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <UserIcon size={32} />
                </div>
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tighter italic">{student.firstName} {student.lastName}</h3>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{student.classroom?.name || "Sınıf Bilgisi Yok"}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Öğrenci No: {student.studentNumber}</span>
                 <Button variant="ghost" size="sm" className="px-0 h-auto">Geçmiş →</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {students.length === 0 && (
          <div className="col-span-full p-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Sisteme kayıtlı çocuğunuz bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}

async function AdminDashboardView() {
  const { requests = [] } = await getPendingRequests();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] italic flex items-center gap-3">
          <Clock className="text-amber-500" size={20} /> Onay Bekleyen Talepler
        </h2>
        <span className="px-4 py-2 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/10">
          {requests.length} TALEP BEKLİYOR
        </span>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Öğrenci & Veli</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Tür & Tarih</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Gerekçe</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 italic text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {requests.map((req: any) => (
                <tr key={req.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <div className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight">{req.student.firstName} {req.student.lastName}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase mt-1 italic">Veli: {req.requestedBy.name}</div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <FileText size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{req.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={12} />
                      <span className="text-[10px] font-bold uppercase italic">{new Date(req.date).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-[11px] text-slate-500 font-medium italic max-w-xs truncate">{req.reason}</p>
                  </td>
                  <td className="p-6 text-right space-x-2">
                    <form action={async () => {
                      "use server";
                      await updatePermissionStatus(req.id, "REJECTED");
                    }} className="inline">
                      <Button variant="danger" size="sm" className="h-9 w-9 p-0 rounded-lg">
                        <XCircle size={16} />
                      </Button>
                    </form>
                    <form action={async () => {
                      "use server";
                      await updatePermissionStatus(req.id, "APPROVED");
                    }} className="inline">
                      <Button variant="primary" size="sm" className="h-9 w-9 p-0 rounded-lg">
                        <CheckCircle2 size={16} />
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-slate-300 font-black uppercase tracking-widest italic">Bekleyen talep bulunmuyor.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
