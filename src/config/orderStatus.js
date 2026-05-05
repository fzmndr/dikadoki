export const orderStatuses = {
  whatsapp: "WhatsApp Checkout",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const editableOrderStatuses = [
  orderStatuses.whatsapp,
  orderStatuses.processing,
  orderStatuses.completed,
  orderStatuses.cancelled,
];

export const orderStatusDescriptions = {
  [orderStatuses.whatsapp]:
    "Pesanan sudah dibuat dan menunggu konfirmasi melalui WhatsApp.",
  [orderStatuses.processing]:
    "Pesanan sedang diproses oleh admin dikadoki.",
  [orderStatuses.completed]:
    "Pesanan sudah selesai diproses.",
  [orderStatuses.cancelled]:
    "Pesanan dibatalkan atau tidak dilanjutkan.",
};

export const orderStatusSteps = [
  {
    label: "Order Created",
    status: orderStatuses.whatsapp,
  },
  {
    label: "WhatsApp Checkout",
    status: orderStatuses.whatsapp,
  },
  {
    label: "Processing",
    status: orderStatuses.processing,
  },
  {
    label: "Completed",
    status: orderStatuses.completed,
  },
];