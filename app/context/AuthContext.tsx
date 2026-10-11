"use client";

import React, { createContext, useContext, useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRightLeft, Stethoscope, User as UserIcon } from "lucide-react";

type AuthContextType = {
  user: any | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

// 1. Protector de Rutas Modificado (Soporte Rol Dual)
function RouteProtector() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const isOwnerRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/activate");
      const isVetRoute = pathname.startsWith("/vet/dashboard") || pathname.startsWith("/vet/patient");

      if (!user) {
        // Redirección para usuarios no autenticados
        if (isOwnerRoute) router.push("/auth/login");
        if (isVetRoute) router.push("/vet/login");
      } else if (profile) {
        // Si es un Tutor ("owner"), NO puede entrar al portal clínico
        if (isVetRoute && profile.role === "owner") {
          router.push("/dashboard");
        }
        // NOTA DE REFACTORIZACIÓN: 
        // Si el usuario es Veterinario ("vet"), le damos acceso a AMBAS zonas.
        // Se eliminó la restricción que lo forzaba a salir de /dashboard.
      }
    }
  }, [user, profile, loading, pathname, router]);

  return null;
}

// 2. Componente Global para el Switcher de Roles (Solo visible para Veterinarios)
export function RoleSwitcherGlobal() {
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();

  // Solo se renderiza si está cargado, hay sesión y el usuario es Veterinario
  if (loading || !user || !profile || profile.role !== "vet") return null;

  // No mostrar en pantallas de login/registro para evitar superposiciones
  if (pathname.includes("/login") || pathname.includes("/register")) return null;

  const isVetRoute = pathname.startsWith("/vet");
  const targetPath = isVetRoute ? "/dashboard" : "/vet/dashboard";
  const buttonText = isVetRoute ? "Modo Tutor" : "Modo Clínico";
  const Icon = isVetRoute ? UserIcon : Stethoscope;

  return (
    <div className="fixed bottom-6 right-6 z-[999] animate-fade-in-up">
      <Link
        href={targetPath}
        className="flex items-center gap-2.5 bg-petblue hover:bg-[#0b1f33] text-white px-5 py-3.5 rounded-full shadow-2xl border border-white/10 transition-all hover:scale-105 group"
      >
        <ArrowRightLeft className="w-4 h-4 text-petgreen group-hover:rotate-180 transition-transform duration-500" />
        <span className="text-xs font-bold tracking-wide">{buttonText}</span>
        <Icon className="w-4 h-4 ml-1 opacity-80" />
      </Link>
    </div>
  );
}

// 3. Proveedor Principal
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error al obtener sesión:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      <Suspense fallback={null}>
        <RouteProtector />
      </Suspense>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);