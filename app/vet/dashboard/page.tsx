"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Stethoscope, 
  Search, 
  LogOut, 
  Calendar, 
  ArrowUpRight,
  PawPrint,
  Loader2,
  ScanLine,
  AlertCircle
} from "lucide-react";

interface PatientRecord {
  id: string;
  name: string;
  species: string;
  breed: string;
  ownerName: string;
  lastVisit: string;
  uid: string;
  status: string;
}

export default function VetDashboardPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [scanUid, setScanUid] = useState("");
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [vetProfile, setVetProfile] = useState<any>(null);

  useEffect(() => {
    async function loadVetDashboard() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/vet/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, vet_profiles(license_number)")
          .eq("id", user.id)
          .single();
        
        if (profile) setVetProfile(profile);

        // 3. Consultar SOLO los pacientes vinculados a este veterinario
        const { data: vetPatients, error } = await supabase
          .from("vet_patients")
          .select(`
            pet_id,
            first_scanned_at,
            pets (
              id,
              name,
              species,
              breed,
              emergency_notes,
              created_at,
              profiles (full_name),
              cards (uid)
            )
          `)
          .eq("vet_id", user.id)
          .order("first_scanned_at", { ascending: false });

        if (error) throw error;

        if (vetPatients) {
          const formattedPatients: PatientRecord[] = vetPatients
            .filter((vp: any) => vp.pets !== null)
            .map((vp: any) => {
              // Extraer UID asegurando compatibilidad si Supabase devuelve Objeto o Array
              const cards = vp.pets.cards;
              const uid = Array.isArray(cards) && cards.length > 0 
                ? cards[0].uid 
                : (cards?.uid || "Sin chip vinculado");

              return {
                id: vp.pets.id,
                name: vp.pets.name,
                species: vp.pets.species,
                breed: vp.pets.breed,
                ownerName: vp.pets.profiles?.full_name || "Desconocido",
                uid: uid,
                lastVisit: new Date(vp.first_scanned_at).toLocaleDateString("es-AR"),
                status: vp.pets.emergency_notes ? "Con Condición Médica" : "Estable"
              };
            });
          setPatients(formattedPatients);
        }

      } catch (error) {
        console.error("Error cargando pacientes:", error);
      } finally {
        setLoading(false);
      }
    }

    loadVetDashboard();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/vet/login");
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanUid.trim()) return;
    
    setScanning(true);
    setScanError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión expirada");

      // Buscar la tarjeta y la mascota asociada
      const { data: cardData, error: cardError } = await supabase
        .from("cards")
        .select("id, pets(id)")
        .eq("uid", scanUid.trim())
        .single();

      if (cardError || !cardData || !cardData.pets) {
        throw new Error("UID no encontrado o no asignado a ninguna mascota.");
      }

      // Solución: Detectar si 'pets' es un Array (lista) o un Objeto singular
      const petId = Array.isArray(cardData.pets) 
        ? cardData.pets[0]?.id 
        : (cardData.pets as any).id;

      if (!petId) {
        throw new Error("La tarjeta encontrada no tiene una mascota válida asociada.");
      }

      // Intentar vincular (si ya existe fallará por el constraint único y lo ignoramos)
      const { error: insertError } = await supabase
        .from("vet_patients")
        .insert([{ vet_id: user.id, pet_id: petId }]);

      if (insertError && insertError.code !== '23505') { // 23505 es unique_violation
        throw insertError;
      }

      // Redirigir a la ficha clínica
      router.push(`/vet/patient/${petId}`);

    } catch (err: any) {
      setScanError(err.message || "Error al escanear la tarjeta.");
    } finally {
      setScanning(false);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-petlight flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-petgreen" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-petlight pb-12 overflow-x-hidden">
      
      <nav className="bg-petblue text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
              <Stethoscope className="w-5 h-5 text-petgreen" />
            </div>
            <div>
              <span className="font-bold tracking-wide text-base block">Portal Clínico</span>
              <span className="text-xs text-slate-300">
                {vetProfile?.full_name || "Veterinario"} • {vetProfile?.vet_profiles?.[0]?.license_number || "Matrícula Verificada"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs bg-emerald-500/20 text-petgreen px-3 py-2 min-h-[44px] flex items-center rounded-xl border border-emerald-500/30 font-semibold whitespace-nowrap">
              ● Sesión Segura
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center min-h-[44px] gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold py-2 px-4 rounded-xl border border-red-500/30 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="w-[90%] sm:max-w-6xl mx-auto mt-8 space-y-6">
        
        {/* Módulo Scan-to-Access */}
        <div className="bg-petblue rounded-2xl p-6 shadow-md border border-slate-700">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-petgreen" /> Escanear Nuevo Paciente
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Acerque la tarjeta NFC al dispositivo o ingrese el UID manualmente para acceder a la historia clínica.
              </p>
            </div>
            <form onSubmit={handleScanSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Ej. nfc_test_001"
                value={scanUid}
                onChange={(e) => setScanUid(e.target.value)}
                className="w-full md:w-64 px-4 py-3 min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-white font-mono placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={scanning || !scanUid.trim()}
                className="min-h-[44px] flex items-center justify-center gap-2 bg-petgreen hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all disabled:opacity-70"
              >
                {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : "Acceder Ficha"}
              </button>
            </form>
          </div>
          {scanError && (
            <div className="mt-4 bg-red-500/20 text-red-200 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-500/30">
              <AlertCircle className="w-4 h-4" /> {scanError}
            </div>
          )}
        </div>

        {/* Buscador Padrón Interno */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-petblue">Mi Padrón de Pacientes</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtre únicamente entre las mascotas que usted ha atendido.
            </p>
          </div>

          <div className="w-full md:w-80 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Buscar paciente o tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 min-h-[44px] text-base bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue placeholder-slate-400 font-medium"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-petblue">Pacientes Recientes</h2>
            </div>
            <span className="text-xs bg-petblue text-white px-3 py-1.5 rounded-lg font-bold">
              {filteredPatients.length} Registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-petlight text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-6">Paciente</th>
                  <th className="py-3 px-6">Especie / Raza</th>
                  <th className="py-3 px-6">Tutor Responsable</th>
                  <th className="py-3 px-6">UID NFC</th>
                  <th className="py-3 px-6">Estado Clínico</th>
                  <th className="py-3 px-6 text-right">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-petlight flex items-center justify-center text-petblue border border-slate-200 shrink-0">
                            <PawPrint className="w-5 h-5 text-petgreen" />
                          </div>
                          <div>
                            <span className="font-bold text-petblue block">{patient.name}</span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> 1er Contacto: {patient.lastVisit}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs">
                        <span className="font-bold text-petblue block">{patient.species}</span>
                        <span className="text-slate-500">{patient.breed}</span>
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-slate-600">
                        {patient.ownerName}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-petlight px-2.5 py-1.5 rounded-md text-[11px] font-mono text-slate-600 border border-slate-200 whitespace-nowrap">
                          {patient.uid}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-semibold border whitespace-nowrap ${
                          patient.status === "Estable" 
                            ? "text-emerald-700 bg-emerald-50 border-emerald-100" 
                            : "text-amber-700 bg-amber-50 border-amber-100"
                        }`}>
                          ● {patient.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/vet/patient/${patient.id}`}
                          className="inline-flex items-center justify-center gap-1 bg-petgreen hover:bg-emerald-600 text-white text-xs font-bold py-2 min-h-[44px] px-3.5 rounded-xl shadow-sm transition-all whitespace-nowrap"
                        >
                          <span>Abrir Ficha</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No se encontraron pacientes en tu padrón. Escanea una tarjeta NFC para registrar tu primera atención.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}