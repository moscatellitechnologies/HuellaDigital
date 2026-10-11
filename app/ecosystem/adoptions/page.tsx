"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  HeartHandshake, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  PlusCircle, 
  ArrowLeft, 
  PawPrint,
  X,
  Loader2
} from "lucide-react";

interface AdoptionItem {
  id: string;
  name: string;
  type: "adoption" | "lost";
  species: string;
  breed: string;
  location: string;
  description: string;
  contactPhone: string;
  contactName: string;
  photoUrl: string;
  date: string;
  urgency?: boolean;
}

const initialPosts: AdoptionItem[] = [
  {
    id: "1",
    name: "Toby",
    type: "adoption",
    species: "Canino",
    breed: "Mestizo / Cruza",
    location: "Posadas, Misiones",
    description: "Toby tiene 8 meses, es muy juguetón, sociable con otros perros y ya está vacunado. Busca una familia responsable.",
    contactPhone: "+54 9 376 4111111",
    contactName: "Refugio Patitas Felices",
    photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400",
    date: "04/04/2026"
  },
  {
    id: "2",
    name: "Mila",
    type: "adoption",
    species: "Felino",
    breed: "Común Europeo",
    location: "Oberá, Misiones",
    description: "Gatita esterilizada de 1 año. Muy tranquila y regalona, ideal para departamento o casa cerrada.",
    contactPhone: "+54 9 375 5222222",
    contactName: "Red de Rescate Oberá",
    photoUrl: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=400",
    date: "02/04/2026"
  },
  {
    id: "3",
    name: "Bruno (Extraviado)",
    type: "lost",
    species: "Canino",
    breed: "Beagle",
    location: "Posadas (Zona Av. Mitre)",
    description: "Se perdió el domingo asustado por los ruidos. Lleva collar azul con chapita. Ofrecemos recompensa.",
    contactPhone: "+54 9 376 4333333",
    contactName: "Esteban (Tutor)",
    photoUrl: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=400",
    date: "05/04/2026",
    urgency: true
  },
  {
    id: "4",
    name: "Luna (Vista en la calle)",
    type: "lost",
    species: "Canino",
    breed: "Caniche Toy",
    location: "Eldorado, Misiones",
    description: "Fue vista merodeando cerca de la plaza central. Parece desorientada y con hambre. Alguien la está resguardando temporalmente.",
    contactPhone: "+54 9 375 1444444",
    contactName: "Carla (Rescatista)",
    photoUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400",
    date: "06/04/2026",
    urgency: true
  }
];

export default function EcosystemAdoptionsPage() {
  const [activeTab, setActiveTab] = useState<"adoption" | "lost">("adoption");
  const [posts, setPosts] = useState<AdoptionItem[]>(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar publicaciones guardadas al montar para evitar errores de hidratación
  useEffect(() => {
    const saved = localStorage.getItem("huelladigital_adoptions");
    if (saved) {
      try {
        setPosts(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved adoptions", e);
      }
    }
  }, []);

  const [newPost, setNewPost] = useState({
    name: "",
    type: "adoption" as "adoption" | "lost",
    species: "Canino",
    breed: "",
    location: "Posadas, Misiones",
    description: "",
    contactPhone: "",
    contactName: "",
    photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"
  });

  const filteredPosts = posts.filter((p) => p.type === activeTab);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const created: AdoptionItem = {
        id: `post_${Date.now()}`,
        ...newPost,
        date: new Date().toLocaleDateString("es-AR"),
        urgency: newPost.type === "lost"
      };

      const updatedPosts = [created, ...posts];
      setPosts(updatedPosts);
      localStorage.setItem("huelladigital_adoptions", JSON.stringify(updatedPosts));

      setIsSubmitting(false);
      setIsModalOpen(false);
      setNewPost({
        name: "",
        type: "adoption",
        species: "Canino",
        breed: "",
        location: "Posadas, Misiones",
        description: "",
        contactPhone: "",
        contactName: "",
        photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"
      });
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-petlight pb-12 overflow-x-hidden">
      
      <nav className="bg-petblue text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-3">
          <Link
            href="/"
            className="flex items-center min-h-[44px] gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 text-petgreen" />
            <span>Volver al Inicio</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-white/10 px-3 py-2 min-h-[44px] flex items-center rounded-xl text-slate-200 border border-white/10 font-medium whitespace-nowrap">
              Red Comunitaria • Misiones
            </span>
          </div>
        </div>
      </nav>

      <div className="w-[90%] sm:max-w-6xl mx-auto mt-8 space-y-6">
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-petblue">Red de Apoyo y Adopciones - Misiones</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Conectamos rescatistas, familias adoptantes y reportes de mascotas extraviadas en toda la provincia.
            </p>
          </div>

          <div className="w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full min-h-[44px] flex items-center justify-center gap-1.5 bg-petgreen hover:bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publicar Caso / Adopción</span>
            </button>
          </div>
        </div>

        {/* Pestañas de Filtrado Rápido */}
        <div className="flex justify-center border-b border-slate-200/60 pb-2">
          <div className="inline-flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 gap-2 flex-col sm:flex-row w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("adoption")}
              className={`w-full min-h-[44px] flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "adoption"
                  ? "bg-petblue text-white shadow"
                  : "text-slate-600 hover:bg-petlight"
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-petgreen" />
              <span>En Adopción ({posts.filter(p => p.type === "adoption").length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("lost")}
              className={`w-full min-h-[44px] flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "lost"
                  ? "bg-red-600 text-white shadow"
                  : "text-slate-600 hover:bg-petlight"
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>Mascotas Perdidas / Alerta ({posts.filter(p => p.type === "lost").length})</span>
            </button>
          </div>
        </div>

        {/* Grilla de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPosts.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col justify-between transition-all hover:shadow-md ${
                item.urgency ? "border-red-200" : "border-slate-100"
              }`}
            >
              {item.urgency && (
                <div className="bg-red-600 text-white text-[11px] font-bold px-4 py-2 flex items-center justify-between tracking-wide min-h-[32px]">
                  <span className="flex items-center gap-1.5 uppercase">
                    <AlertTriangle className="w-3.5 h-3.5" /> Alerta de Extravío
                  </span>
                  <span className="font-mono">{item.date}</span>
                </div>
              )}

              <div className="p-5 flex flex-col sm:flex-row gap-4">
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  className="w-full sm:w-32 h-48 sm:h-32 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-petblue">{item.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {item.species} • {item.breed}
                      </p>
                    </div>
                    {!item.urgency && (
                      <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-xl font-semibold border border-emerald-100 whitespace-nowrap">
                        Busca Hogar
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-petgreen shrink-0" /> {item.location}
                  </p>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm">
                  <span className="text-slate-400 block text-xs uppercase font-bold">Contacto / Responsable</span>
                  <span className="font-semibold text-petblue">{item.contactName}</span>
                </div>
                <a
                  href={`https://wa.me/${item.contactPhone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-1.5 bg-petgreen hover:bg-emerald-600 text-white font-bold text-xs py-2 px-5 rounded-xl shadow transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Contactar Rescatista</span>
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modal de Publicación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-[95%] p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-petblue">Publicar en la Red</h2>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors bg-slate-100/50 hover:bg-slate-200 cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Tipo de Publicación <span className="text-red-500">*</span>
                </label>
                <select
                  value={newPost.type}
                  onChange={(e) => setNewPost({ ...newPost, type: e.target.value as "adoption" | "lost" })}
                  className="w-full px-3 py-2 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
                >
                  <option value="adoption">En Adopción (Busca Hogar)</option>
                  <option value="lost">Mascota Perdida / Alerta</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Nombre / Referencia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Toby"
                    value={newPost.name}
                    onChange={(e) => setNewPost({ ...newPost, name: e.target.value })}
                    className="w-full px-3 py-2 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Especie <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newPost.species}
                    onChange={(e) => setNewPost({ ...newPost, species: e.target.value })}
                    className="w-full px-3 py-2 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
                  >
                    <option value="Canino">Canino</option>
                    <option value="Felino">Felino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Raza / Detalle
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Mestizo"
                    value={newPost.breed}
                    onChange={(e) => setNewPost({ ...newPost, breed: e.target.value })}
                    className="w-full px-3 py-2 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Localidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Posadas"
                    value={newPost.location}
                    onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
                    className="w-full px-3 py-2 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Descripción o Situación <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalles sobre el temperamento o lugar..."
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  className="w-full px-3 py-2 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Responsable <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre"
                    value={newPost.contactName}
                    onChange={(e) => setNewPost({ ...newPost, contactName: e.target.value })}
                    className="w-full px-3 py-2 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+54 9 376..."
                    value={newPost.contactPhone}
                    onChange={(e) => setNewPost({ ...newPost, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 text-base min-h-[44px] bg-petlight border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-petgreen text-petblue font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-petgreen hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer text-sm mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Publicando en la Red...</span>
                  </>
                ) : (
                  <span>Publicar Caso Oficial</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}