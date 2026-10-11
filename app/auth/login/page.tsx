"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-slate-700 font-medium"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-petblue hover:bg-[#0b1f33] text-white py-3 rounded-xl font-bold flex justify-center mt-6 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Acceder al Panel"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            ¿No tienes cuenta? <Link href="/auth/register" className="text-petgreen font-bold hover:underline">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </main>
  );
}