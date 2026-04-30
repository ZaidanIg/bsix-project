"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const MENU_ITEMS = {
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Data Siswa & Guru", href: "/admin/users", icon: Users },
    { label: "B'Voice (Semua)", href: "/admin/bvoice", icon: FolderOpen },
    { label: "SPMB", href: "/admin/spmb", icon: FileText },
    { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
    { label: "Konten/Berita", href: "/admin/konten", icon: Newspaper },
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
  const items = MENU_ITEMS[user?.role] || [];

  return (
    <div className="flex flex-col h-full w-[240px] bg-slate-900 text-slate-100">
      {/* Logo Area */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">BMSF</h1>
        <p className="text-xs text-slate-400 mt-1">SMP Bina Harapan Jatigede</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map((item) => {
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
