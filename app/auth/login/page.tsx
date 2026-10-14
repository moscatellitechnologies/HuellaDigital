"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        throw new Error("Credenciales incorrectas. Verifica tu correo y contraseña.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      // Detección inteligente de URL para Vercel o Entorno Local
      const getURL = () => {
        let url =
          process?.env?.NEXT_PUBLIC_SITE_URL ?? // Fija en producción
          process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automática de Vercel
          'http://localhost:3000'; // Fallback local
        url = url.includes('http') ? url : `https://${url}`;
        url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
        return url;
      };

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${getURL()}dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-petlight flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-petlight rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <ShieldCheck className="w-8 h-8 text-petgreen" />
          </div>
          <h1 className="text-2xl font-bold text-petblue">Iniciar Sesión</h1>
          <p className="text-sm text-slate-500 mt-1">Portal de Tutores Responsables</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input 
                type="email" 
                required 
                placeholder="tu@correo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-slate-700 font-medium"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input 
                type={showPassword ? "text" : "password"}
                required 
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-slate-700 font-medium"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-petgreen transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || isGoogleLoading} 
            className="w-full bg-petblue hover:bg-[#0b1f33] text-white py-3 rounded-xl font-bold flex justify-center mt-6 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Acceder al Panel"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">O continuar con</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
          className="w-full mt-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-sm"
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
              <span>Acceder con Google</span>
            </>
          )}
        </button>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            ¿No tienes cuenta? <Link href="/auth/register" className="text-petgreen font-bold hover:underline">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </main>
  );
}