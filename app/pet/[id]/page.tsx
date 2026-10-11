"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Phone, ShieldCheck, AlertTriangle, Stethoscope, MapPin, Heart, Loader2, MessageCircle } from "lucide-react";

export default function EmergencyPetPage() {
  const params = useParams();
  const petId = params?.id as string;
  
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPetProfile() {
      if (!petId) return;
      try {
        // Consulta relacional: Trae la mascota y los datos de contacto del tutor
        const { data, error } = await supabase
          .from("pets")
          .select(`
            *,
            profiles (
              full_name,
              phone,
              location
            )
          `)
          .eq("id", petId)
          .single();

        if (error) throw error;
        setPet(data);
      } catch (err) {
        console.error("Error al obtener la mascota:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPetProfile();
  }, [petId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-petlight flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-petgreen" />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-petlight flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center max-w-sm w-full">
          <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-petblue">Perfil no encontrado</h2>
          <p className="text-sm text-slate-500 mt-2">
            La mascota que intentas buscar no existe o el dispositivo NFC no está vinculado.
          </p>
          <Link href="/" className="mt-6 inline-block text-petgreen font-bold text-sm hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const ownerName = pet.profiles?.full_name || "Tutor No Especificado";
  const ownerPhone = pet.profiles?.phone || "";
  const ownerLocation = pet.profiles?.location || "Ubicación desconocida";
  const avatarImage = pet.avatar_url || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400";

  // Formateo de Enlace de WhatsApp para Emergencias
  const cleanPhone = ownerPhone.replace(/[^0-9]/g, '');
  const whatsappMessage = encodeURIComponent(`¡Hola! Encontré a ${pet.name} escaneando su HuellaDigital. Por favor, comunícate conmigo.`);
  const whatsappLink = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;

  return (
    <main className="min-h-screen bg-petlight flex items-center justify-center p-0 sm:py-8 sm:px-4 overflow-x-hidden">
      <div className="w-[90%] max-w-md mx-auto bg-white min-h-screen sm:min-h-0 sm:rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between border border-slate-100 my-4 sm:my-0">
        
        <div>
          <div className="bg-petblue text-white px-6 pt-6 pb-14 relative text-center">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium tracking-wide text-petgreen border border-white/10 mb-4">
              <ShieldCheck className="w-4 h-4 text-petgreen" />
              <span>Perfil Verificado NFC</span>
            </div>
            
            <h1 className="text-xs uppercase tracking-widest text-slate-300 font-semibold">
              HuellaDigital Misiones
            </h1>
          </div>

          <div className="px-6 relative -mt-10 text-center">
            <div className="relative inline-block">
              <img
                src={avatarImage}
                alt={pet.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg mx-auto bg-slate-100"
              />
              <div className="absolute bottom-0 right-0 bg-petgreen text-white p-1.5 rounded-full shadow-md">
                <Heart className="w-4 h-4 fill-current" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-petblue mt-3">{pet.name}</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              {pet.species} • {pet.breed} • {pet.age}
            </p>
          </div>

          <div className="px-6 py-6 space-y-6">
            
            {pet.emergency_notes && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-800 mb-1">
                      Condición Médica / Alergias
                    </h3>
                    <p className="text-sm text-red-900 leading-relaxed font-medium whitespace-pre-line">
                      {pet.emergency_notes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-petlight p-4 rounded-xl border border-slate-200/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Información del Tutor Responsable
              </h3>
              <p className="text-base font-semibold text-petblue">{ownerName}</p>
              <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-1">
                <MapPin className="w-4 h-4 text-petgreen shrink-0" />
                <span>{ownerLocation}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-petgreen hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contactar al Tutor</span>
              </a>

              <Link
                href="/vet/login"
                className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-petblue hover:bg-[#0b1f33] text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                <Stethoscope className="w-4 h-5 text-petgreen" />
                <span>Acceso Veterinarios y Clínicas</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="py-4 px-6 text-center border-t border-slate-100 bg-slate-50/50 mt-auto">
          <p className="text-xs text-slate-400 font-medium">
            Protegido por HuellaDigital • Misiones, Argentina
          </p>
        </div>

      </div>
    </main>
  );
}