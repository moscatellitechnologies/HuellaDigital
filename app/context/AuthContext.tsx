"use client";

import React, { createContext, useContext, useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRightLeft, Stethoscope, User as UserIcon } from "lucide-react";

type AuthContextType = {
  user: any | null;
  profile: any | null;
  activeRoleMode: "owner" | "vet";
  setActiveRoleMode: (mode: "owner" | "vet") => void;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  activeRoleMode: "owner",
  setActiveRoleMode: () => {},
  loading: true,
  signOut: async () => {},
});

// 1. Protector de Rutas (Acceso Permisivo + Blindaje Admin)
function RouteProtectorContent() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const isOwnerRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/activate");
      // SOLUCIÓN: Solo protegemos el panel del veterinario (/vet/dashboard). 
      // Liberamos /vet/patient para que en emergencias se pueda ver sin iniciar sesión.
      const isVetRoute = pathname.startsWith("/vet/dashboard"); 
      const isAdminRoute = pathname.startsWith("/admin");

      if (!user) {
        // Redirección para usuarios no autenticados
        if (isOwnerRoute) router.push("/auth/login");
        if (isVetRoute) router.push("/vet/login");
        if (isAdminRoute) router.push("/");
      } else if (profile) {
        // Validación de Rol Estricto para Clínicas
        if (isVetRoute && profile.role === "owner") {
          router.push("/dashboard");
        }
        
        // Validación ESTRICTA para Backoffice de Administración
        if (isAdminRoute) {
          const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@huelladigital.com";
          const isAuthorizedAdmin = (user.email === adminEmail) || profile.is_admin === true;
          
          if (!isAuthorizedAdmin) {
            router.push("/");
          }
        }
      }
    }
  }, [user, profile, loading, pathname, router]);

  return null;
}

function RouteProtector() {
  return (
    <Suspense fallback={null}>
      <RouteProtectorContent />
    </Suspense>
  );
}

// 2. Switcher de Roles Flotante
function RoleSwitcherContent() {
  const { user, profile, loading, setActiveRoleMode } = useAuth();
  const pathname = usePathname();

  // Solo se renderiza si está cargado, hay sesión y el usuario es Veterinario
  if (loading || !user || !profile || profile.role !== "vet") return null;

  // No mostrar en pantallas de login/registro
  if (pathname.includes("/login") || pathname.includes("/register")) return null;

  const isVetRoute = pathname.startsWith("/vet");
  const targetPath = isVetRoute ? "/dashboard" : "/vet/dashboard";
  const buttonText = isVetRoute ? "Modo Tutor" : "Portal Clínico";
  const Icon = isVetRoute ? UserIcon : Stethoscope;

  const handleSwitch = () => {
    const newMode = isVetRoute ? "owner" : "vet";
    setActiveRoleMode(newMode);
  };

  return (
    <div className="fixed bottom-6 right-6 z-999 animate-fade-in-up">
      <Link
        href={targetPath}
        onClick={handleSwitch}
        className="flex items-center gap-2.5 bg-petblue hover:bg-[#0b1f33] text-white px-5 py-3.5 rounded-full shadow-2xl border border-white/10 transition-all hover:scale-105 group cursor-pointer"
      >
        <ArrowRightLeft className="w-4 h-4 text-petgreen group-hover:rotate-180 transition-transform duration-500" />
        <span className="text-xs font-bold tracking-wide">{buttonText}</span>
        <Icon className="w-4 h-4 ml-1 opacity-80" />
      </Link>
    </div>
  );
}

export function RoleSwitcherGlobal() {
  return (
    <Suspense fallback={null}>
      <RoleSwitcherContent />
    </Suspense>
  );
}

// 3. Proveedor Principal
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [activeRoleMode, setActiveRoleModeState] = useState<"owner" | "vet">("owner");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Persistir la preferencia de modo de rol activo
  const setActiveRoleMode = (mode: "owner" | "vet") => {
    setActiveRoleModeState(mode);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("active_role_mode", mode);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Cargar preferencia almacenada si existe
    if (typeof window !== "undefined") {
      const savedMode = sessionStorage.getItem("active_role_mode") as "owner" | "vet";
      if (savedMode) setActiveRoleModeState(savedMode);
    }

    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            await loadProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error("Error al obtener sesión:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            await loadProfile(session.user.id);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
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
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("active_role_mode");
    }
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, profile, activeRoleMode, setActiveRoleMode, loading, signOut }}>
      <RouteProtector />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);