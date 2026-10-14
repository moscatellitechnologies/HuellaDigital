"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, XCircle, Loader2, Edit, Trash2, ArrowRight } from "lucide-react";

export default function ModuleClinics() {
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clinicMessage, setClinicMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Formulario Alta/Edición
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [clinicData, setClinicData] = useState({
    clinicName: "",
    branchName: "",
    city: "Posadas",
    address: ""
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clinic_branches")
        .select(`id, name, city, address, is_active, clinics(name)`)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error("Error obteniendo sucursales:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setClinicMessage(null);

    try {
      if (isEditing && editingId) {
        // UPDATE (Solo actualizamos branch, clinics requeriría lógica extra si comparte sucursales)
        const { error } = await supabase.from("clinic_branches")
          .update({ name: clinicData.branchName, city: clinicData.city, address: clinicData.address })
          .eq("id", editingId);
        if (error) throw error;
        setClinicMessage({ text: "Sucursal actualizada con éxito.", type: "success" });
      } else {
        // INSERT (Crear Clínica y Branch)
        const { data: clinicRes, error: clinicError } = await supabase.from("clinics")
          .insert([{ name: clinicData.clinicName }]).select("id").single();
        if (clinicError) throw clinicError;

        const { error: branchError } = await supabase.from("clinic_branches")
          .insert([{ clinic_id: clinicRes.id, name: clinicData.branchName, city: clinicData.city, address: clinicData.address }]);
        if (branchError) throw branchError;

        setClinicMessage({ text: "Clínica y sucursal creadas exitosamente.", type: "success" });
      }

      setClinicData({ clinicName: "", branchName: "", city: "Posadas", address: "" });
      setIsEditing(false);
      setEditingId(null);
      fetchBranches();

    } catch (error: any) {
      setClinicMessage({ text: error.message || "Error en la operación.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta sucursal? Esta acción la ocultará del directorio público.")) return;
    try {
      // Borrado lógico para no romper relaciones foráneas con los veterinarios
      const { error } = await supabase.from("clinic_branches").update({ is_active: false }).eq("id", id);
      if (error) throw error;
      fetchBranches();
    } catch (error) {
      alert("Error al eliminar la sucursal");
    }
  };

  const startEdit = (branch: any) => {
    setIsEditing(true);
    setEditingId(branch.id);
    setClinicData({
      clinicName: branch.clinics?.name || "Clínica", // Solo lectura visual
      branchName: branch.name,
      city: branch.city,
      address: branch.address
    });
  };

  return (
    <div className="p-6 sm:p-8 animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Infraestructura y Directorio</h2>
        <p className="text-sm text-slate-500 mt-1">Registra, edita o elimina clínicas y sucursales operativas en Misiones.</p>
      </div>

      {clinicMessage && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-semibold flex items-start gap-2 ${clinicMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {clinicMessage.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span>{clinicMessage.text}</span>
        </div>
      )}

      {/* Formulario de Alta/Edición */}
      <form onSubmit={handleSaveClinic} className="space-y-4 max-w-xl mb-8">
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase text-slate-500">{isEditing ? "Editando Sucursal" : "Nueva Infraestructura"}</h3>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(false); setClinicData({ clinicName: "", branchName: "", city: "Posadas", address: "" }); }} className="text-xs text-indigo-600 font-bold underline">
                Cancelar Edición
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Comercial (Cadena/Clínica)</label>
              <input type="text" required disabled={isEditing} value={clinicData.clinicName} onChange={(e) => setClinicData({ ...clinicData, clinicName: e.target.value })} className="w-full px-4 py-2 text-base bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Sucursal</label>
                <input type="text" required value={clinicData.branchName} onChange={(e) => setClinicData({ ...clinicData, branchName: e.target.value })} className="w-full px-4 py-2 text-base bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Localidad</label>
                <select value={clinicData.city} onChange={(e) => setClinicData({ ...clinicData, city: e.target.value })} className="w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500">
                  <option value="Posadas">Posadas</option>
                  <option value="Oberá">Oberá</option>
                  <option value="Eldorado">Eldorado</option>
                  <option value="Puerto Iguazú">Puerto Iguazú</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Dirección Física</label>
              <input type="text" required value={clinicData.address} onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })} className="w-full px-4 py-2 text-base bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl mt-4 disabled:opacity-70">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{isEditing ? "Guardar Cambios" : "Registrar Infraestructura"}</span>}
          </button>
        </div>
      </form>

      {/* Tabla CRUD */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold">
            <tr>
              <th className="py-3 px-4 border-b border-slate-200">Clínica / Cadena</th>
              <th className="py-3 px-4 border-b border-slate-200">Sucursal</th>
              <th className="py-3 px-4 border-b border-slate-200">Ubicación</th>
              <th className="py-3 px-4 border-b border-slate-200 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {branches.map(branch => (
              <tr key={branch.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-indigo-700">{branch.clinics?.name}</td>
                <td className="py-3 px-4">{branch.name}</td>
                <td className="py-3 px-4">{branch.address} ({branch.city})</td>
                <td className="py-3 px-4 flex justify-end gap-2">
                  <button onClick={() => startEdit(branch)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(branch.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {branches.length === 0 && !isLoading && <div className="p-6 text-center text-slate-500">No hay sucursales activas registradas.</div>}
      </div>
    </div>
  );
}