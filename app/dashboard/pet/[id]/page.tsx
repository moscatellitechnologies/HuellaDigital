"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { 
  ArrowLeft, 
  Settings, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";

function EditPetContent() {
  const router = useRouter();
  const params = useParams();
  const petId = params?.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [successMessage, setSuccessMessage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    photoUrl: "",
    medicalCondition: "",
  });

  // Cargar datos reales desde Supabase al montar
  useEffect(() => {
    async function loadPetData() {
      if (!petId) return;
      try {
        const { data, error } = await supabase
          .from("pets")
          .select("*")
          .eq("id", petId)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            name: data.name || "",
            species: data.species || "",
            breed: data.breed || "",
            age: data.age || "",
            photoUrl: data.avatar_url || "",
            medicalCondition: data.emergency_notes || "",
          });
        }
      } catch (error) {
        console.error("Error al cargar los datos de la mascota:", error);
      } finally {
        setIsFetching(false);
      }
    }
    loadPetData();
  }, [petId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Actualizar registro en Supabase
      const { error } = await supabase
        .from("pets")
        .update({
          name: formData.name,
          species: formData.species,
          breed: formData.breed,
          age: formData.age,
          avatar_url: formData.photoUrl,
          emergency_notes: formData.medicalCondition,
        })
        .eq("id", petId);

      if (error) throw error;

      setSuccessMessage(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error al actualizar la mascota:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-petlight flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-petgreen" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-petlight pb-12 overflow-x-hidden">
      
      <nav className="bg-petblue text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="flex items-center min-h-[44px] gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 text-petgreen" />
            <span>Volver al Panel</span>
          </Link>
          <span className="text-xs bg-emerald-500/20 text-petgreen px-3 py-1.5 rounded-full border border-emerald-500/30 font-semibold">
            ● Modo Edición
          </span>
        </div>
      </nav>

      <div className="w-[90%] sm:max-w-3xl mx-auto mt-8 space-y-6">
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-petlight rounded-2xl flex items-center justify-center border border-slate-200 text-petblue shrink-0">
            <Settings className="w-6 h-6 text-petgreen" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-petblue">Editar Datos de la Mascota</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Actualiza la información visible en el perfil NFC de emergencia y biometría.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-5 h-5 text-petgreen shrink-0" />
            <span>¡Datos actualizados con éxito! Redirigiendo al panel...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Nombre de la Mascota <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Especie <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="species"
                required
                value={formData.species}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Raza <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="breed"
                required
                value={formData.breed}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Edad / Años <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="age"
                required
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              URL de la Fotografía <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="photoUrl"
              required
              value={formData.photoUrl}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Condición Médica / Alergias Críticas <span className="text-red-500">*</span>
            </label>
            <textarea
              name="medicalCondition"
              rows={4}
              required
              value={formData.medicalCondition}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium resize-none"
            />
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-petgreen hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Guardando Cambios...</span>
                </>
              ) : (
                <span>Guardar Cambios y Actualizar NFC</span>
              )}
            </button>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto min-h-[44px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all text-sm text-center"
            >
              Cancelar
            </Link>
          </div>

        </form>

      </div>
    </main>
  );
}

export default function EditPetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-petlight flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-petgreen" />
      </div>
    }>
      <EditPetContent />
    </Suspense>
  );
}