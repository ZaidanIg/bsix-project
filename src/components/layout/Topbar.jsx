"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Menu, User, CheckCircle, MessageSquare, ClipboardList, Clock } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import toast from "react-hot-toast";

export function Topbar({ user }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch (e) {
      console.error("Failed to fetch notifications");
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (res.ok) {
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (e) {
      toast.error("Gagal memperbarui notifikasi");
    }
  };

  const markAsRead = async (id, link) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      fetchNotifications();
      if (link) window.location.href = link;
    } catch (e) {
      console.error(e);
    }
  };

  // Get initials for avatar
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U";

  const getIcon = (type) => {
    switch (type) {
      case "FEEDBACK": return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "BVOICE": return <ClipboardList className="h-4 w-4 text-green-500" />;
      case "SPMB": return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6">
      {/* Mobile Menu & Greeting */}
      <div className="flex items-center gap-4">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[240px]">
            <div className="sr-only">
              <SheetTitle>Menu Navigasi</SheetTitle>
              <SheetDescription>
                Navigasi aplikasi BMSF
              </SheetDescription>
            </div>
            <Sidebar user={user} onMobileItemClick={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
        <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
          Selamat datang, {user?.name}
        </h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="relative text-slate-600">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-[400px]">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifikasi
                {unreadCount > 0 && (
                  <Button variant="ghost" className="h-auto p-0 text-[11px] text-blue-600 hover:text-blue-700" onClick={markAllRead}>
                    Tandai semua dibaca
                  </Button>
                )}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Tidak ada notifikasi baru
              </div>
            ) : (
              <DropdownMenuGroup>
                {notifications.map((n) => (
                  <DropdownMenuItem 
                    key={n.id} 
                    className={`p-3 cursor-pointer flex gap-3 items-start border-b last:border-0 ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                    onClick={() => markAsRead(n.id, n.link)}
                  >
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1 space-y-1">
                      <p className={`text-xs font-semibold leading-none ${!n.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        {new Date(n.createdAt).toLocaleDateString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.image} alt={user?.name} className="object-cover" />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.nisNik}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = `/${user?.role.toLowerCase()}/profil`}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil Saya</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
