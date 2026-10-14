"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  CreditCard, 
  Stethoscope, 
  Building2, 
  Package, 
  ShoppingBag,
  Users
} from "lucide-react";

// Importación de Módulos Separados
import ModuleClinics from "./components/ModuleClinics";
import ModuleCommunity from "./components/ModuleCommunity";
import ModuleOrders from "./components/ModuleOrders";
import ModuleProducts from "./components/ModuleProducts";
import ModuleNfc from "./components/ModuleNfc";
import ModuleVets from "./components/ModuleVets";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"nfc" | "vets" | "clinics" | "orders" | "products" | "community">("clinics");

  return (
    <main className="min-h-screen bg-slate-50 pb-12 overflow-x-hidden text-slate-800">
      <nav className="bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="font-bold tracking-wide block">Centro de Comando</span>
              <span className="text-xs text-slate-400">Backoffice Administrativo Modular</span>
            </div>
          </div>
          <Link href="/" className="text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all">
            Volver al Sitio
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Menú Lateral Modular */}
        <div className="lg:col-span-1 space-y-2">
          
          <button onClick={() => setActiveTab("clinics")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "clinics" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>
            <Building2 className="w-4 h-4" /> <span>Infraestructura Clínica</span>
          </button>

          <button onClick={() => setActiveTab("community")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "community" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>
            <Users className="w-4 h-4" /> <span>Moderación Comunidad</span>
          </button>

          <button onClick={() => setActiveTab("orders")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "orders" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>
            <Package className="w-4 h-4" /> <span>Ventas y Envíos</span>
          </button>
          
          <button onClick={() => setActiveTab("products")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "products" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>
            <ShoppingBag className="w-4 h-4" /> <span>Catálogo y Tienda</span>
          </button>

          <button onClick={() => setActiveTab("nfc")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "nfc" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>
            <CreditCard className="w-4 h-4" /> <span>Inventario NFC</span>
          </button>

          <button onClick={() => setActiveTab("vets")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "vets" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>
            <Stethoscope className="w-4 h-4" /> <span>Auditoría Médica</span>
          </button>
        </div>

        {/* Panel Principal */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
          {activeTab === "clinics" && <ModuleClinics />}
          {activeTab === "community" && <ModuleCommunity />}
          {activeTab === "orders" && <ModuleOrders />}
          {activeTab === "products" && <ModuleProducts />}
          {activeTab === "nfc" && <ModuleNfc />}
          {activeTab === "vets" && <ModuleVets />}
        </div>
      </div>
    </main>
  );
}