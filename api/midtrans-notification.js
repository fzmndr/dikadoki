import midtransClient from "midtrans-client";
import { supabaseAdmin } from "./supabase.js";

const core = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const statusResponse = await core.transaction.notification(req.body);

    const midtransOrderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let paymentStatus = "pending";
    let orderStatus = "WhatsApp Checkout";
    let normalizedOrderStatus = "waiting_payment";
    let paidAt = null;

    if (transactionStatus === "settlement") {
      paymentStatus = "paid";
      orderStatus = "Processing";
      normalizedOrderStatus = "processing";
      paidAt = new Date().toISOString();
    }

    if (transactionStatus === "capture" && fraudStatus === "accept") {
      paymentStatus = "paid";
      orderStatus = "Processing";
      normalizedOrderStatus = "processing";
      paidAt = new Date().toISOString();
    }

    if (
      transactionStatus === "deny" ||
      transactionStatus === "cancel" ||
      transactionStatus === "expire"
    ) {
      paymentStatus = "failed";
      orderStatus = "Cancelled";
      normalizedOrderStatus = "cancelled";
    }

    if (transactionStatus === "pending") {
      paymentStatus = "pending";
      orderStatus = "WhatsApp Checkout";
      normalizedOrderStatus = "waiting_payment";
    }

    const updatePayload = {
      payment_status: paymentStatus,
      status: orderStatus,
      order_status: normalizedOrderStatus,
      midtrans_transaction_status: transactionStatus,
    };

    if (paidAt) {
      updatePayload.paid_at = paidAt;
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update(updatePayload)
      .eq("midtrans_order_id", midtransOrderId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      message: "Notification processed",
      order: data,
    });
  } catch (error) {
    console.error("Midtrans notification error:", error);

    return res.status(500).json({
      message: "Gagal memproses notification Midtrans",
      error: error.message,
    });
  }
}