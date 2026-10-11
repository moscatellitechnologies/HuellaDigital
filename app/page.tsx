"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  QrCode, 
  Stethoscope, 
  HeartHandshake, 
  Building2, 
  ArrowRight, 
  PawPrint, 
  Menu, 
  X,
  ExternalLink
} from "lucide-react";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-petlight flex flex-col justify-between selection:bg-petgreen selection:text-white">
      
      {/* Barra de Navegación Global Superior */}
      <header className="sticky top-0 z-50 bg-petblue/95 backdrop-blur-md text-white border-b border-white/10 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex justify-between items-center">
          
          {/* Logo e Isotipo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-petgreen rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-lg block text-white leading-none">
                Huella<span className="text-petgreen">Digital</span>
              </span>
              <span className="text-[10px] text-slate-300 font-mono tracking-widest uppercase">Misiones, Arg</span>
            </div>
          </a>

          {/* Enlaces de Navegación (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-200">
            <a href="/" className="hover:text-petgreen transition-colors">Inicio</a>
            <a href="/activate" className="hover:text-petgreen transition-colors">Activar Tarjeta</a>
            <a href="/ecosystem/adoptions" className="hover:text-petgreen transition-colors">Adopciones y Extravíos</a>
            <a href="/ecosystem/directory" className="hover:text-petgreen transition-colors">Directorio de Servicios</a>
          </nav>

          {/* CTAs de Acceso a Paneles (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/dashboard"
              className="flex items-center justify-center min-h-[44px] gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-3.5 rounded-xl border border-white/10 transition-all cursor-pointer"
            >
              <span>Panel Tutor</span>
            </a>
            <a
              href="/vet/login"
              className="flex items-center justify-center min-h-[44px] gap-1.5 bg-petgreen hover:bg-emerald-600 text-white text-xs font-bold py-2 px-4 rounded-xl shadow transition-all cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Portal Veterinario</span>
            </a>
          </div>

          {/* Botón Menú Móvil */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-200 hover:text-white p-1 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú Desplegable Móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-petblue border-t border-white/10 px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
            <a href="/" className="block text-xs font-bold text-slate-200 hover:text-petgreen py-2.5 border-b border-white/5">Inicio</a>
            <a href="/activate" className="block text-xs font-bold text-slate-200 hover:text-petgreen py-2.5 border-b border-white/5">Activar Tarjeta NFC</a>
            <a href="/ecosystem/adoptions" className="block text-xs font-bold text-slate-200 hover:text-petgreen py-2.5 border-b border-white/5">Adopciones y Extravíos</a>
            <a href="/ecosystem/directory" className="block text-xs font-bold text-slate-200 hover:text-petgreen py-2.5 border-b border-white/5">Directorio de Servicios</a>
            <div className="pt-4 flex flex-col gap-3">
              <a href="/dashboard" className="w-full flex items-center justify-center min-h-[44px] bg-white/10 text-white text-xs font-bold py-2.5 rounded-xl border border-white/10">Panel del Tutor</a>
              <a href="/vet/login" className="w-full flex items-center justify-center min-h-[44px] bg-petgreen text-white text-xs font-bold py-2.5 rounded-xl shadow">Portal Veterinario</a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-petblue text-white py-20 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide text-petgreen border border-white/10 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-petgreen" />
            <span>Ecosistema Inteligente de Identificación en Misiones</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Conectando el cuidado de <span className="text-petgreen">tus mascotas</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Identificación NFC instantánea, historial clínico digital inmutable y una red comunitaria unificada para proteger a perros, gatos y animales en toda la provincia de Misiones.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
            <a
              href="/activate"
              className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 bg-petgreen hover:bg-emerald-600 text-white font-bold py-3.5 px-7 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all active:scale-[0.98] text-sm cursor-pointer"
            >
              <span>Activar mi Tarjeta NFC</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/vet/login"
              className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 px-7 rounded-2xl border border-white/20 transition-all active:scale-[0.98] text-sm cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-petgreen" />
              <span>Soy Veterinario / Ingresar</span>
            </a>
          </div>
        </div>
      </section>

      {/* Características Clave */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-petlight flex items-center justify-center text-petblue border border-slate-200">
              <QrCode className="w-6 h-6 text-petgreen" />
            </div>
            <h3 className="text-lg font-bold text-petblue">Identificación Instantánea</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Escaneo NFC y QR ultra rápido sin necesidad de descargar aplicaciones pesadas. Contacto inmediato con el tutor en caso de extravío.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-petlight flex items-center justify-center text-petblue border border-slate-200">
              <Stethoscope className="w-6 h-6 text-petgreen" />
            </div>
            <h3 className="text-lg font-bold text-petblue">Historia Clínica Segura</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Resguardo profesional de vacunas, diagnósticos y biometría, solo accesible y editable por veterinarios matriculados en Misiones.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-petlight flex items-center justify-center text-petblue border border-slate-200">
              <HeartHandshake className="w-6 h-6 text-petgreen" />
            </div>
            <h3 className="text-lg font-bold text-petblue">Comunidad Misionera</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Adopciones, reportes de mascotas perdidas y un directorio geolocalizado unificado en Posadas, Oberá y toda la provincia.
            </p>
          </div>

        </div>
      </section>

      {/* Acceso Rápido a Secciones */}
      <section className="max-w-6xl mx-auto px-4 mb-20 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-petblue">Explora el Ecosistema</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Accede de forma directa a los módulos operativos de HuellaDigital.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <a
            href="/dashboard"
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-petgreen/50 hover:shadow-md transition-all group flex flex-col justify-between space-y-4 cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-petlight flex items-center justify-center text-petblue mb-3 group-hover:bg-petgreen group-hover:text-white transition-colors">
                <PawPrint className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-petblue">Panel de Dueño</h3>
              <p className="text-xs text-slate-500 mt-1">Gestiona tus mascotas vinculadas y revisa tu libreta sanitaria.</p>
            </div>
            <span className="text-xs font-bold text-petgreen flex items-center gap-1">
              <span>Ingresar al Panel</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>

          <a
            href="/ecosystem/adoptions"
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-petgreen/50 hover:shadow-md transition-all group flex flex-col justify-between space-y-4 cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-petlight flex items-center justify-center text-petblue mb-3 group-hover:bg-petgreen group-hover:text-white transition-colors">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-petblue">Red de Adopciones</h3>
              <p className="text-xs text-slate-500 mt-1">Busca mascotas en adopción o reporta animales extraviados.</p>
            </div>
            <span className="text-xs font-bold text-petgreen flex items-center gap-1">
              <span>Ver Comunidad</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>

          <a
            href="/ecosystem/directory"
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-petgreen/50 hover:shadow-md transition-all group flex flex-col justify-between space-y-4 cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-petlight flex items-center justify-center text-petblue mb-3 group-hover:bg-petgreen group-hover:text-white transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-petblue">Directorio Veterinario</h3>
              <p className="text-xs text-slate-500 mt-1">Encuentra clínicas aliadas y servicios de urgencias 24hs.</p>
            </div>
            <span className="text-xs font-bold text-petgreen flex items-center gap-1">
              <span>Ver Directorio</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>

          <a
            href="/pet/1"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-petgreen/50 hover:shadow-md transition-all group flex flex-col justify-between space-y-4 cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-petlight flex items-center justify-center text-petblue mb-3 group-hover:bg-petgreen group-hover:text-white transition-colors">
                <ExternalLink className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-petblue">Perfil de Ejemplo</h3>
              <p className="text-xs text-slate-500 mt-1">Visualiza el perfil público de emergencia de Simba.</p>
            </div>
            <span className="text-xs font-bold text-petgreen flex items-center gap-1">
              <span>Abrir Perfil</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>

        </div>
      </section>

      {/* Footer Institucional */}
      <footer className="bg-petblue text-white py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-petgreen rounded-lg flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">HuellaDigital Misiones</span>
          </div>

          <div className="flex gap-6 text-xs text-slate-300 font-medium">
            <a href="/ecosystem/directory" className="hover:text-petgreen">Soporte</a>
            <a href="/vet/login" className="hover:text-petgreen">Colegio Veterinario</a>
            <a href="/" className="hover:text-petgreen">Privacidad</a>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Protegido por HuellaDigital • Misiones, Argentina
          </p>
        </div>
      </footer>

    </div>
  );
}