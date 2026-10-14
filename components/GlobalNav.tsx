"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PawPrint, Users, BookOpen, LogOut } from "lucide-react";

function NavContent() {
  const pathname = usePathname();

  // Ocultar navegación en rutas de autenticación o checkout puro
  if (pathname.includes("/login") || pathname.includes("/register") || pathname.includes("/store")) {
    return null;
  }

  const navItems = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Mis Mascotas", href: "/dashboard", icon: PawPrint },
    { name: "Comunidad", href: "/ecosystem/adoptions", icon: Users },
    { name: "Directorio", href: "/ecosystem/directory", icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile: Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? "text-petgreen" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "fill-petgreen/20" : ""}`} />
                <span className="text-[10px] font-bold tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: Top Header / Escape Limpio */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 h-16 items-center px-8 shadow-sm justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black text-petblue tracking-tight">
            HuellaDigital
          </Link>
          <div className="flex items-center gap-6">
            {navItems.slice(1).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-bold transition-colors ${
                    isActive ? "text-petgreen" : "text-slate-500 hover:text-petblue"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center">
           {/* Escape Limpio: Sale al portal público sin cerrar sesión */}
           <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-petblue transition-colors bg-slate-50 px-4 py-2 rounded-xl">
             <LogOut className="w-4 h-4" />
             <span>Portal Público</span>
           </Link>
        </div>
      </nav>
      
      {/* Spacer para que el contenido no quede oculto bajo el nav fijo superior (solo visible en Desktop) */}
      <div className="hidden md:block h-16" />
    </>
  );
}

export function GlobalNav() {
  return (
    <Suspense fallback={null}>
      <NavContent />
    </Suspense>
  );
}