import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth";
import { redirect } from "next/navigation";
import { 
  getPendingRequests, 
  getParentStudents
} from "../../../lib/actions/permission-actions";
import { 
  Card, 
  CardContent 
} from "@ajans/ui";
import { 
  Clock, 
  CheckCircle2, 
  User as UserIcon, 
  Calendar, 
  FileText,
  GraduationCap,
  Heart,
  Bell,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Coffee,
  Moon,
  Sun
} from "lucide-react";
import { CreatePermissionModal } from "../../../components/CreatePermissionModal";
import { PermissionActionButtons } from "../../../components/PermissionActionButtons";
import { AiInsight } from "../../../components/AiInsight";

export default async function DashboardPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !session.user) redirect("/login");

  const user = session.user;
  
  // ROLE MAPPING: USER -> PARENT, ADMIN/TEACHER/EXPERT -> STAFF
  const isParent = user.role === "USER";
  const isAdminOrTeacher = ["ADMIN", "TEACHER", "EXPERT"].includes(user.role);

  // Dinamik Karşılama Mantığı
  const hour = new Date().getHours();
  const greeting = hour < 6 ? "İyi Geceler" : hour < 12 ? "Günaydın" : hour < 18 ? "Tünaydın" : "İyi Akşamlar";
  const Icon = hour < 6 ? Moon : hour < 12 ? Coffee : hour < 18 ? Sun : Moon;
  
  const bannerGradient = hour < 6 
    ? "from-slate-900 via-indigo-950 to-slate-900" 
    : hour < 12 
      ? "from-amber-400 via-orange-500 to-rose-500" 
      : hour < 18 
        ? "from-indigo-500 via-blue-600 to-indigo-700" 
        : "from-indigo-900 via-slate-900 to-black";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20">
      {/* FLOATING TOP NAVIGATION */}
      <div className="sticky top-6 z-50 px-6">
        <nav className="max-w-7xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-[2rem] px-8 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                <GraduationCap className="text-white" size={20} />
             </div>
             <div className="hidden md:block">
                <span className="text-sm font-black tracking-tight text-slate-800 dark:text-white uppercase">OKUL <span className="text-indigo-500">ERP</span></span>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Akıllı İzin Sistemi</div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors relative">
               <Bell size={18} className="text-slate-500" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-slate-800">
               <div className="text-right hidden sm:block">
                  <div className="text-[10px] font-black text-slate-800 dark:text-white uppercase leading-none">{user.name}</div>
                  <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1">{isParent ? 'VELİ' : 'GÖREVLİ'}</div>
               </div>
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-lg">
                  <UserIcon size={18} className="text-white" />
               </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-12 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* DİNAMİK HERO BANNER */}
        <div className={`relative group overflow-hidden bg-gradient-to-br ${bannerGradient} rounded-[3rem] p-12 text-white shadow-2xl transition-all duration-1000`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
             <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                   <Icon size={14} className="text-amber-300" /> {greeting}
                </div>
                <h1 className="text-5xl font-black tracking-tighter leading-none">
                   {greeting}, <br />
                   <span className="text-white/90">{user.name.split(' ')[0]} Bey</span> ✨
                </h1>
                <p className="text-white/80 font-medium max-w-sm text-sm">
                   Bugün okulda her şey kontrol altında. {isParent ? "Çocuklarınızın izin süreçlerini buradan yönetebilirsiniz." : "Bekleyen talepleri hızlıca onaylayabilirsiniz."}
                </p>
             </div>
             <div className="hidden md:flex justify-end gap-4">
                <div className="p-8 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/10 text-center min-w-[140px]">
                   <div className="text-4xl font-black mb-1">08</div>
                   <div className="text-[9px] font-bold uppercase tracking-widest opacity-70">Bekleyen</div>
                </div>
                <div className="p-8 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/10 text-center min-w-[140px] mt-8">
                   <div className="text-4xl font-black mb-1">12</div>
                   <div className="text-[9px] font-bold uppercase tracking-widest opacity-70">Onaylanan</div>
                </div>
             </div>
          </div>
        </div>

        {/* AI ASİSTAN ALANI */}
        <div className="max-w-3xl mx-auto">
           <AiInsight />
        </div>

        {isParent && <ParentDashboardView />}
        {isAdminOrTeacher && <AdminDashboardView />}
      </div>
    </div>
  );
}

async function ParentDashboardView() {
  const res = await getParentStudents();
  const students = res.success ? res.data : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center">
              <Heart className="text-rose-500" fill="#f43f5e" size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Çocuklarım</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Okul Durum ve İzin Yönetimi</p>
           </div>
        </div>
        <CreatePermissionModal students={students} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {students.map((student: any, i: number) => (
          <Card key={student.id} className="border-none bg-white dark:bg-slate-900 rounded-[3rem] hover:shadow-2xl transition-all duration-500 group overflow-hidden">
            <CardContent className="p-10 space-y-8">
              <div className="flex items-start justify-between">
                 <div className="relative">
                    <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-3xl font-black border-4 border-white dark:border-slate-800 shadow-2xl ${['bg-indigo-100 text-indigo-600', 'bg-orange-100 text-orange-600', 'bg-teal-100 text-teal-600'][i % 3]}`}>
                       {student.firstName[0]}
                    </div>
                    {/* Okulda/İzinli Badge */}
                    <div className="absolute -bottom-2 -right-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-50 dark:border-slate-700 flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full animate-pulse ${i % 2 === 0 ? 'bg-teal-500' : 'bg-orange-500'}`} />
                       <span className="text-[9px] font-black uppercase tracking-widest">{i % 2 === 0 ? 'OKULDA' : 'İZİNLİ'}</span>
                    </div>
                 </div>
                 <button className="w-10 h-10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                    <MoreVertical size={20} className="text-slate-300" />
                 </button>
              </div>
              
              <div className="pt-4">
                 <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">{student.firstName} {student.lastName}</h3>
                 <div className="flex items-center gap-3 mt-3">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[9px] font-black border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-widest">
                       {student.classroom?.name || "10-A"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">NO: {student.studentNumber}</span>
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Son İzin: 12 Nis</span>
                 </div>
                 <button className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-widest flex items-center gap-1 group/btn">
                    Detaylar <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                 </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function AdminDashboardView() {
  const res = await getPendingRequests();
  const requests = res.success ? res.data : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-[1.5rem] flex items-center justify-center">
              <Sparkles className="text-orange-600" size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Hızlı Onay Merkezi</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bekleyen izin taleplerini yönetin.</p>
           </div>
        </div>
        <div className="px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3">
           <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{requests.length} YENİ TALEP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {requests.map((req: any) => (
          <Card key={req.id} className="border-none bg-white dark:bg-slate-900 rounded-[3rem] hover:shadow-2xl transition-all duration-500 group overflow-hidden border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50">
            <CardContent className="p-10 space-y-8">
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                     <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] flex items-center justify-center text-3xl font-black text-slate-400 border border-white dark:border-slate-700 shadow-inner">
                        {req.student.firstName[0]}
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-tight">{req.student.firstName} {req.student.lastName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <UserIcon size={12} className="text-slate-400" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Veli: {req.requestedBy.name}</span>
                        </div>
                     </div>
                  </div>
                  <div className="px-5 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                     <FileText size={14} />
                     {req.type}
                  </div>
               </div>

               <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100/50 dark:border-slate-800/50 relative overflow-hidden group/box">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/box:rotate-12 transition-transform">
                     <FileText size={48} />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                     <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em]">Gerekçe Özeti</span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 italic line-clamp-2 leading-relaxed">
                     "{req.reason}"
                  </p>
               </div>

               <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3 text-slate-400 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full">
                     <Calendar size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest">{new Date(req.date).toLocaleDateString("tr-TR")}</span>
                  </div>
                  
                  <PermissionActionButtons requestId={req.id} />
               </div>
            </CardContent>
          </Card>
        ))}
        {requests.length === 0 && (
           <div className="col-span-full py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
              <div className="w-24 h-24 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <CheckCircle2 size={48} className="text-teal-500" />
              </div>
              <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Harika Haber!</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Bekleyen hiçbir izin talebi bulunmuyor.</p>
           </div>
        )}
      </div>
    </div>
  );
}
