"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { 
  ShieldCheck, 
  CreditCard, 
  Stethoscope, 
  Building2, 
  CheckCircle2, 
  XCircle,
  Loader2,
  PlusCircle,
  Database,
  ArrowRight,
  Package,
  Truck,
  ShoppingBag,
  Image as ImageIcon,
  Upload
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"nfc" | "vets" | "clinics" | "orders" | "products">("orders");
  
  // ==========================================
  // ESTADOS: MÓDULO NFC
  // ==========================================
  const [nfcUid, setNfcUid] = useState("");
  const [isLoadingNfc, setIsLoadingNfc] = useState(false);
  const [nfcMessage, setNfcMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // ==========================================
  // ESTADOS: MÓDULO AUDITORÍA VETERINARIA
  // ==========================================
  const [pendingVets, setPendingVets] = useState<any[]>([]);
  const [isLoadingVets, setIsLoadingVets] = useState(false);

  // ==========================================
  // ESTADOS: MÓDULO CLÍNICAS
  // ==========================================
  const [clinicData, setClinicData] = useState({
    clinicName: "",
    branchName: "",
    city: "Posadas",
    address: ""
  });
  const [isLoadingClinic, setIsLoadingClinic] = useState(false);
  const [clinicMessage, setClinicMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // ==========================================
  // ESTADOS: MÓDULO LOGÍSTICA
  // ==========================================
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // ==========================================
  // ESTADOS: MÓDULO CATÁLOGO (NUEVO)
  // ==========================================
  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productMessage, setProductMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    is_active: true
  });
  const [productImage, setProductImage] = useState<File | null>(null);

  // ==========================================
  // LÓGICA: MÓDULO CATÁLOGO (NUEVO)
  // ==========================================
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProducts(true);
    setProductMessage(null);

    try {
      let imageUrl = "";

      // 1. Subir imagen si existe
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

      // 2. Insertar en tabla products
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
      setProductData({ name: "", description: "", price: "", is_active: true });
      setProductImage(null);
      fetchProducts(); // Refrescar lista

    } catch (error: any) {
      setProductMessage({ text: error.message || "Error al crear producto.", type: "error" });
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

  // ==========================================
  // LÓGICA: MÓDULO NFC
  // ==========================================
  const handleAddNfc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nfcUid.trim()) return;
    setIsLoadingNfc(true);
    setNfcMessage(null);

    try {
      const { error } = await supabase
        .from("cards")
        .insert([{ uid: nfcUid, is_active: false }]);

      if (error) throw error;
      setNfcMessage({ text: `Tarjeta ${nfcUid} ingresada al stock correctamente.`, type: "success" });
      setNfcUid("");
    } catch (error: any) {
      setNfcMessage({ text: error.message || "Error al registrar la tarjeta.", type: "error" });
    } finally {
      setIsLoadingNfc(false);
    }
  };

  const handleGenerateBatch = async () => {
    setIsLoadingNfc(true);
    setNfcMessage(null);
    try {
      const batch = Array.from({ length: 5 }).map((_, i) => ({
        uid: `nfc_test_${Date.now().toString().slice(-6)}_${i + 1}`,
        is_active: false
      }));

      const { error } = await supabase.from("cards").insert(batch);
      if (error) throw error;

      setNfcMessage({ text: "Lote de 5 tarjetas de prueba generado con éxito.", type: "success" });
    } catch (error: any) {
      setNfcMessage({ text: error.message || "Error al generar el lote.", type: "error" });
    } finally {
      setIsLoadingNfc(false);
    }
  };

  // ==========================================
  // LÓGICA: MÓDULO LOGÍSTICA
  // ==========================================
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles (full_name, phone)
        `)
        .in("status", ["paid", "shipped"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error obteniendo pedidos:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const markAsShipped = async (orderId: string, phone: string, fullName: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "shipped" })
        .eq("id", orderId);

      if (error) throw error;
      
      // Actualizar local
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "shipped" } : o));

      // Abrir WhatsApp
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const msg = encodeURIComponent(`¡Hola ${fullName}! Te avisamos desde HuellaDigital que tu Placa Inteligente ya está en camino hacia el domicilio indicado. 📦`);
      window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");

    } catch (error) {
      console.error(error);
      alert("Error al actualizar el pedido.");
    }
  };

  // ==========================================
  // LÓGICA: MÓDULO AUDITORÍA VETERINARIA
  // ==========================================
  const fetchPendingVets = async () => {
    setIsLoadingVets(true);
    try {
      const { data, error } = await supabase
        .from("vet_profiles")
        .select(`
          id,
          license_number,
          status,
          profiles (full_name, phone)
        `)
        .eq("status", "pending");

      if (error) throw error;
      setPendingVets(data || []);
    } catch (error) {
      console.error("Error obteniendo veterinarios pendientes:", error);
    } finally {
      setIsLoadingVets(false);
    }
  };

  useEffect(() => {
    if (activeTab === "vets") fetchPendingVets();
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "products") fetchProducts();
  }, [activeTab]);

  const handleUpdateVetStatus = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("vet_profiles")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      setPendingVets(pendingVets.filter(vet => vet.id !== id));
    } catch (error) {
      console.error("Error actualizando estado:", error);
      alert("No se pudo actualizar el estado del veterinario.");
    }
  };

  // ==========================================
  // LÓGICA: MÓDULO CLÍNICAS
  // ==========================================
  const handleAddClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingClinic(true);
    setClinicMessage(null);

    try {
      const { data: clinicRes, error: clinicError } = await supabase
        .from("clinics")
        .insert([{ name: clinicData.clinicName }])
        .select("id")
        .single();

      if (clinicError) throw clinicError;

      const { error: branchError } = await supabase
        .from("clinic_branches")
        .insert([{
          clinic_id: clinicRes.id,
          name: clinicData.branchName,
          city: clinicData.city,
          address: clinicData.address
        }]);

      if (branchError) throw branchError;

      setClinicMessage({ text: "Clínica y sucursal creadas exitosamente.", type: "success" });
      setClinicData({ clinicName: "", branchName: "", city: "Posadas", address: "" });
    } catch (error: any) {
      setClinicMessage({ text: error.message || "Error al crear la infraestructura.", type: "error" });
    } finally {
      setIsLoadingClinic(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-12 overflow-x-hidden text-slate-800">
      
      <nav className="bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="font-bold tracking-wide block">Centro de Comando</span>
              <span className="text-xs text-slate-400">Backoffice Administrativo</span>
            </div>
          </div>
          <Link href="/" className="text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all">
            Volver al Sitio
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Menú Lateral */}
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === "orders" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Ventas y Envíos</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === "products" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Catálogo y Tienda</span>
          </button>

          <button
            onClick={() => setActiveTab("nfc")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === "nfc" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Inventario NFC</span>
          </button>
          
          <button
            onClick={() => setActiveTab("vets")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === "vets" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <Stethoscope className="w-4 h-4" />
              <span>Auditoría Médica</span>
            </div>
            {pendingVets.length > 0 && activeTab !== "vets" && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                {pendingVets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("clinics")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === "clinics" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Infraestructura</span>
          </button>
        </div>

        {/* Panel Principal */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
          
          {/* ======================= MÓDULO CATÁLOGO (NUEVO) ======================= */}
          {activeTab === "products" && (
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

              {/* Formulario de Alta de Producto */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Nuevo Producto
                </h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Collar NFC Talle M"
                      value={productData.name}
                      onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Descripción breve
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Detalles técnicos o características..."
                      value={productData.description}
                      onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Precio (ARS)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="15000"
                      value={productData.price}
                      onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Fotografía
                    </label>
                    <label className="flex items-center gap-3 w-full px-4 py-2 text-sm bg-white border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border-dashed">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500 font-medium truncate">
                        {productImage ? productImage.name : "Subir imagen..."}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        required
                        className="hidden"
                        onChange={(e) => setProductImage(e.target.files ? e.target.files[0] : null)}
                      />
                    </label>
                  </div>
                  <div className="md:col-span-2 mt-2">
                    <button
                      type="submit"
                      disabled={isLoadingProducts}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-70"
                    >
                      {isLoadingProducts ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
                      <span>Guardar y Publicar Producto</span>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================= MÓDULO LOGÍSTICA ======================= */}
          {activeTab === "orders" && (
            <div className="p-6 sm:p-8 animate-in fade-in duration-300">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Logística y Despachos</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Gestiona las placas pagadas listas para ser enviadas.
                </p>
              </div>

              {isLoadingOrders ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-700">No hay ventas pendientes</h3>
                  <p className="text-sm text-slate-500">Los pedidos pagados aparecerán aquí.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800">{order.profiles?.full_name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            order.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {order.status === "paid" ? "Pagado" : "Enviado"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium break-all">
                          {order.shipping_address}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                          ID Pago: {order.payment_id} • Fecha: {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {order.status === "paid" && (
                        <button
                          onClick={() => markAsShipped(order.id, order.profiles?.phone || "", order.profiles?.full_name || "")}
                          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 shrink-0"
                        >
                          <Truck className="w-4 h-4" /> Despachar Placa
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================= MÓDULO NFC ======================= */}
          {activeTab === "nfc" && (
            <div className="p-6 sm:p-8 animate-in fade-in duration-300">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Gestión de Hardware NFC</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Da de alta las tarjetas en el sistema antes de su distribución.
                </p>
              </div>

              {nfcMessage && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-semibold flex items-start gap-2 ${
                  nfcMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {nfcMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
                  <span>{nfcMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleAddNfc} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    UID del Chip NFC
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. nfc_misiones_001"
                    value={nfcUid}
                    onChange={(e) => setNfcUid(e.target.value)}
                    className="w-full px-4 py-2.5 text-base bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoadingNfc}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-70"
                >
                  {isLoadingNfc ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                  <span>Registrar Tarjeta en Sistema</span>
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Herramientas de Desarrollo</h3>
                <button
                  onClick={handleGenerateBatch}
                  disabled={isLoadingNfc}
                  className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold py-2 px-4 rounded-xl text-xs transition-all"
                >
                  <Database className="w-4 h-4" />
                  <span>Generar Lote de Prueba (5 Tarjetas)</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================= MÓDULO VETERINARIOS ======================= */}
          {activeTab === "vets" && (
            <div className="p-6 sm:p-8 animate-in fade-in duration-300">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Auditoría Médica Antifraude</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Revisa y aprueba las credenciales de los profesionales que solicitan acceso.
                </p>
              </div>

              {isLoadingVets ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : pendingVets.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-700">No hay solicitudes pendientes</h3>
                  <p className="text-sm text-slate-500">Todos los profesionales han sido auditados.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold">
                      <tr>
                        <th className="py-3 px-4 border-b border-slate-200">Profesional</th>
                        <th className="py-3 px-4 border-b border-slate-200">Matrícula</th>
                        <th className="py-3 px-4 border-b border-slate-200">Contacto</th>
                        <th className="py-3 px-4 border-b border-slate-200 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {pendingVets.map((vet) => (
                        <tr key={vet.id} className="hover:bg-slate-50/50">
                          <td className="py-4 px-4 font-bold">{vet.profiles?.full_name || "Desconocido"}</td>
                          <td className="py-4 px-4 font-mono text-xs">{vet.license_number}</td>
                          <td className="py-4 px-4 text-xs">{vet.profiles?.phone || "Sin teléfono"}</td>
                          <td className="py-4 px-4 flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdateVetStatus(vet.id, "approved")}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleUpdateVetStatus(vet.id, "rejected")}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                            >
                              Rechazar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ======================= MÓDULO CLÍNICAS ======================= */}
          {activeTab === "clinics" && (
            <div className="p-6 sm:p-8 animate-in fade-in duration-300">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Alta de Infraestructura</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Registra cadenas veterinarias y sus sucursales operativas en Misiones.
                </p>
              </div>

              {clinicMessage && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-semibold flex items-start gap-2 ${
                  clinicMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {clinicMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
                  <span>{clinicMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleAddClinic} className="space-y-4 max-w-xl">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Datos de la Cadena</h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Comercial (Ej. Veterinaria El Bosque)</label>
                    <input
                      type="text"
                      required
                      value={clinicData.clinicName}
                      onChange={(e) => setClinicData({ ...clinicData, clinicName: e.target.value })}
                      className="w-full px-4 py-2 text-base bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Primera Sucursal</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Nombre (Ej. Sucursal Centro)</label>
                      <input
                        type="text"
                        required
                        value={clinicData.branchName}
                        onChange={(e) => setClinicData({ ...clinicData, branchName: e.target.value })}
                        className="w-full px-4 py-2 text-base bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Localidad en Misiones</label>
                      <select
                        value={clinicData.city}
                        onChange={(e) => setClinicData({ ...clinicData, city: e.target.value })}
                        className="w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      >
                        <option value="Posadas">Posadas</option>
                        <option value="Oberá">Oberá</option>
                        <option value="Eldorado">Eldorado</option>
                        <option value="Puerto Iguazú">Puerto Iguazú</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Dirección Física</label>
                    <input
                      type="text"
                      required
                      value={clinicData.address}
                      onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })}
                      className="w-full px-4 py-2 text-base bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoadingClinic}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all disabled:opacity-70 mt-4"
                >
                  {isLoadingClinic ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Registrar Infraestructura</span>}
                  {!isLoadingClinic && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}