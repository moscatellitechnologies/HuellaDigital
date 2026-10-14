"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Trash2, Edit, CheckCircle } from "lucide-react";

export default function ModuleCommunity() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error obteniendo publicaciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePostStatus = async (id: string, newStatus: "resolved" | "deleted") => {
    const isDelete = newStatus === "deleted";
    if (isDelete && !window.confirm("¿Estás seguro de eliminar esta publicación por incumplir normas?")) return;
    
    try {
      const { error } = await supabase
        .from("community_posts")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      
      // Remover de la vista local
      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      alert("Error al actualizar la publicación.");
    }
  };

  return (
    <div className="p-6 sm:p-8 animate-in fade-in duration-300">
      <div className="mb-6 border-b border-slate-100 pb-6">
        <h2 className="text-xl font-bold text-slate-800">Moderación de Comunidad</h2>
        <p className="text-sm text-slate-500 mt-1">
          Supervisa las publicaciones activas de Adopción y Extravío. Da de baja los casos resueltos o elimina contenido inapropiado.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm bg-slate-50 rounded-xl border border-slate-200 font-medium">
          No hay publicaciones activas en la comunidad en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts.map(post => (
            <div key={post.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-200 rounded-2xl bg-white shadow-sm items-start sm:items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-xl shrink-0 overflow-hidden border border-slate-200">
                {post.image_url && <img src={post.image_url} alt="Foto" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-sm">{post.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${post.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {post.type === 'lost' ? 'Extravío' : 'Adopción'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{post.description}</p>
                <div className="flex gap-3 text-[11px] font-mono text-slate-400 mt-2">
                  <span>Autor: {post.contact_name}</span>
                  <span>Tel: {post.contact_phone}</span>
                </div>
              </div>
              
              {/* Controles de Moderación */}
              <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <button 
                  onClick={() => updatePostStatus(post.id, "resolved")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Caso Resuelto
                </button>
                <button 
                  onClick={() => updatePostStatus(post.id, "deleted")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar (Ban)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}