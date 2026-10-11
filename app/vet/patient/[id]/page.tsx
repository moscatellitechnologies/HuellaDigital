"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { 
  Stethoscope, 
  ArrowLeft, 
  PawPrint, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Syringe, 
  Thermometer, 
  Weight, 
  FilePlus, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle,
  Loader2
} from "lucide-react";

interface Consultation {
  id: string;
  created_at: string;
  visit_type: string;
  diagnosis: string;
  weight: string;
  temperature: string;
  vaccine_details: string | null;
  vetName: string;
  license: string;
}

function VetPatientDetailContent() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [vetProfile, setVetProfile] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  const [newConsultation, setNewConsultation] = useState({
    visit_type: "Consulta General",
    diagnosis: "",
    weight: "",
    temperature: "",
    vaccine_details: "",
  });

  useEffect(() => {
    async function loadPatientData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/vet/login");
          return;
        }

        // Obtener datos del veterinario
        const { data: vetData } = await supabase
          .from("profiles")
          .select("full_name, vet_profiles(license_number)")
          .eq("id", user.id)
          .single();
          
        setVetProfile({
          id: user.id,
          name: vetData?.full_name || "Veterinario",
          license: vetData?.vet_profiles?.[0]?.license_number || ""
        });

        // Validar si el veterinario tiene acceso a este paciente
        const { data: accessCheck } = await supabase
          .from("vet_patients")
          .select("id")
          .eq("vet_id", user.id)
          .eq("pet_id", patientId)
          .single();

        if (!accessCheck) {
          router.push("/vet/dashboard");
          return;
        }

        // Obtener datos de la mascota
        const { data: petData, error: petError } = await supabase
          .from("pets")
          .select(`
            *,
            profiles (full_name, location),
            cards (uid)
          `)
          .eq("id", patientId)
          .single();

        if (petError || !petData) throw petError;
        setPatient(petData);

        // Obtener historial de consultas usando las columnas correctas
        const { data: recordsData, error: recordsError } = await supabase
          .from("medical_records")
          .select(`
            *,
            profiles (full_name),
            vet_profiles (license_number)
          `)
          .eq("pet_id", patientId)
          .order("created_at", { ascending: false });

        if (!recordsError && recordsData) {
          const mappedRecords: Consultation[] = recordsData.map(r => ({
            id: r.id,
            created_at: new Date(r.created_at).toLocaleDateString("es-AR"),
            visit_type: r.visit_type,
            diagnosis: r.diagnosis,
            weight: r.weight,
            temperature: r.temperature,
            vaccine_details: r.vaccine_details,
            vetName: r.profiles?.full_name || "Dr. Desconocido",
            license: r.vet_profiles?.license_number || "S/M"
          }));
          setConsultations(mappedRecords);
        }

      } catch (error) {
        console.error("Error cargando ficha:", error);
        router.push("/vet/dashboard");
      } finally {
        setIsLoading(false);
      }
    }

    loadPatientData();
  }, [patientId, router]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setNewConsultation({
      ...newConsultation,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("medical_records")
        .insert([{
          pet_id: patientId,
          vet_id: vetProfile.id,
          visit_type: newConsultation.visit_type,
          diagnosis: newConsultation.diagnosis,
          weight: newConsultation.weight ? parseFloat(newConsultation.weight) : null,
          temperature: newConsultation.temperature ? parseFloat(newConsultation.temperature) : null,
          vaccine_details: newConsultation.vaccine_details || null
        }])
        .select()
        .single();

      if (error) throw error;

      // Agregar a la vista actual
      const entry: Consultation = {
        id: data.id,
        created_at: new Date(data.created_at).toLocaleDateString("es-AR"),
        visit_type: data.visit_type,
        diagnosis: data.diagnosis,
        weight: data.weight?.toString() || "-",
        temperature: data.temperature?.toString() || "-",
        vaccine_details: data.vaccine_details,
        vetName: vetProfile.name,
        license: vetProfile.license
      };

      setConsultations([entry, ...consultations]);
      if (data.weight) {
        setPatient({ ...patient, weight: data.weight });
      }

      setSuccessMessage(true);
      setNewConsultation({ visit_type: "Consulta General", diagnosis: "", weight: "", temperature: "", vaccine_details: "" });
      setTimeout(() => setSuccessMessage(false), 4000);

    } catch (err: any) {
      setErrorMessage(err.message || "Error al registrar la consulta");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-petlight flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-petgreen" />
      </div>
    );
  }

  if (!patient) return null;

  return (
    <main className="min-h-screen bg-petlight pb-12 overflow-x-hidden">
      
      <nav className="bg-petblue text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-3">
          <Link
            href="/vet/dashboard"
            className="flex items-center min-h-[44px] gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 text-petgreen" />
            <span>Volver al Padrón</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-500/20 text-petgreen min-h-[44px] flex items-center px-3 py-2 rounded-xl border border-emerald-500/30 font-semibold whitespace-nowrap">
              ● Modo Clínico Activo
            </span>
          </div>
        </div>
      </nav>

      <div className="w-[90%] sm:max-w-6xl mx-auto mt-8 space-y-6">
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full">
            <img
              src={patient.avatar_url || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80"}
              alt={patient.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-petblue">{patient.name}</h1>
                <span className="bg-petlight px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-600 border border-slate-200 mt-1 sm:mt-0">
                  UID: {patient.cards?.uid || "N/A"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {patient.species} • {patient.breed} • {patient.age || "Edad Desconocida"}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-medium">
                  <User className="w-3.5 h-3.5 text-petgreen" /> Tutor: {patient.profiles?.full_name || "Sin tutor"}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-petgreen" /> {patient.profiles?.location || "Ubicación desconocida"}
                </span>
              </div>
            </div>
          </div>

          {patient.emergency_notes && (
            <div className="bg-red-50 border border-red-200/80 rounded-xl p-4 w-full md:max-w-xs shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1 mb-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Alergias / Notas Críticas
              </span>
              <p className="text-xs text-red-900 leading-relaxed font-medium">
                {patient.emergency_notes}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4 h-fit">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-petblue flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-petgreen" />
                <span>Registrar Nueva Consulta</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Firma oficial vinculada a tu matrícula.</p>
            </div>

            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-pulse">
                <CheckCircle2 className="w-5 h-5 text-petgreen shrink-0" />
                <span>¡Consulta registrada y firmada!</span>
              </div>
            )}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveConsultation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Tipo de Atención <span className="text-red-500">*</span>
                </label>
                <select
                  name="visit_type"
                  value={newConsultation.visit_type}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
                >
                  <option value="Consulta General">Consulta General</option>
                  <option value="Vacunación">Vacunación</option>
                  <option value="Urgencia">Urgencia</option>
                  <option value="Cirugía / Procedimiento">Cirugía / Procedimiento</option>
                  <option value="Control Dermatológico">Control Dermatológico</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="weight"
                    placeholder="Ej. 32.8"
                    value={newConsultation.weight}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Temp. (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    placeholder="Ej. 38.4"
                    value={newConsultation.temperature}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Vacuna (Opcional)
                </label>
                <input
                  type="text"
                  name="vaccine_details"
                  placeholder="Ej. Séctuple (Lote #ST-441)"
                  value={newConsultation.vaccine_details}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Diagnóstico / Observaciones <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="diagnosis"
                  rows={4}
                  required
                  placeholder="Detalle hallazgos clínicos y tratamiento..."
                  value={newConsultation.diagnosis}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium resize-none placeholder-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-petgreen hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer text-sm mt-4"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Firmando Historia...</span>
                  </>
                ) : (
                  <span>Registrar y Firmar Historia</span>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-petblue">Historial Clínico Oficial</h2>
                <p className="text-xs text-slate-500 hidden sm:block">Registro cronológico inmutable de atenciones veterinarias.</p>
              </div>
              <span className="text-xs bg-petblue text-white px-3 py-1.5 rounded-lg font-bold whitespace-nowrap">
                {consultations.length} Entradas
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {consultations.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  No hay registros clínicos previos para este paciente.
                </div>
              ) : (
                consultations.map((item) => (
                  <div key={item.id} className="bg-petlight/60 rounded-2xl p-5 border border-slate-200/60 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/50 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-petblue text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                          {item.visit_type}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-petgreen" /> {item.created_at}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
                        <ShieldCheck className="w-4 h-4 text-petgreen shrink-0" />
                        <span className="truncate">{item.vetName} ({item.license})</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {item.diagnosis}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-600 font-medium">
                      {item.weight !== "-" && (
                        <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          <Weight className="w-3.5 h-3.5 text-petgreen" /> {item.weight} kg
                        </span>
                      )}
                      {item.temperature !== "-" && (
                        <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          <Thermometer className="w-3.5 h-3.5 text-petgreen" /> {item.temperature} °C
                        </span>
                      )}
                      {item.vaccine_details && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-100 font-semibold">
                          <Syringe className="w-3.5 h-3.5 text-petgreen" /> {item.vaccine_details}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}

export default function VetPatientDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-petlight flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-petgreen" />
      </div>
    }>
      <VetPatientDetailContent />
    </Suspense>
  );
}