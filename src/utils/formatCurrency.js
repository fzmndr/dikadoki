export const formatRupiah = (value = 0) => {
  const numberValue = Number(value || 0);

  return `Rp ${numberValue.toLocaleString("id-ID")}`;
};