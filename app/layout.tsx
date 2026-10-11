import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import dynamic from "next/dynamic";

// IMPORTACIÓN DINÁMICA: Apagamos el Server-Side Rendering (SSR) específicamente para este componente
const RoleSwitcherGlobal = dynamic(
  () => import("./context/AuthContext").then((mod) => mod.RoleSwitcherGlobal),
  { ssr: false }
);

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
          {children}
          {/* Al tener ssr: false, Vercel saltará este componente en la compilación y no habrá error */}
          <RoleSwitcherGlobal />
        </AuthProvider>
      </body>
    </html>
  );
}