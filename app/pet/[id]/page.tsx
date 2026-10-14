// app/pet/[id]/page.tsx

import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import EmergencyPetClient from "./EmergencyPetClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const instant = false;

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const isNumeric = !isNaN(Number(id));
    const query = supabase
      .from("pets")
      .select("name, species, breed, avatar_url, emergency_notes");

    const { data: pet } = isNumeric
      ? await query.eq("id", id).maybeSingle()
      : await query.eq("nfc_uid", id).maybeSingle();

    if (!pet) {
      return {
        title: "Mascota No Encontrada | HuellaDigital",
        description: "El perfil escaneado no está registrado en HuellaDigital.",
      };
    }

    const hasEmergency = Boolean(pet.emergency_notes);
    const title = hasEmergency 
      ? `🚨 ALERTA MÉDICA: ${pet.name.toUpperCase()} (${pet.species})`
      : `🐾 Ficha de Emergencia: ${pet.name} (${pet.species})`;

    const description = hasEmergency
      ? `Atención: ${pet.emergency_notes}. Escaneá para contactar a su tutor responsable.`
      : `Perfil verificado NFC de ${pet.name} (${pet.breed || pet.species}). Contactá a su tutor al instante.`;

    const imageUrl = pet.avatar_url || "https://huelladigital.com/logo-huella.png";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: imageUrl, width: 800, height: 800, alt: pet.name }],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: "HuellaDigital • Emergencia Mascotas",
      description: "Servicio de Identificación NFC en Misiones.",
    };
  }
}

export default async function EmergencyPetPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-petlight flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-petgreen" />
      </div>
    }>
      <EmergencyPetClient petId={id} />
    </Suspense>
  );
}