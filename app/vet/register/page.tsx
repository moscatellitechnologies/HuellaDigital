"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope, ShieldAlert, Lock, Mail, Award, User, Loader2, ArrowRight, ArrowLeft, CheckCircle2, CreditCard, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function VetRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    dni: "",
    licenseNumber: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden. Verifícalas e intenta nuevamente.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Crear el usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error("No se pudo crear el usuario.");

      // 2. Insertar/Asegurar el perfil base primero con DNI
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert([{
          id: authData.user.id,
          full_name: formData.fullName,
          dni: formData.dni,
          role: 'vet',
          location: 'Misiones, Argentina' 
        }]);
        
      if (profileError) {
        if (profileError.code === '23505') {
          throw new Error("Este DNI ya se encuentra registrado en el sistema.");
        }
        throw new Error("Fallo al crear el perfil maestro: " + profileError.message);
      }

      // 3. Insertar el perfil profesional en estado "pending"
      const { error: vetError } = await supabase
        .from("vet_profiles")
        .insert([{
          id: authData.user.id,
          license_number: formData.licenseNumber,
          status: 'pending'
        }]);

      if (vetError) throw new Error("Fallo al registrar matrícula: " + vetError.message);

      setSuccess(true);
      
      // Redirigir al login después de unos segundos
      setTimeout(() => {
        router.push("/vet/login");
      }, 4000);

    } catch (error: any) {
      setErrorMessage(error.message || "Ocurrió un error en el registro.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-petlight flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
          <CheckCircle2 className="w-16 h-16 text-petgreen mx-auto mb-4" />
          <h2 className="text-xl font-bold text-petblue mb-2">¡Solicitud Enviada!</h2>
          <p className="text-slate-600 text-sm mb-4">
            Tu cuenta ha sido creada exitosamente. Actualmente, tu matrícula profesional <strong>{formData.licenseNumber}</strong> se encuentra en estado de <span className="font-bold text-yellow-600">Validación Pendiente</span>.
          </p>
          <p className="text-slate-500 text-xs">
            Redirigiendo al portal de acceso...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-petlight flex items-center justify-center p-4 overflow-x-hidden py-8">
      <div className="w-[90%] max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        <div className="bg-petblue text-white p-8 text-center relative">
          <div className="absolute top-4 left-4">
            <Link 
              href="/" 
              className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </Link>
          </div>

          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider text-petgreen border border-white/10">
              <ShieldAlert className="w-3 h-3 text-petgreen" />
              <span>Auditoría Estricta</span>
            </span>
          </div>

          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-inner">
            <Stethoscope className="w-7 h-7 text-petgreen" />
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white">
            Alta Profesional
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Registra tu matrícula para acceder al ecosistema HuellaDigital.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-medium border border-red-100 text-center">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                name="fullName"
                required
                placeholder="Dr. Juan Pérez"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 min-h-[44px] text-base bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              DNI (Sin puntos) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <CreditCard className="w-5 h-5" />
              </span>
              <input
                type="text"
                name="dni"
                required
                placeholder="Ej. 12345678"
                value={formData.dni}
                onChange={(e) => setFormData({...formData, dni: e.target.value.replace(/\D/g, '')})}
                className="w-full pl-10 pr-4 py-2 min-h-[44px] text-base bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Matrícula Profesional <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Award className="w-5 h-5" />
              </span>
              <input
                type="text"
                name="licenseNumber"
                required
                placeholder="Ej. MP Nº 1234"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 min-h-[44px] text-base bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Correo Institucional <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder="veterinario@colegio.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 min-h-[44px] text-base bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-2 min-h-[44px] text-base bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium placeholder-slate-400"
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Confirmar Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-2 min-h-[44px] text-base bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium placeholder-slate-400"
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

          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-petgreen hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Procesando Solicitud...</span>
                </>
              ) : (
                <>
                  <span>Enviar Solicitud de Alta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          
          <div className="text-center pt-2">
            <p className="text-[13px] text-slate-600 font-medium">
              ¿Ya tienes cuenta aprobada?{" "}
              <Link href="/vet/login" className="text-petblue font-bold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>

        </form>
      </div>
    </main>
  );
}