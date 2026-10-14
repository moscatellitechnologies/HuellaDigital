"use client";

import React from "react";
import { Smartphone, QrCode, Wifi, PawPrint } from "lucide-react";

export default function NfcCardMockup() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-10 select-none perspective-1000">
      
      {/* Estilos inyectados para el giro continuo en 3D */}
      <style>{`
        @keyframes spin-y {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        .animate-spin-y {
          animation: spin-y 8s infinite linear;
        }
        .animate-spin-y:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Sombra base debajo de la tarjeta */}
      <div className="absolute w-[250px] h-[20px] bg-petblue/20 blur-xl rounded-full translate-y-[140px]"></div>

      {/* Contenedor de la Tarjeta (Mantiene el Aspect Ratio CR80) */}
      <div className="relative w-[320px] sm:w-[360px] aspect-[1.586/1] transform-style-3d animate-spin-y shadow-2xl rounded-2xl cursor-grab active:cursor-grabbing">
        
        {/* ==================== CARA FRONT ==================== */}
        <div className="absolute inset-0 bg-white rounded-2xl border border-slate-200 backface-hidden flex flex-col items-center justify-center overflow-hidden">
          
          {/* Indicador NFC (Esquina) */}
          <div className="absolute top-4 right-5 flex flex-col items-center text-petblue">
            <Wifi className="w-5 h-5 rotate-90" />
            <span className="text-[10px] font-bold mt-0.5">NFC</span>
          </div>

          {/* Logotipo (70% de ancho, centrado y ligeramente hacia arriba) */}
          <img 
            src="/logo-huella.png" 
            alt="Huella Digital" 
            className="w-[70%] h-auto object-contain -mt-2 drop-shadow-sm"
          />
        </div>

        {/* ==================== CARA BACK ==================== */}
        <div className="absolute inset-0 bg-white text-petblue rounded-2xl border border-slate-200 backface-hidden rotate-y-180 flex flex-col items-center justify-between py-6 px-4">
          
          {/* Texto Superior */}
          <p className="text-center text-[14px] font-medium leading-tight mt-1">
            Escaneá el código QR<br/>o acercá tu celular (NFC)
          </p>

          {/* Bloque Central (QR y Gráficos) */}
          <div className="flex items-center justify-center gap-6 w-full">
            
            {/* Código QR (Nota: Acá usamos el icono de Lucide coloreado en azul marca. 
                Si querés un QR real, podés cambiar esto por la etiqueta <canvas id="qr"> 
                y usar la librería 'qrcode' como mencionaste) */}
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-100">
              <QrCode className="w-[85px] h-[85px] text-petblue" strokeWidth={1.5} />
            </div>

            {/* Gráfico Celular + NFC */}
            <div className="relative flex items-center justify-center">
              <Smartphone className="w-11 h-16 text-petblue fill-petblue/5" strokeWidth={1.5} />
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-6 bg-white border-2 border-petblue rounded flex items-center justify-center shadow-md">
                <PawPrint className="w-3.5 h-3.5 text-petblue" />
              </div>
            </div>

          </div>

          {/* Base / Dominio */}
          <strong className="text-[15px] tracking-wide mb-1">
            huelladigital.com
          </strong>

        </div>

      </div>

      <span className="text-[11px] text-slate-400 mt-8 font-medium flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-petgreen animate-ping"></span>
        Vista 360° • Puntero para pausar
      </span>

    </div>
  );
}