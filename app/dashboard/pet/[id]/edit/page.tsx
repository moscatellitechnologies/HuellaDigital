"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "../../../../context/AuthContext";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Camera, 
  AlertCircle, 
  Phone, 
  MapPin, 
  PawPrint 
} from "lucide-react";

export default function EditPetPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  
  const petId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    emergency_notes: ""
  });

  useEffect(() => {
    async function fetchPetData() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("pets")
          .select("*")
          .eq("id", petId)
          .eq("owner_id", user.id) // Validar que sea dueño
          .single();

        if (error) throw error;
        if (!data) {
          router.push("/dashboard");
          return;
        }

        setFormData({
          name: data.name || "",
          species: data.species || "",
          breed: data.breed || "",
          age: data.age || "",
          emergency_notes: data.emergency_notes || ""
        });
        
        setAvatarPreview(data.avatar_url);
        
      } catch (err: any) {
        setError("Error al cargar la información de la mascota.");
      } finally {
        setLoading(false);
      }
    }

    fetchPetData();
  }, [petId, user, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let publicAvatarUrl = avatarPreview;

      // Si subió nueva foto, guardarla en Storage
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `pet_${petId}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('pet-avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw new Error("Error al subir la nueva foto.");

        const { data: urlData } = supabase.storage
          .from('pet-avatars')
          .getPublicUrl(fileName);
          
        publicAvatarUrl = urlData.publicUrl;
      }

      // Actualizar datos en BD
      const { error: updateError } = await supabase
        .from("pets")
        .update({
          name: formData.name,
          age: formData.age,
          emergency_notes: formData.emergency_notes,
          avatar_url: publicAvatarUrl
        })
        .eq("id", petId)
        .eq("owner_id", user?.id);

      if (updateError) throw updateError;

      router.push("/dashboard");

    } catch (err: any) {
      setError(err.message || "Ocurrió un error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-petlight flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-petgreen" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-petlight p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-petblue text-white px-6 py-6 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Editar Perfil de {formData.name}</h1>
            <p className="text-xs text-slate-300">Actualiza la información médica y fotografía</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center">
            <label htmlFor="avatar-upload" className="relative cursor-pointer group">
              <div className="w-32 h-32 rounded-full border-4 border-slate-100 shadow-sm overflow-hidden relative">
                <img 
                  src={avatarPreview || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80"} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white mb-1" />
                  <span className="text-xs text-white font-bold">Cambiar Foto</span>
                </div>
              </div>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre</label>
              <div className="relative">
                <PawPrint className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-petgreen focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Edad Actual</label>
              <input 
                type="text" 
                name="age" 
                value={formData.age} 
                onChange={handleChange} 
                placeholder="Ej. 4 años"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-petgreen focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Alertas Médicas / Notas de Emergencia</label>
            <div className="relative">
              <AlertCircle className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <textarea 
                name="emergency_notes" 
                rows={4} 
                value={formData.emergency_notes} 
                onChange={handleChange}
                placeholder="Ej. Alérgico a penicilina, sufre de epilepsia..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-petgreen focus:outline-none resize-none text-slate-800 placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <Link 
              href="/dashboard"
              className="flex-1 flex justify-center items-center py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              disabled={saving}
              className="flex-2 flex justify-center items-center gap-2 py-3 rounded-xl font-bold text-white bg-petgreen hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Guardar Cambios
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}