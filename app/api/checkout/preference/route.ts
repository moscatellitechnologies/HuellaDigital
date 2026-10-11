import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { supabase } from "@/lib/supabaseClient";

// Inicializar Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || "" });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, address, title, price } = body;

    // 1. Crear el registro "pendiente" en Supabase
    const { data: order, error } = await supabase
      .from("orders")
      .insert([{ user_id: userId, shipping_address: address, total_amount: price, status: "pending_payment" }])
      .select("id")
      .single();

    if (error) throw error;

    // 2. Crear Preferencia en Mercado Pago
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: "huella-digital-nfc",
            title: title,
            quantity: 1,
            unit_price: Number(price),
          }
        ],
        external_reference: order.id, // Conectamos el pago con nuestro ID de orden
        back_urls: {
          success: `${request.headers.get("origin")}/dashboard?payment=success`,
          failure: `${request.headers.get("origin")}/store?payment=failure`,
          pending: `${request.headers.get("origin")}/store?payment=pending`,
        },
        auto_return: "approved",
      }
    });

    return NextResponse.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    console.error("Error creando preferencia:", error);
    return NextResponse.json({ error: "Error al generar el pago" }, { status: 500 });
  }
}