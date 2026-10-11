import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || "" });

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const id = url.searchParams.get("data.id") || url.searchParams.get("id");

    if (topic === "payment" && id) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id });

      if (paymentData.status === "approved" && paymentData.external_reference) {
        // Actualizar la orden a 'paid' en Supabase
        await supabase
          .from("orders")
          .update({ status: "paid", payment_id: paymentData.id?.toString() })
          .eq("id", paymentData.external_reference);
      }
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error en Webhook:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}