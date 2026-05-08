import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
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
    const { order_id, gross_amount, customer, items } = req.body;

    if (!order_id || !gross_amount || !customer) {
      return res.status(400).json({
        message: "Data transaksi tidak lengkap",
      });
    }

    const itemDetails =
      items?.map((item) => ({
        id: String(item.id || item.product_id || item.name || "item"),
        price: Number(item.price || 0),
        quantity: Number(item.quantity || item.qty || 1),
        name: String(item.name || item.title || "Produk").slice(0, 50),
      })) || [];

    const itemTotal = itemDetails.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    if (itemTotal !== Number(gross_amount)) {
      itemDetails.push({
        id: "adjustment",
        price: Number(gross_amount) - itemTotal,
        quantity: 1,
        name: "Adjustment",
      });
    }

    const origin =
      req.headers.origin ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:5173");

    const parameter = {
      transaction_details: {
        order_id,
        gross_amount: Number(gross_amount),
      },

      customer_details: {
        first_name: customer.name || "Customer",
        email: customer.email || "customer@example.com",
        phone: customer.phone || "",
      },

      item_details: itemDetails,

      enabled_payments: ["gopay", "qris"],

      callbacks: {
        finish: `${origin}/order-success?code=${order_id}`,
        unfinish: `${origin}/cart`,
        error: `${origin}/cart`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return res.status(200).json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error("Midtrans create transaction error:", error);

    return res.status(500).json({
      message: "Gagal membuat transaksi Midtrans",
      error: error.message,
    });
  }
}