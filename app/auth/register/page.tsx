"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { User, Mail, Lock, Loader2, ShieldCheck, CreditCard, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({ 
    fullName: "", 
    dni: "",
    email: "", 
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden. Verifícalas e intenta nuevamente.");
      setIsLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert([{
          id: authData.user.id,
          full_name: formData.fullName,
          dni: formData.dni,
          role: "owner",
          location: "Misiones, Argentina" 
        }]);

        if (profileError) {
          if (profileError.code === '23505') {
            throw new Error("Este DNI ya se encuentra registrado en el sistema.");
          }
          console.error("Error al crear perfil:", profileError);
          throw new Error("Ocurrió un error al guardar los datos del perfil.");
        }
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al registrar la cuenta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Error al registrarse con Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-petlight flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100 my-8">
        <div className="text-center mb-8">
          <ShieldCheck className="w-12 h-12 text-petgreen mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-petblue">Crear Cuenta</h1>
          <p className="text-sm text-slate-500">Regístrate para proteger a tu mascota</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-4 text-center border border-red-100">{error}</div>}

        <button 
          onClick={handleGoogleRegister}
          disabled={isLoading || isGoogleLoading}
          className="w-full mb-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-sm"
        >
          {isGoogleLoading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Registrarse con Google</span>
            </>
          )}
        </button>

        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">O con tu correo</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre Completo</label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <input 
                type="text" 
                required 
                placeholder="Ej. Santiago Moscatelli"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-slate-800 font-medium placeholder:text-slate-400"
                value={formData.fullName} 
                onChange={e => setFormData({...formData, fullName: e.target.value})} 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">DNI (Sin puntos)</label>
            <div className="relative">
              <CreditCard className="w-5 h-5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <input 
                type="text" 
                required 
                placeholder="Ej. 12345678"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-slate-800 font-medium placeholder:text-slate-400"
                value={formData.dni} 
                onChange={e => setFormData({...formData, dni: e.target.value.replace(/\D/g, '')})} 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <input 
                type="email" 
                required 
                placeholder="tu@correo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-slate-800 font-medium placeholder:text-slate-400"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                minLength={6}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-slate-800 font-medium placeholder:text-slate-400"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-petgreen transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Confirmar Contraseña</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                required 
                minLength={6}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-slate-800 font-medium placeholder:text-slate-400"
                value={formData.confirmPassword} 
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-petgreen transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || isGoogleLoading} 
            className="w-full bg-petgreen hover:bg-emerald-600 text-white py-3 rounded-xl font-bold flex justify-center items-center mt-6 transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer shadow-md shadow-emerald-600/20"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Registrarse"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-600">
          ¿Ya tienes cuenta? <Link href="/auth/login" className="text-petgreen font-bold hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}