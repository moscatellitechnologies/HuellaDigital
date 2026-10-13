import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, RoleSwitcherGlobal } from "./context/AuthContext";
import { GlobalNav } from "@/components/GlobalNav";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HuellaDigital",
  description: "Ecosistema de Mascotas - Misiones",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <GlobalNav />
          {children}
          {/* Envoltura Suspense requerida por Next.js para aislar hooks de rutas dinámicas */}
          <Suspense fallback={null}>
            <RoleSwitcherGlobal />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}