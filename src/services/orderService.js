import { supabase } from "../lib/supabase";
import { orderStatuses } from "../config/orderStatus";
import { orderTypes } from "../config/orderType";

export const normalizeOrder = (order) => {
  return {
    id: order.id,
    code: order.order_code,
    date: order.created_at,
    customer: {
      name: order.customer_name,
      phone: order.customer_phone,
      date: order.customer_date,
      orderType: order.order_type,
      note: order.customer_note,
    },
    internalNote: order.internal_note || "",
    status: order.status || orderStatuses.whatsapp,
    total: Number(order.total || 0),
    totalItems: order.total_items || 0,
    items: order.items || [],
  };
};

export const createOrderPayload = (order) => {
  return {
    order_code: order.code || order.order_code,
    customer_name: order.customer?.name || order.customer_name || "-",
    customer_phone: order.customer?.phone || order.customer_phone || null,
    customer_date: order.customer?.date || order.customer_date || null,
    order_type: order.customer?.orderType || order.order_type || orderTypes.bookingService,
    customer_note: order.customer?.note || order.customer_note || null,
    internal_note: order.internalNote || order.internal_note || "",
    status: order.status || orderStatuses.whatsapp,
    total: Number(order.total || 0),
    total_items: order.totalItems || order.total_items || 0,
    items: order.items || [],
    created_at: order.date || order.created_at || new Date().toISOString(),
  };
};

export const fetchOrdersFromSupabase = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map(normalizeOrder);
};

export const insertOrderToSupabase = async (order) => {
  const payload = createOrderPayload(order);

  const { error } = await supabase.from("orders").insert([payload]);

  if (error) {
    throw error;
  }

  return true;
};

export const upsertOrdersToSupabase = async (orders) => {
  const payload = orders.map(createOrderPayload).filter((order) => order.order_code);

  const { error } = await supabase
    .from("orders")
    .upsert(payload, { onConflict: "order_code" });

  if (error) {
    throw error;
  }

  return true;
};

export const updateOrderStatusInSupabase = async (orderCode, status) => {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("order_code", orderCode);

  if (error) {
    throw error;
  }

  return true;
};

export const updateOrderNoteInSupabase = async (orderCode, note) => {
  const { error } = await supabase
    .from("orders")
    .update({ internal_note: note })
    .eq("order_code", orderCode);

  if (error) {
    throw error;
  }

  return true;
};

export const deleteOrderFromSupabase = async (orderCode) => {
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("order_code", orderCode);

  if (error) {
    throw error;
  }

  return true;
};

export const clearOrdersFromSupabase = async () => {
  const { error } = await supabase
    .from("orders")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    throw error;
  }

  return true;
};