"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sprout } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/program-bsix", label: "Program B'Six" },
    { href: "/galeri", label: "Galeri" },
    { href: "/pendidik", label: "Guru" },
    { href: "/berita", label: "Berita" },
    { href: "/spmb", label: "SPMB" },
    { href: "/kontak", label: "Kontak" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-lg">
              <img src="/logo.png" alt="Logo BMSF" className="h-8 w-8 object-contain" />
            </div>
            <Link href="/" className="flex flex-col">
              <span className="font-bold text-xl leading-tight text-slate-900 tracking-tight">BMSF</span>
              <span className="text-[10px] text-slate-500 font-medium leading-none tracking-wider">SMP BINA HARAPAN JATIGEDE</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:gap-x-6 lg:gap-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-green-600 ${
                  pathname === link.href ? "text-green-600 font-bold" : "text-slate-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 ml-4 rounded-full px-6">Masuk</Button>
            </Link>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger render={
                <Button variant="ghost" size="icon" className="text-slate-600">
                  <Menu className="h-6 w-6" />
                </Button>
              } />
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="sr-only">Menu Navigasi Mobile</div>
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg font-medium p-2 rounded-md ${
                        pathname === link.href ? "text-green-600 bg-green-50" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="h-px bg-slate-200 my-4" />
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Masuk ke Dashboard</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
