export function formatINR(amount) {
  const n = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function parseAmount(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
