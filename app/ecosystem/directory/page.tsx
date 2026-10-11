"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  Search, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  ArrowLeft, 
  ExternalLink, 
  Clock,
  Stethoscope
} from "lucide-react";

interface VetService {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  verified: boolean;
  mapQuery: string;
}

const initialServices: VetService[] = [
  {
    id: "1",
    name: "Clínica Veterinaria del Sur",
    category: "Urgencias 24hs & Clínica General",
    address: "Av. Uruguay 3420",
    city: "Posadas, Misiones",
    phone: "+54 9 376 4455667",
    hours: "Lunes a Domingo - 24 Horas",
    verified: true,
    mapQuery: "Clinica Veterinaria del Sur Posadas Misiones"
  },
  {
    id: "2",
    name: "Centro Veterinario Misiones",
    category: "Vacunación, Cirugía & Especialidades",
    address: "San Lorenzo 1820",
    city: "Posadas, Misiones",
    phone: "+54 9 376 4223344",
    hours: "Lun a Sáb: 08:00 - 20:00 hs",
    verified: true,
    mapQuery: "San Lorenzo 1820 Posadas Misiones"
  },
  {
    id: "3",
    name: "Veterinaria Oberá",
    category: "Clínica General & Pet Shop",
    address: "Av. Sarmiento 950",
    city: "Oberá, Misiones",
    phone: "+54 9 375 5443322",
    hours: "Lun a Sáb: 08:30 - 19:30 hs",
    verified: true,
    mapQuery: "Av Sarmiento 950 Oberá Misiones"
  },
  {
    id: "4",
    name: "Iguazú Vet Care",
    category: "Urgencias & Diagnóstico por Imágenes",
    address: "Av. Victoria Aguirre 410",
    city: "Puerto Iguazú, Misiones",
    phone: "+54 9 375 7421100",
    hours: "Lun a Sáb: 09:00 - 21:00 hs",
    verified: true,
    mapQuery: "Av Victoria Aguirre 410 Puerto Iguazú Misiones"
  }
];

export default function EcosystemDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [services] = useState<VetService[]>(initialServices);

  // Filtrado dinámico por nombre, categoría o localidad
  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-petlight pb-12 overflow-x-hidden">
      
      {/* Navbar Superior */}
      <nav className="bg-petblue text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-3">
          {/* Enrutamiento estricto a "/" */}
          <Link
            href="/"
            className="flex items-center min-h-[44px] gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 text-petgreen" />
            <span>Volver al Inicio</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-white/10 px-3 py-2 min-h-[44px] flex items-center rounded-xl text-slate-200 border border-white/10 font-medium whitespace-nowrap">
              Directorio Oficial • Misiones
            </span>
          </div>
        </div>
      </nav>

      {/* Contenedor Principal */}
      <div className="w-[90%] sm:max-w-6xl mx-auto mt-8 space-y-6">
        
        {/* Cabecera de Impacto y Buscador */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-petblue">Directorio de Veterinarias y Servicios</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Encuentra clínicas aliadas, centros de urgencias 24hs y servicios veterinarios verificados en la provincia.
            </p>
          </div>

          <div className="w-full md:w-80 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Buscar clínica, ciudad o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 min-h-[44px] text-base bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue placeholder-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Grilla de Prestadores Aliados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div 
                key={service.id} 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between space-y-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-petlight flex items-center justify-center text-petblue border border-slate-200 shrink-0 shadow-inner">
                    <Building2 className="w-7 h-7 text-petgreen" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <h3 className="text-xl font-bold text-petblue">{service.name}</h3>
                      {service.verified && (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold border border-emerald-100 whitespace-nowrap">
                          <ShieldCheck className="w-4 h-4 text-petgreen" /> Aliado
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-petgreen block mt-1">
                      {service.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <p className="flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" /> 
                    <span>{service.address} • <strong className="text-petblue">{service.city}</strong></span>
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" /> 
                    <span>{service.hours}</span>
                  </p>
                </div>

                {/* Botones de Acción */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <a
                    href={`https://wa.me/${service.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-petlight hover:bg-slate-200 text-petblue font-bold text-sm py-2.5 px-4 rounded-xl transition-all"
                  >
                    <Phone className="w-4 h-4 text-petgreen" />
                    <span>Contactar</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.mapQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-petblue hover:bg-[#0b1f33] text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-all shadow"
                  >
                    <ExternalLink className="w-4 h-4 text-petgreen" />
                    <span>Ver Mapa</span>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 text-lg">
              No se encontraron clínicas que coincidan con la búsqueda.
            </div>
          )}
        </div>

      </div>
    </main>
  );
}