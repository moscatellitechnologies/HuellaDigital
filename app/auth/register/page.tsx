"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { User, Mail, Lock, Loader2, ShieldCheck, CreditCard, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
      // 1. Registro en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 2. Crear perfil de Tutor (Owner) con DNI
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

  return (
    <main className="min-h-screen bg-petlight flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <ShieldCheck className="w-12 h-12 text-petgreen mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-petblue">Crear Cuenta</h1>
          <p className="text-sm text-slate-500">Regístrate para proteger a tu mascota</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-4 text-center border border-red-100">{error}</div>}

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
            disabled={isLoading} 
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