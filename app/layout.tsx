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
  metadataBase: new URL("https://huelladigital.com"),
  title: {
    default: "HuellaDigital • Identificación Inteligente de Mascotas en Misiones",
    template: "%s | HuellaDigital Misiones",
  },
  description: "Ecosistema Digital Regional de Identificación NFC/QR, Historia Clínica Digital y Red Comunitaria de Adopciones en Misiones, Argentina.",
  keywords: ["Mascotas Misiones", "NFC Mascotas Posadas", "Identificación Canina Misiones", "Veterinarios Misiones", "HuellaDigital"],
  openGraph: {
    title: "HuellaDigital • Identificación Inteligente de Mascotas en Misiones",
    description: "Conectando el cuidado de tus mascotas con tecnología NFC, historia clínica e identificación instantánea.",
    url: "https://huelladigital.com",
    siteName: "HuellaDigital Misiones",
    images: [
      {
        url: "/logo-huella.png",
        width: 1200,
        height: 630,
        alt: "HuellaDigital Misiones",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HuellaDigital • Identificación Inteligente de Mascotas",
    description: "Ecosistema Digital de Mascotas en Misiones, Argentina.",
    images: ["/logo-huella.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
          <Suspense fallback={null}>
            <RoleSwitcherGlobal />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}