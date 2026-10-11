"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  ShieldCheck, 
  PlusCircle, 
  LogOut, 
  PawPrint, 
  Settings, 
  ExternalLink,
  Loader2,
  User
} from "lucide-react";

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/auth/login");
          return;
        }

        const ownerId = user.id;

        // 2. Obtener perfil del tutor
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", ownerId)
          .single();
          
        if (profile) setUserProfile(profile);

        // 3. Obtener mascotas vinculadas a este tutor
        const { data: petsData, error: petsError } = await supabase
          .from("pets")
          .select(`
            *,
            cards (uid)
          `)
          .eq("owner_id", ownerId)
          .order("created_at", { ascending: false });

        if (petsError) throw petsError;
        setPets(petsData || []);

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

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
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-petgreen" />
            <span className="font-bold tracking-wide">Mi Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium bg-white/10 px-3 py-2 rounded-xl border border-white/10">
              <User className="w-4 h-4 text-petgreen" />
              <span>{userProfile?.full_name || "Tutor Responsable"}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center min-h-[44px] gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold py-2 px-4 rounded-xl border border-red-500/30 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="w-[90%] sm:max-w-6xl mx-auto mt-8 space-y-6">
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-petblue">Mis Mascotas Vinculadas</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Gestiona los perfiles de emergencia y dispositivos NFC de tu familia.
            </p>
          </div>
          <Link
            href="/activate"
            className="w-full md:w-auto min-h-[44px] flex items-center justify-center gap-2 bg-petgreen hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Vincular Nueva Tarjeta NFC</span>
          </Link>
        </div>

        {pets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <PawPrint className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-lg font-bold text-slate-700">Aún no tienes mascotas vinculadas</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              Adquiere una tarjeta NFC de HuellaDigital en tu veterinaria más cercana y vincúlala aquí para proteger a tu mascota.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pets.map((pet) => {
              // Extraer el UID correctamente del arreglo
              const uid = Array.isArray(pet.cards) && pet.cards.length > 0 
                ? pet.cards[0].uid 
                : pet.cards?.uid;

              return (
                <div key={pet.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                  <div className="h-32 bg-slate-100 relative">
                    <img 
                      src={pet.avatar_url || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"} 
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-petblue text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1 uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3 text-petgreen" />
                      Activa
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-petblue">{pet.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-4">
                      {pet.species} • {pet.breed} • {pet.age}
                    </p>
                    
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 mt-auto">
                      <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">UID Tarjeta NFC</span>
                      <span className="font-mono text-xs text-slate-700 font-medium">
                        {uid || "Sin asignar"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/pet/${pet.id}`}
                        className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-petlight hover:bg-slate-100 text-petblue text-xs font-bold py-2 rounded-xl transition-all border border-slate-200"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Ver Perfil</span>
                      </Link>
                      <Link
                        href={`/dashboard/pet/${pet.id}/edit`}
                        className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-petblue hover:bg-[#0b1f33] text-white text-xs font-bold py-2 rounded-xl shadow-sm transition-all"
                      >
                        <Settings className="w-4 h-4 text-petgreen" />
                        <span>Editar</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}