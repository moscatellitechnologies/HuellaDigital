"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, MapPin, Truck, Loader2, ShoppingBag, X, MessageCircle, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function StorePage() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  // Estados para el Modal de Checkout
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutCity, setCheckoutCity] = useState("Posadas");
  const [checkoutAddress, setCheckoutAddress] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  // Precargar nombre si el usuario está logueado y abre el modal
  useEffect(() => {
    if (selectedProduct && profile?.full_name) {
      setCheckoutName(profile.full_name);
    }
  }, [selectedProduct, profile]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error obteniendo productos:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    // Número oficial de la empresa (Reemplazar por el real)
    const companyPhone = "5493764269382"; 
    
    const message = `¡Hola HuellaDigital! Quiero realizar una compra:
📦 Producto: ${selectedProduct.name}
💰 Total: $${Number(selectedProduct.price).toLocaleString("es-AR")}

👤 Mis datos:
Nombre: ${checkoutName}
Localidad: ${checkoutCity}
Dirección: ${checkoutAddress}

¿Me pasan los datos para transferir y coordinar la entrega?`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${companyPhone}?text=${encodedMessage}`, "_blank");
    
    // Cerrar modal al finalizar
    setSelectedProduct(null);
  };

  return (
    <main className="min-h-screen bg-petlight py-12 px-4 relative">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-1.5 rounded-full text-sm font-bold text-indigo-600 mb-4 shadow-sm border border-indigo-100">
            <ShieldCheck className="w-4 h-4" /> Lanzamiento Oficial
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-petblue mb-4 tracking-tight">
            Tienda HuellaDigital
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto font-medium">
            Equipamiento inteligente para la seguridad de tu mascota. Sin baterías, sin suscripciones mensuales. Todo centralizado en tu perfil.
          </p>
        </div>

        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-petgreen mb-4" />
            <p className="text-slate-500 font-medium">Cargando catálogo...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Tienda en mantenimiento</h3>
            <p className="text-slate-500 mt-2">Pronto agregaremos nuevos productos al catálogo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 transition-all group flex flex-col">
                <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <ImageIcon className="w-16 h-16 text-slate-200" />
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-petblue mb-2 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-3">
                    {product.description}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-end justify-between">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Precio Final</span>
                      <span className="text-2xl font-black text-petgreen">
                        ${Number(product.price).toLocaleString("es-AR")}
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedProduct(product)}
                      className="bg-petblue hover:bg-[#0b1f33] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE CHECKOUT */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-800">Resumen de Compra</h2>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm border border-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="flex gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 bg-white rounded-xl border border-slate-200 overflow-hidden shrink-0">
                  {selectedProduct.image_url ? (
                    <img src={selectedProduct.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-300" /></div>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-bold text-sm text-slate-800 line-clamp-2 leading-tight">{selectedProduct.name}</h4>
                  <span className="font-black text-petgreen mt-1">${Number(selectedProduct.price).toLocaleString("es-AR")}</span>
                </div>
              </div>

              <form onSubmit={handleWhatsAppCheckout} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre y Apellido</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Quien recibe el pedido"
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-petgreen outline-none text-slate-800 font-medium" 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Localidad (Misiones)</label>
                    <select
                      required
                      value={checkoutCity}
                      onChange={(e) => setCheckoutCity(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-petgreen outline-none text-slate-800 font-medium"
                    >
                      <option value="Posadas">Posadas</option>
                      <option value="Oberá">Oberá</option>
                      <option value="Eldorado">Eldorado</option>
                      <option value="Puerto Iguazú">Puerto Iguazú</option>
                      <option value="Garupá">Garupá</option>
                      <option value="Leandro N. Alem">Leandro N. Alem</option>
                      <option value="Apóstoles">Apóstoles</option>
                      <option value="Otra">Otra (Aclarar en dirección)</option>
                    </select>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Dirección de Entrega
                    </label>
                    <div className="relative">
                      <span className="absolute top-3.5 left-3 text-slate-400"><MapPin className="w-5 h-5" /></span>
                      <textarea
                        required
                        rows={2}
                        placeholder="Calle, Altura, Barrio o indicaciones..."
                        value={checkoutAddress}
                        onChange={(e) => setCheckoutAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-petgreen outline-none resize-none text-slate-800 font-medium placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-slate-500 flex items-start gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Truck className="w-4 h-4 text-slate-400 shrink-0" />
                    Al continuar, serás redirigido a nuestro WhatsApp oficial para coordinar el pago y el envío seguro.
                  </p>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-[#25D366]/20 active:scale-[0.98]"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Comprar por WhatsApp</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}