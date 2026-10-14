"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, XCircle, Loader2, PlusCircle, Package, Image as ImageIcon, Upload, Edit, Trash2 } from "lucide-react";

export default function ModuleProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productMessage, setProductMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  // Estados para Edición
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    is_active: true
  });
  const [productImage, setProductImage] = useState<File | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error obteniendo productos:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProducts(true);
    setProductMessage(null);

    try {
      let imageUrl = currentImageUrl;

      // Subir nueva imagen solo si se seleccionó una
      if (productImage) {
        const fileExt = productImage.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, productImage);

        if (uploadError) throw new Error("Error al subir la imagen al bucket.");

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
          
        imageUrl = publicUrlData.publicUrl;
      }

      if (isEditing && editingId) {
        // Lógica de UPDATE
        const { error: updateError } = await supabase
          .from("products")
          .update({
            name: productData.name,
            description: productData.description,
            price: Number(productData.price),
            image_url: imageUrl
          })
          .eq("id", editingId);

        if (updateError) throw updateError;
        setProductMessage({ text: "Producto actualizado exitosamente.", type: "success" });
      } else {
        // Lógica de INSERT
        const { error: insertError } = await supabase
          .from("products")
          .insert([{
            name: productData.name,
            description: productData.description,
            price: Number(productData.price),
            image_url: imageUrl,
            is_active: productData.is_active
          }]);

        if (insertError) throw insertError;
        setProductMessage({ text: "Producto creado exitosamente.", type: "success" });
      }

      resetForm();
      fetchProducts();

    } catch (error: any) {
      setProductMessage({ text: error.message || "Error al guardar el producto.", type: "error" });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      setProducts(products.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
    } catch (error) {
      console.error("Error al actualizar estado del producto", error);
      alert("Error al actualizar el estado.");
    }
  };

  const startEdit = (product: any) => {
    setIsEditing(true);
    setEditingId(product.id);
    setProductData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      is_active: product.is_active
    });
    setCurrentImageUrl(product.image_url || "");
    setProductImage(null); // Limpiar archivo seleccionado
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Llevar al usuario al formulario
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setProductData({ name: "", description: "", price: "", is_active: true });
    setProductImage(null);
    setCurrentImageUrl("");
  };

  return (
    <div className="p-6 sm:p-8 animate-in fade-in duration-300">
      <div className="mb-6 border-b border-slate-100 pb-6">
        <h2 className="text-xl font-bold text-slate-800">Catálogo de Productos</h2>
        <p className="text-sm text-slate-500 mt-1">
          Agrega y gestiona los productos visibles en la tienda pública.
        </p>
      </div>

      {productMessage && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-semibold flex items-start gap-2 ${
          productMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {productMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
          <span>{productMessage.text}</span>
        </div>
      )}

      {/* Formulario de Alta / Edición de Producto */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            {isEditing ? <Edit className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </h3>
          {isEditing && (
            <button type="button" onClick={resetForm} className="text-xs text-indigo-600 font-bold underline">
              Cancelar Edición
            </button>
          )}
        </div>

        <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre del Producto</label>
            <input type="text" required placeholder="Ej. Collar NFC Talle M" value={productData.name} onChange={(e) => setProductData({ ...productData, name: e.target.value })} className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Descripción breve</label>
            <textarea required rows={2} placeholder="Detalles técnicos o características..." value={productData.description} onChange={(e) => setProductData({ ...productData, description: e.target.value })} className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Precio (ARS)</label>
            <input type="number" required min="0" placeholder="15000" value={productData.price} onChange={(e) => setProductData({ ...productData, price: e.target.value })} className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Fotografía {isEditing && <span className="text-slate-400 normal-case font-normal">(Opcional si no cambia)</span>}</label>
            <label className="flex items-center gap-3 w-full px-4 py-2 text-sm bg-white border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border-dashed">
              <Upload className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 font-medium truncate">
                {productImage ? productImage.name : (isEditing && currentImageUrl ? "Cambiar imagen actual..." : "Subir imagen...")}
              </span>
              <input type="file" accept="image/*" required={!isEditing} className="hidden" onChange={(e) => setProductImage(e.target.files ? e.target.files[0] : null)} />
            </label>
          </div>
          <div className="md:col-span-2 mt-2">
            <button type="submit" disabled={isLoadingProducts} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-70">
              {isLoadingProducts ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
              <span>{isEditing ? "Guardar Cambios" : "Guardar y Publicar Producto"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Productos */}
      <h3 className="text-sm font-bold text-slate-800 mb-4">Inventario Actual</h3>
      {isLoadingProducts && products.length === 0 ? (
          <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-xl border border-slate-200">
          No hay productos registrados en la base de datos.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((product) => (
            <div key={product.id} className="flex gap-4 p-4 border border-slate-200 rounded-2xl bg-white shadow-sm">
              <div className="w-20 h-20 bg-slate-100 rounded-xl shrink-0 overflow-hidden border border-slate-200 flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm truncate">{product.name}</h4>
                  <p className="text-emerald-600 font-black text-sm">${Number(product.price).toLocaleString("es-AR")}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {product.is_active ? "Activo" : "Pausado"}
                    </span>
                    <button 
                      onClick={() => toggleProductStatus(product.id, product.is_active)}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      {product.is_active ? "Pausar" : "Activar"}
                    </button>
                  </div>
                  <button 
                    onClick={() => startEdit(product)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                  >
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}