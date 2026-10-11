"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldCheck, MapPin, Truck, CreditCard, Loader2 } from "lucide-react";

export default function StorePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const price = 15000; // Precio en ARS

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login?redirect=/store");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          address: address,
          title: "Placa Inteligente NFC - HuellaDigital",
          price: price,
        }),
      });

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("No se pudo iniciar el pago");
      }
    } catch (error) {
      console.error(error);
      alert("Error al procesar la compra. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-petlight py-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Detalles del Producto */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold text-indigo-600 mb-4 w-fit">
            <ShieldCheck className="w-4 h-4" /> Lanzamiento Oficial
          </div>
          <h1 className="text-3xl font-bold text-petblue mb-4">Placa Inteligente NFC</h1>
          <p className="text-slate-600 mb-6">
            Vincula la ficha médica y datos de contacto de tu mascota en una placa de resina ultrarresistente. Sin baterías, sin suscripciones mensuales.
          </p>
          <div className="text-4xl font-black text-petgreen mb-6">
            ${price.toLocaleString("es-AR")} <span className="text-sm text-slate-400 font-medium">ARS</span>
          </div>
          <ul className="space-y-3 text-sm text-slate-700 font-medium">
            <li className="flex items-center gap-2"><Truck className="w-4 h-4 text-petgreen" /> Envío a toda la provincia de Misiones.</li>
            <li className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-petgreen" /> Pago seguro con Mercado Pago.</li>
          </ul>
        </div>

        {/* Formulario de Checkout */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Datos de Envío</h2>
          
          {!user ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-slate-600 font-medium mb-4">Debes iniciar sesión para comprar tu placa.</p>
              <button onClick={() => router.push("/auth/login?redirect=/store")} className="bg-petblue text-white px-6 py-2.5 rounded-xl font-bold">
                Iniciar Sesión / Registrarse
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre Completo</label>
                <input type="text" disabled value={profile?.full_name || ""} className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Dirección Completa (Localidad, Calle, Altura) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute top-3.5 left-3 text-slate-400"><MapPin className="w-5 h-5" /></span>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ej. Leandro N. Alem, San Martín 1234, CP 3315"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-petgreen outline-none resize-none text-slate-800 font-medium placeholder-slate-400"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-[#009EE3] hover:bg-[#008ACB] text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                <span>Pagar con Mercado Pago</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </main>
  );
}