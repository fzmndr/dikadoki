import { siteConfig } from "../config/site";
import { formatRupiah } from "./formatCurrency";

export const generateOrderMessage = (order) => {
  const orderList =
    order.items
      ?.map((item, index) => {
        return `${index + 1}. ${item.name}
   Kategori: ${item.category}
   Qty: ${item.quantity || 1}
   Harga: ${item.pricePrefix ? item.pricePrefix + " " : ""}${formatRupiah(
          item.price * (item.quantity || 1)
        )}`;
      })
      .join("\n\n") || "-";

  return `Halo ${siteConfig.brandName}, saya ingin melakukan pemesanan.

Kode Order: ${order.code}

Data Pemesan:
Nama: ${order.customer?.name || "-"}
Tanggal Kebutuhan: ${order.customer?.date || "-"}
No. WhatsApp: ${order.customer?.phone || "-"}
Jenis Pesanan: ${order.customer?.orderType || "-"}

Detail Pesanan:
${orderList}

Total: ${formatRupiah(order.total || 0)}

Catatan:
${order.customer?.note || "-"}`;
};