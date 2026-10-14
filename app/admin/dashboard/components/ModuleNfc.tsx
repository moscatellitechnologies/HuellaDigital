"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, XCircle, Loader2, PlusCircle, Database } from "lucide-react";

export default function ModuleNfc() {
  const [nfcUid, setNfcUid] = useState("");
  const [isLoadingNfc, setIsLoadingNfc] = useState(false);
  const [nfcMessage, setNfcMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleAddNfc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nfcUid.trim()) return;
    setIsLoadingNfc(true);
    setNfcMessage(null);

    try {
      const { error } = await supabase
        .from("cards")
        .insert([{ uid: nfcUid, is_active: false }]);

      if (error) throw error;
      setNfcMessage({ text: `Tarjeta ${nfcUid} ingresada al stock correctamente.`, type: "success" });
      setNfcUid("");
    } catch (error: any) {
      setNfcMessage({ text: error.message || "Error al registrar la tarjeta.", type: "error" });
    } finally {
      setIsLoadingNfc(false);
    }
  };

  const handleGenerateBatch = async () => {
    setIsLoadingNfc(true);
    setNfcMessage(null);
    try {
      const batch = Array.from({ length: 5 }).map((_, i) => ({
        uid: `nfc_test_${Date.now().toString().slice(-6)}_${i + 1}`,
        is_active: false
      }));

      const { error } = await supabase.from("cards").insert(batch);
      if (error) throw error;

      setNfcMessage({ text: "Lote de 5 tarjetas de prueba generado con éxito.", type: "success" });
    } catch (error: any) {
      setNfcMessage({ text: error.message || "Error al generar el lote.", type: "error" });
    } finally {
      setIsLoadingNfc(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Gestión de Hardware NFC</h2>
        <p className="text-sm text-slate-500 mt-1">
          Da de alta las tarjetas en el sistema antes de su distribución.
        </p>
      </div>

      {nfcMessage && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-semibold flex items-start gap-2 ${
          nfcMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {nfcMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
          <span>{nfcMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleAddNfc} className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            UID del Chip NFC
          </label>
          <input
            type="text"
            required
            placeholder="Ej. nfc_misiones_001"
            value={nfcUid}
            onChange={(e) => setNfcUid(e.target.value)}
            className="w-full px-4 py-2.5 text-base bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoadingNfc}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-70"
        >
          {isLoadingNfc ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
          <span>Registrar Tarjeta en Sistema</span>
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-2">Herramientas de Desarrollo</h3>
        <button
          onClick={handleGenerateBatch}
          disabled={isLoadingNfc}
          className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold py-2 px-4 rounded-xl text-xs transition-all"
        >
          <Database className="w-4 h-4" />
          <span>Generar Lote de Prueba (5 Tarjetas)</span>
        </button>
      </div>
    </div>
  );
}