"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  FileText, 
  MessageSquare, 
  Newspaper,
  CheckSquare,
  History,
  BarChart,
  Upload,
  User,
  LogOut,
  Globe,
  ChevronDown,
  ChevronRight,
  UserCircle,
  GraduationCap,
  Target,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const MENU_ITEMS = {
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { 
      label: "Manajemen User", 
      icon: Users,
      subItems: [
        { label: "Data Siswa", href: "/admin/users?tab=siswa", icon: UserCircle },
        { label: "Data Guru", href: "/admin/users?tab=guru", icon: GraduationCap },
      ]
    },
    { label: "B'Voice (Semua)", href: "/admin/bvoice", icon: FolderOpen },
    { label: "Program B'Six", href: "/admin/pilar", icon: Target },
    { label: "Fasilitas", href: "/admin/fasilitas", icon: Building2 },
    { label: "SPMB", href: "/admin/spmb", icon: FileText },
    { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
    { label: "Konten/Berita", href: "/admin/konten", icon: Newspaper },
    { label: "Profil", href: "/admin/profil", icon: User },
  ],
  GURU: [
    { label: "Dashboard", href: "/guru", icon: LayoutDashboard },
    { label: "Antrian Validasi", href: "/guru/validasi", icon: CheckSquare },
    { label: "Riwayat Penilaian", href: "/guru/riwayat", icon: History },
    { label: "Rekap Siswa", href: "/guru/rekap", icon: BarChart },
    { label: "Profil", href: "/guru/profil", icon: User },
  ],
  SISWA: [
    { label: "Dashboard", href: "/siswa", icon: LayoutDashboard },
    { label: "Upload Kegiatan", href: "/siswa/upload", icon: Upload },
    { label: "Portofolio Saya", href: "/siswa/portofolio", icon: FolderOpen },
    { label: "Profil", href: "/siswa/profil", icon: User },
  ]
};

export function Sidebar({ user, onMobileItemClick }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  
  const items = MENU_ITEMS[user?.role] || [];
  const [openMenus, setOpenMenus] = useState({ "Manajemen User": true });

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex flex-col h-full w-[240px] bg-slate-900 text-slate-100">
      {/* Logo Area */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain bg-white rounded-md p-1" />
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">BMSF</h1>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">SMP Bina Harapan Jatigede</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map((item) => {
          if (item.subItems) {
            const isOpen = openMenus[item.label];
            const hasActiveSub = item.subItems.some(sub => pathname === sub.href.split('?')[0]);
            const Icon = item.icon;

            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    hasActiveSub ? "text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </div>
                  {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
                {isOpen && (
                  <div className="ml-4 pl-3 border-l border-slate-800 space-y-1">
                    {item.subItems.map((sub) => {
                      const subPath = sub.href.split('?')[0];
                      const subTab = sub.href.split('tab=')[1];
                      const isActive = pathname === subPath && (currentTab === subTab || !currentTab && subTab === "siswa");
                      
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={onMobileItemClick}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                            isActive 
                              ? "bg-blue-600/20 text-blue-400" 
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          )}
                        >
                          <SubIcon className="h-3.5 w-3.5" />
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin" && item.href !== "/guru" && item.href !== "/siswa");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileItemClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <div className="h-px bg-slate-800 my-4" />
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Globe className="h-4 w-4" />
          Halaman Public
        </Link>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-blue-200 bg-blue-900/50 rounded-full uppercase border border-blue-800/50">
              {user?.role}
            </span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
