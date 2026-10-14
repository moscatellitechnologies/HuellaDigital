"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { 
  HeartHandshake, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  ArrowLeft, 
  X,
  Loader2,
  Camera,
  CheckCircle2
} from "lucide-react";

export default function EcosystemAdoptionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"adoption" | "lost">("adoption");
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"adoption" | "lost">("adoption");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const [postImage, setPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [newPost, setNewPost] = useState({
    name: "",
    species: "Canino",
    breed: "",
    location: "Posadas, Misiones",
    description: "",
    contactPhone: "",
    contactName: "",
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error cargando publicaciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (type: "adoption" | "lost") => {
    if (!user) {
      router.push("/auth/login?redirect=/ecosystem/adoptions");
      return;
    }
    setModalType(type);
    
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).single().then(({data}) => {
      if (data) {
        setNewPost(prev => ({
          ...prev,
          contactName: data.full_name || "",
          contactPhone: data.phone || ""
        }));
      }
    });

    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPostImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      let publicImageUrl = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400";

      if (postImage) {
        const fileExt = postImage.name.split('.').pop();
        const fileName = `post_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("community-images")
          .upload(fileName, postImage);

        if (uploadError) throw new Error("Error al subir la foto.");

        const { data: urlData } = supabase.storage
          .from("community-images")
          .getPublicUrl(fileName);
          
        publicImageUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("community_posts")
        .insert([{
          type: modalType,
          name: newPost.name,
          species: newPost.species,
          breed: newPost.breed,
          location: newPost.location,
          description: newPost.description,
          contact_name: newPost.contactName,
          contact_phone: newPost.contactPhone,
          image_url: publicImageUrl,
          user_id: user.id
        }]);

      if (insertError) throw insertError;

      setSuccessMessage(true);
      fetchPosts();
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage(false);
        setNewPost({ name: "", species: "Canino", breed: "", location: "Posadas, Misiones", description: "", contactPhone: "", contactName: "" });
        setPostImage(null);
        setImagePreview(null);
      }, 2000);

    } catch (error: any) {
      alert(error.message || "Error al publicar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPosts = posts.filter((p) => p.type === activeTab);

  return (
    <main className="min-h-screen bg-petlight pb-12 overflow-x-hidden">
      
      <nav className="bg-petblue text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-3">
          <Link href="/" className="flex items-center min-h-[44px] gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all border border-white/10">
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
        
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-petblue">Red de Apoyo y Adopciones</h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Conectamos rescatistas, familias adoptantes y reportes urgentes de mascotas extraviadas en toda la provincia. Necesitas iniciar sesión para publicar y mantener segura a la comunidad.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => handleActionClick("lost")}
              className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all active:scale-95"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Reportar Extravío</span>
            </button>
            <button
              onClick={() => handleActionClick("adoption")}
              className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 bg-petgreen hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all active:scale-95"
            >
              <HeartHandshake className="w-5 h-5" />
              <span>Dar en Adopción</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center border-b border-slate-200/60 pb-2 mt-4">
          <div className="inline-flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 gap-2 flex-col sm:flex-row w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("adoption")}
              className={`w-full min-h-[44px] flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "adoption" ? "bg-petblue text-white shadow" : "text-slate-600 hover:bg-petlight"
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-petgreen" />
              <span>En Adopción</span>
            </button>
            <button
              onClick={() => setActiveTab("lost")}
              className={`w-full min-h-[44px] flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "lost" ? "bg-red-600 text-white shadow" : "text-slate-600 hover:bg-petlight"
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>Mascotas Perdidas / Alerta</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-petgreen" /></div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-medium bg-white rounded-2xl border border-slate-100">
            No hay publicaciones activas en esta categoría por el momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPosts.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col justify-between transition-all hover:shadow-md ${
                  item.type === "lost" ? "border-red-200" : "border-slate-100"
                }`}
              >
                {item.type === "lost" && (
                  <div className="bg-red-600 text-white text-[11px] font-bold px-4 py-2 flex items-center justify-between tracking-wide min-h-[32px]">
                    <span className="flex items-center gap-1.5 uppercase">
                      <AlertTriangle className="w-3.5 h-3.5" /> Alerta de Extravío
                    </span>
                    <span className="font-mono">{new Date(item.created_at).toLocaleDateString("es-AR")}</span>
                  </div>
                )}

                <div className="p-5 flex flex-col sm:flex-row gap-4">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full sm:w-32 h-48 sm:h-32 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-petblue">{item.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {item.species} • {item.breed || "Mestizo"}
                        </p>
                      </div>
                      {item.type === "adoption" && (
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
                    <span className="font-semibold text-petblue">{item.contact_name}</span>
                  </div>
                  <a
                    href={`https://wa.me/${item.contact_phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-1.5 bg-petgreen hover:bg-emerald-600 text-white font-bold text-xs py-2 px-5 rounded-xl shadow transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-[95%] p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${modalType === 'lost' ? 'text-red-600' : 'text-petblue'}`}>
                {modalType === 'lost' ? <AlertTriangle className="w-5 h-5" /> : <HeartHandshake className="w-5 h-5" />}
                {modalType === 'lost' ? 'Reportar Extravío Urgente' : 'Publicar en Adopción'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100/50 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMessage ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-petgreen mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-petblue">¡Publicado con éxito!</h3>
                <p className="text-sm text-slate-500">La comunidad ya puede verlo.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                <div className="flex flex-col items-center justify-center">
                  <label htmlFor="post-image" className="relative cursor-pointer group">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-petgreen">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-slate-400 group-hover:text-petgreen mb-1" />
                          <span className="text-[10px] text-slate-500 font-medium">Subir Foto</span>
                        </>
                      )}
                    </div>
                    <input id="post-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nombre <span className="text-red-500">*</span></label>
                    <input type="text" required value={newPost.name} onChange={(e) => setNewPost({ ...newPost, name: e.target.value })} className="w-full px-3 py-2 text-sm bg-petlight border border-slate-200 rounded-xl focus:ring-2 focus:ring-petgreen outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Especie <span className="text-red-500">*</span></label>
                    <select value={newPost.species} onChange={(e) => setNewPost({ ...newPost, species: e.target.value })} className="w-full px-3 py-2 text-sm bg-petlight border border-slate-200 rounded-xl focus:ring-2 focus:ring-petgreen outline-none">
                      <option value="Canino">Canino</option>
                      <option value="Felino">Felino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Raza (Opcional)</label>
                    <input type="text" value={newPost.breed} onChange={(e) => setNewPost({ ...newPost, breed: e.target.value })} className="w-full px-3 py-2 text-sm bg-petlight border border-slate-200 rounded-xl focus:ring-2 focus:ring-petgreen outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Localidad <span className="text-red-500">*</span></label>
                    <input type="text" required value={newPost.location} onChange={(e) => setNewPost({ ...newPost, location: e.target.value })} className="w-full px-3 py-2 text-sm bg-petlight border border-slate-200 rounded-xl focus:ring-2 focus:ring-petgreen outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Descripción de la situación <span className="text-red-500">*</span></label>
                  <textarea rows={3} required value={newPost.description} onChange={(e) => setNewPost({ ...newPost, description: e.target.value })} className="w-full px-3 py-2 text-sm bg-petlight border border-slate-200 rounded-xl focus:ring-2 focus:ring-petgreen outline-none resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tu Nombre <span className="text-red-500">*</span></label>
                    <input type="text" required value={newPost.contactName} onChange={(e) => setNewPost({ ...newPost, contactName: e.target.value })} className="w-full px-3 py-2 text-sm bg-petlight border border-slate-200 rounded-xl focus:ring-2 focus:ring-petgreen outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tu WhatsApp <span className="text-red-500">*</span></label>
                    <input type="tel" required value={newPost.contactPhone} onChange={(e) => setNewPost({ ...newPost, contactPhone: e.target.value })} className="w-full px-3 py-2 text-sm bg-petlight border border-slate-200 rounded-xl focus:ring-2 focus:ring-petgreen outline-none" />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className={`w-full min-h-[44px] flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-xl shadow transition-all active:scale-95 disabled:opacity-70 mt-2 ${modalType === 'lost' ? 'bg-red-600 hover:bg-red-700' : 'bg-petgreen hover:bg-emerald-600'}`}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Publicar Caso Oficialmente</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </main>
  );
}