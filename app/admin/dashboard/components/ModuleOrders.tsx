"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Package, Truck, Loader2 } from "lucide-react";

export default function ModuleOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles (full_name, phone)
        `)
        .in("status", ["paid", "shipped"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error obteniendo pedidos:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const markAsShipped = async (orderId: string, phone: string, fullName: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "shipped" })
        .eq("id", orderId);

      if (error) throw error;
      
      // Actualizar local
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "shipped" } : o));

      // Abrir WhatsApp
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const msg = encodeURIComponent(`¡Hola ${fullName}! Te avisamos desde HuellaDigital que tu Placa Inteligente ya está en camino hacia el domicilio indicado. 📦`);
      window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");

    } catch (error) {
      console.error(error);
      alert("Error al actualizar el pedido.");
    }
  };

  return (
    <div className="p-6 sm:p-8 animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Logística y Despachos</h2>
        <p className="text-sm text-slate-500 mt-1">
          Gestiona las placas pagadas listas para ser enviadas.
        </p>
      </div>

      {isLoadingOrders ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No hay ventas pendientes</h3>
          <p className="text-sm text-slate-500">Los pedidos pagados aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-800">{order.profiles?.full_name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    order.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {order.status === "paid" ? "Pagado" : "Enviado"}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-medium break-all">
                  {order.shipping_address}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  ID Pago: {order.payment_id} • Fecha: {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              
              {order.status === "paid" && (
                <button
                  onClick={() => markAsShipped(order.id, order.profiles?.phone || "", order.profiles?.full_name || "")}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <Truck className="w-4 h-4" /> Despachar Placa
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}