"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Stethoscope, 
  MapPin, 
  Heart, 
  Loader2, 
  MessageCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Activity,
  Syringe,
  FileText
} from "lucide-react";

export default function EmergencyPetClient({ petId }: { petId: string }) {
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    async function fetchPetProfile() {
      if (!petId) return;
      try {
        const isNumeric = !isNaN(Number(petId));
        
        // SOLUCIÓN DEFINITIVA: Pedimos todas las columnas de medical_records con (*)
        // Esto evita el error 42703 (column does not exist) para siempre.
        const query = supabase
          .from("pets")
          .select(`
            *,
            profiles (
              full_name,
              phone,
              location
            ),
            medical_records ( * )
          `);

        const { data, error } = isNumeric
          ? await query.eq("id", petId).maybeSingle()
          : await query.eq("nfc_uid", petId).maybeSingle();

        if (error) throw error;

        // Ordenamos por fecha de creación (la columna real que vimos en tu BD)
        if (data && data.medical_records) {
          data.medical_records.sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }

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
            La mascota con identificador <span className="font-mono font-bold">{petId}</span> no está vinculada o no existe en la base de datos.
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

  const cleanPhone = ownerPhone.replace(/[^0-9]/g, '');
  const whatsappMessage = encodeURIComponent(`¡Hola! Encontré a ${pet.name} escaneando su Tarjeta Inteligente NFC. Por favor, comunícate conmigo.`);
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
            
            {/* Alertas Médicas Críticas */}
            {pet.emergency_notes && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-800 mb-1">
                      Alerta Médica / Preexistencias
                    </h3>
                    <p className="text-sm text-red-900 leading-relaxed font-medium whitespace-pre-line">
                      {pet.emergency_notes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Datos del Tutor */}
            <div className="bg-petlight p-4 rounded-xl border border-slate-200/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Tutor Responsable
              </h3>
              <p className="text-base font-semibold text-petblue">{ownerName}</p>
              <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-1">
                <MapPin className="w-4 h-4 text-petgreen shrink-0" />
                <span>{ownerLocation}</span>
              </div>
            </div>

            {/* Historial Clínico de Alta Calidad */}
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between bg-white border border-petblue/20 p-4 rounded-xl shadow-sm hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-petblue/10 p-2 rounded-lg group-hover:bg-petblue/20 transition-colors">
                    <Stethoscope className="w-5 h-5 text-petblue" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-petblue">Historial Clínico</span>
                    <span className="block text-xs text-slate-500">Acceso rápido para veterinarios</span>
                  </div>
                </div>
                {showHistory ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {showHistory && (
                <div className="mt-3 space-y-4">
                  {pet.medical_records && pet.medical_records.length > 0 ? (
                    pet.medical_records.map((record: any) => {
                      // Normalización de datos basada en las capturas de tu BD
                      const visitType = record.visit_type || record.consultation_type || "Consulta Médica";
                      const diagnosis = record.diagnosis || record.diagnosis_notes;
                      const weight = record.weight || record.weight_kg;
                      const temperature = record.temperature || record.temperature_c;
                      const hasVitals = weight || temperature;
                      const isVaccine = record.vaccine_details || record.vaccine_batch;

                      return (
                        <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                          {/* Etiqueta lateral de color */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${isVaccine ? 'bg-emerald-400' : 'bg-petblue'}`}></div>
                          
                          <div className="pl-2">
                            <div className="flex justify-between items-start mb-3">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${isVaccine ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                {isVaccine ? 'Vacunación / Preventivo' : visitType}
                              </span>
                              <div className="flex items-center text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                <Calendar className="w-3 h-3 mr-1.5 text-slate-400" />
                                {new Date(record.created_at).toLocaleDateString("es-AR")}
                              </div>
                            </div>

                            {/* Signos Vitales (Si existen) */}
                            {hasVitals && (
                              <div className="flex gap-4 mb-3 pb-3 border-b border-slate-100">
                                {weight && (
                                  <div className="flex items-center text-sm text-slate-600">
                                    <Activity className="w-4 h-4 mr-1.5 text-petgreen" />
                                    <span className="font-semibold">{weight} kg</span>
                                  </div>
                                )}
                                {temperature && (
                                  <div className="flex items-center text-sm text-slate-600">
                                    <Activity className="w-4 h-4 mr-1.5 text-orange-400" />
                                    <span className="font-semibold">{temperature} °C</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Cuadro Clínico / Diagnóstico */}
                            {diagnosis && (
                              <div className="mb-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <FileText className="w-4 h-4 text-slate-400" />
                                  <h4 className="text-xs font-bold text-slate-500 uppercase">Observaciones</h4>
                                </div>
                                <p className="text-sm font-medium text-petblue leading-relaxed">{diagnosis}</p>
                              </div>
                            )}

                            {/* Detalle de Vacunas */}
                            {isVaccine && (
                              <div className="mb-3 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Syringe className="w-4 h-4 text-emerald-600" />
                                  <h4 className="text-xs font-bold text-emerald-800 uppercase">Detalle de Inoculación</h4>
                                </div>
                                {record.vaccine_details && <p className="text-sm font-medium text-slate-700">{record.vaccine_details}</p>}
                                {record.vaccine_batch && <p className="text-xs text-slate-500 mt-1">Lote: {record.vaccine_batch}</p>}
                              </div>
                            )}
                            
                            <div className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                              <span>Matriculado: <span className="font-bold text-slate-600">{record.vet_name || "Clínica Veterinaria"}</span></span>
                              {record.attachment_url && (
                                <a href={record.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-petblue font-bold hover:text-petgreen transition-colors bg-slate-100 px-2 py-1 rounded">
                                  <Paperclip className="w-3 h-3 mr-1" /> Adjunto
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                      <Stethoscope className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-medium">No hay registros médicos cargados.</p>
                    </div>
                  )}

                  {/* Botón secundario para expandir el historial clínico */}
                  <Link
                    href={`/vet/patient/${pet.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-petlight hover:bg-slate-100 text-petblue font-bold py-3 px-4 rounded-xl border border-petblue/20 transition-all active:scale-[0.98] mt-4"
                  >
                    <FileText className="w-4 h-4 text-petblue" />
                    <span>Ver más detalles clínicos</span>
                  </Link>
                  
                  {/* Botón de acceso exclusivo para Veterinarios */}
                  <Link
                    href={`/vet/patient/${pet.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] mt-2"
                  >
                    <Stethoscope className="w-4 h-4 text-petgreen" />
                    <span>Agregar Atención (Portal Veterinario)</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-petgreen hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contactar al Tutor de Urgencia</span>
              </a>
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