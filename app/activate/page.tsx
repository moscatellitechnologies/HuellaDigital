"use client";

import React, { useState, Suspense, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { 
  ShieldCheck, 
  PawPrint, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  ChevronDown,
  X,
  Camera
} from "lucide-react";

const DOG_BREEDS = [
  "Golden Retriever", "Labrador Retriever", "Pastor Alemán", "Caniche", 
  "Bulldog Francés", "Bulldog Inglés", "Beagle", "Boxer", "Pitbull", 
  "Mestizo / Cruza", "Schnauzer", "Dachshund (Salchicha)", "Shih Tzu", 
  "Caniche Toy", "Border Collie", "Rottweiler", "Husky Siberiano", 
  "Yorkshire Terrier", "Cocker Spaniel", "Dogo Argentino"
];

const CAT_BREEDS = [
  "Siamés", "Persa", "Maine Coon", "Angora Turco", "Ragdoll", 
  "Sphynx (Egipcio)", "British Shorthair", "Scottish Fold", 
  "Común Europeo (Mestizo)", "Bengalí", "Azul Ruso", "Abisinio"
];

const MISIONES_LOCATIONS = [
  "Posadas, Misiones", "Oberá, Misiones", "Eldorado, Misiones", 
  "Puerto Iguazú, Misiones", "Apóstoles, Misiones", "Leandro N. Alem, Misiones", 
  "San Vicente, Misiones", "Puerto Rico, Misiones", "Montecarlo, Misiones", 
  "Jardín América, Misiones", "Garupá, Misiones", "Candelaria, Misiones"
];

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth(); 
  
  const storedUid = typeof window !== 'undefined' ? sessionStorage.getItem('pending_activation_uid') : null;
  const initialUid = searchParams.get("uid") || storedUid || "";
  
  const [uid, setUid] = useState(initialUid);
  const [isUidConfirmed, setIsUidConfirmed] = useState(!!initialUid);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    petName: "",
    species: "Perro",
    breed: "",
    age: "",
    ownerName: "",
    email: "",
    phone: "",
    location: "Posadas, Misiones",
    medicalCondition: "",
  });

  const [filteredBreeds, setFilteredBreeds] = useState<string[]>([]);
  const [showBreedSuggestions, setShowBreedSuggestions] = useState(false);
  const breedRef = useRef<HTMLDivElement>(null);

  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && formData.ownerName === "") {
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (data) {
          setFormData(prev => ({
            ...prev,
            ownerName: data.full_name || "",
            email: user.email || ""
          }));
        }
      };
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (breedRef.current && !breedRef.current.contains(event.target as Node)) {
        setShowBreedSuggestions(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUidConfirmation = () => {
    if (uid.trim()) {
      sessionStorage.setItem('pending_activation_uid', uid);
      if (!user) {
        router.push("/auth/login?redirect=/activate");
        return;
      }
      setIsUidConfirmed(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-petlight flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-petgreen" />
      </div>
    );
  }

  if (!isUidConfirmed || !user) {
    return (
      <main className="min-h-screen bg-petlight flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
          <ShieldCheck className="w-16 h-16 text-petgreen mx-auto mb-4" />
          <h2 className="text-xl font-bold text-petblue mb-2">Vincular Tarjeta NFC</h2>
          <p className="text-sm text-slate-500 mb-6">Ingresa el código único (UID) impreso en tu tarjeta o generado en el sistema.</p>
          
          <input 
            type="text" 
            placeholder="Ej. nfc_test_001" 
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            className="w-full text-center py-3 border border-slate-200 rounded-xl mb-4 font-mono font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-petgreen"
          />
          
          <button 
            onClick={handleUidConfirmation}
            className="w-full bg-petblue hover:bg-[#0b1f33] text-white py-3 rounded-xl font-bold transition-all active:scale-[0.98]"
          >
            {user ? "Continuar con la Activación" : "Inicia Sesión para Activar"}
          </button>
        </div>
      </main>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "species") {
      setFormData((prev) => ({
        ...prev,
        species: value,
        breed: "",
      }));
      setShowBreedSuggestions(false);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "breed") {
      if (formData.species === "Otro") {
        setShowBreedSuggestions(false);
        return;
      }

      if (value.trim().length > 0) {
        const sourceList = formData.species === "Gato" ? CAT_BREEDS : DOG_BREEDS;
        const filtered = sourceList.filter((b) =>
          b.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredBreeds(filtered);
        setShowBreedSuggestions(true);
      } else {
        setFilteredBreeds([]);
        setShowBreedSuggestions(false);
      }
    }

    if (name === "location") {
      if (value.trim().length > 0) {
        const filtered = MISIONES_LOCATIONS.filter((loc) =>
          loc.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredLocations(filtered);
        setShowLocationSuggestions(true);
      } else {
        setFilteredLocations([]);
        setShowLocationSuggestions(false);
      }
    }
  };

  const handleSelectBreed = (breedName: string) => {
    setFormData((prev) => ({ ...prev, breed: breedName }));
    setShowBreedSuggestions(false);
  };

  const handleSelectLocation = (locName: string) => {
    setFormData((prev) => ({ ...prev, location: locName }));
    setShowLocationSuggestions(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (!user) {
        throw new Error("Debes iniciar sesión para registrar una mascota.");
      }

      const { data: cardData, error: cardError } = await supabase
        .from('cards')
        .select('id, is_active')
        .eq('uid', uid)
        .single();

      if (cardError || !cardData) {
        throw new Error(`La tarjeta NFC (${uid}) no está registrada en el inventario del sistema.`);
      }
      
      if (cardData.is_active) {
        throw new Error("Esta tarjeta NFC ya se encuentra vinculada a una mascota.");
      }

      let publicAvatarUrl = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400";
      
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${uid}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('pet-avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) {
          throw new Error("No se pudo subir la fotografía. Verifica los permisos de Storage.");
        }

        const { data: urlData } = supabase.storage
          .from('pet-avatars')
          .getPublicUrl(fileName);
          
        publicAvatarUrl = urlData.publicUrl;
      }

      const { data: insertedPet, error: petError } = await supabase
        .from('pets')
        .insert([{
          card_id: cardData.id,
          owner_id: user.id,
          name: formData.petName,
          species: formData.species,
          breed: formData.breed || "No especificada",
          age: formData.age || "No especificada",
          avatar_url: publicAvatarUrl,
          emergency_notes: formData.medicalCondition
        }])
        .select('id')
        .single();

      if (petError) {
        console.error(petError);
        throw new Error("Ocurrió un error interno al registrar los datos biométricos de la mascota.");
      }

      const { error: cardUpdateError } = await supabase
        .from('cards')
        .update({ is_active: true })
        .eq('id', cardData.id);

      if (cardUpdateError) {
        throw new Error("Mascota registrada, pero falló la actualización del estado de la tarjeta.");
      }

      sessionStorage.removeItem('pending_activation_uid');
      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/pet/${insertedPet.id}`);
      }, 2000);

    } catch (error: any) {
      setErrorMessage(error.message || "Error inesperado al vincular la tarjeta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-petlight flex items-center justify-center p-0 sm:py-8 sm:px-4 overflow-x-hidden">
      <div className="w-[90%] mx-auto max-w-md bg-white min-h-screen sm:min-h-0 sm:rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between border border-slate-100 my-4 sm:my-0 relative">
        
        <div className="absolute top-4 right-4 z-10">
          <Link 
            href="/" 
            className="flex items-center justify-center min-w-[44px] min-h-[44px] bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md border border-white/20"
            aria-label="Cancelar y volver al inicio"
          >
            <X className="w-5 h-5 text-white" />
          </Link>
        </div>

        <div>
          <div className="bg-petblue text-white px-6 pt-8 pb-10 text-center relative">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium tracking-wide text-petgreen border border-white/10 mb-3 mt-2">
              <ShieldCheck className="w-4 h-4 text-petgreen" />
              <span>Activación de Dispositivo NFC</span>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-white">
              ¡Estás a un paso de proteger a tu mascota!
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
              Completando datos para la tarjeta detectada.
            </p>

            <div className="mt-4 inline-block bg-slate-900/50 text-slate-200 text-xs px-3 py-1 rounded-md font-mono border border-white/10">
              UID Chip: <span className="text-petgreen font-semibold">{uid}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            {isSuccess ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-petgreen mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-petblue">¡Tarjeta Vinculada con Éxito!</h3>
                <p className="text-base text-slate-500">Redirigiendo a la ficha médica...</p>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-semibold border border-red-200 text-center mb-4 flex flex-col items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {errorMessage}
                  </div>
                )}

                <div className="flex flex-col items-center justify-center mb-6">
                  <label htmlFor="avatar-upload" className="relative cursor-pointer group">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-petgreen group-hover:bg-petgreen/5">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-slate-400 group-hover:text-petgreen mb-1" />
                          <span className="text-[10px] text-slate-500 font-medium group-hover:text-petgreen">Subir Foto</span>
                        </>
                      )}
                    </div>
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Nombre de la Mascota <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <PawPrint className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      name="petName"
                      required
                      placeholder="Ej. Simba, Luna, Rocco"
                      value={formData.petName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue placeholder-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Especie <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="species"
                      value={formData.species}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
                    >
                      <option value="Perro">Perro</option>
                      <option value="Gato">Gato</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Edad (Opcional)
                    </label>
                    <input
                      type="text"
                      name="age"
                      placeholder="Ej. 3 años"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue placeholder-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div className="relative" ref={breedRef}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {formData.species === "Otro" ? "Especie / Raza Detalle" : "Raza (Opcional)"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="breed"
                      placeholder={
                        formData.species === "Gato"
                          ? "Ej. Siamés, Persa..."
                          : formData.species === "Perro"
                          ? "Ej. Golden Retriever..."
                          : "Ej. Serpiente Boa, Loro..."
                      }
                      value={formData.breed}
                      onChange={handleChange}
                      onFocus={() => {
                        if (formData.species !== "Otro" && formData.breed.trim().length > 0) {
                          setShowBreedSuggestions(true);
                        }
                      }}
                      autoComplete="off"
                      className="w-full pl-4 pr-10 py-2.5 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue placeholder-slate-400 font-medium"
                    />
                    {formData.species !== "Otro" && (
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {showBreedSuggestions && formData.species !== "Otro" && filteredBreeds.length > 0 && (
                    <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredBreeds.map((breedName, idx) => (
                        <li
                          key={idx}
                          onClick={() => handleSelectBreed(breedName)}
                          className="px-4 py-2 text-base min-h-[44px] flex items-center text-slate-700 hover:bg-petlight hover:text-petblue cursor-pointer transition-colors border-b border-slate-50 last:border-none font-medium"
                        >
                          {breedName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <hr className="border-slate-100 my-2" />

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Nombre del Tutor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      name="ownerName"
                      required
                      placeholder="Tu nombre y apellido"
                      value={formData.ownerName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue placeholder-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="tucorreo@ejemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue placeholder-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="+54 9 376..."
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2.5 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue placeholder-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  <div className="relative" ref={locationRef}>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Localidad <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        name="location"
                        required
                        placeholder="Posadas, Misiones"
                        value={formData.location}
                        onChange={handleChange}
                        onFocus={() => {
                          if (formData.location.trim().length > 0) setShowLocationSuggestions(true);
                        }}
                        autoComplete="off"
                        className="w-full pl-10 pr-8 py-2.5 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue placeholder-slate-400 font-medium"
                      />
                      <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    {showLocationSuggestions && filteredLocations.length > 0 && (
                      <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredLocations.map((locName, idx) => (
                          <li
                            key={idx}
                            onClick={() => handleSelectLocation(locName)}
                            className="px-4 py-2 text-base min-h-[44px] flex items-center text-slate-700 hover:bg-petlight hover:text-petblue cursor-pointer transition-colors border-b border-slate-50 last:border-none font-medium"
                          >
                            {locName}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Notas Médicas / Alergias
                  </label>
                  <div className="relative">
                    <span className="absolute top-3 left-3 pointer-events-none text-slate-400">
                      <AlertCircle className="w-4 h-4" />
                    </span>
                    <textarea
                      name="medicalCondition"
                      rows={2}
                      placeholder="Ej. Alérgico a medicamentos..."
                      value={formData.medicalCondition}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue placeholder-slate-400 font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 min-h-[44px] bg-petgreen hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Vinculando Tarjeta...</span>
                      </>
                    ) : (
                      <span>Vincular Tarjeta y Activar</span>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <div className="py-4 px-6 text-center border-t border-slate-100 bg-slate-50/50 mt-auto">
          <p className="text-xs text-slate-400 font-medium">
            Protegido por HuellaDigital • Misiones, Argentina
          </p>
        </div>

      </div>
    </main>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-petlight flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-petgreen" />
      </div>
    }>
      <ActivateContent />
    </Suspense>
  );
}