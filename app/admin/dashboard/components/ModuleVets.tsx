"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function ModuleVets() {
  const [pendingVets, setPendingVets] = useState<any[]>([]);
  const [isLoadingVets, setIsLoadingVets] = useState(false);

  useEffect(() => {
    fetchPendingVets();
  }, []);

  const fetchPendingVets = async () => {
    setIsLoadingVets(true);
    try {
      const { data, error } = await supabase
        .from("vet_profiles")
        .select(`
          id,
          license_number,
          status,
          profiles (full_name, phone)
        `)
        .eq("status", "pending");

      if (error) throw error;
      setPendingVets(data || []);
    } catch (error) {
      console.error("Error obteniendo veterinarios pendientes:", error);
    } finally {
      setIsLoadingVets(false);
    }
  };

  const handleUpdateVetStatus = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("vet_profiles")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      setPendingVets(pendingVets.filter(vet => vet.id !== id));
    } catch (error) {
      console.error("Error actualizando estado:", error);
      alert("No se pudo actualizar el estado del veterinario.");
    }
  };

  return (
    <div className="p-6 sm:p-8 animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Auditoría Médica Antifraude</h2>
        <p className="text-sm text-slate-500 mt-1">
          Revisa y aprueba las credenciales de los profesionales que solicitan acceso.
        </p>
      </div>

      {isLoadingVets ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : pendingVets.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No hay solicitudes pendientes</h3>
          <p className="text-sm text-slate-500">Todos los profesionales han sido auditados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold">
              <tr>
                <th className="py-3 px-4 border-b border-slate-200">Profesional</th>
                <th className="py-3 px-4 border-b border-slate-200">Matrícula</th>
                <th className="py-3 px-4 border-b border-slate-200">Contacto</th>
                <th className="py-3 px-4 border-b border-slate-200 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {pendingVets.map((vet) => (
                <tr key={vet.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-4 font-bold">{vet.profiles?.full_name || "Desconocido"}</td>
                  <td className="py-4 px-4 font-mono text-xs">{vet.license_number}</td>
                  <td className="py-4 px-4 text-xs">{vet.profiles?.phone || "Sin teléfono"}</td>
                  <td className="py-4 px-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleUpdateVetStatus(vet.id, "approved")}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleUpdateVetStatus(vet.id, "rejected")}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      Rechazar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}