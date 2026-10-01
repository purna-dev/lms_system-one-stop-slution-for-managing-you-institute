export function toISODate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDisplayDate(iso) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDisplayDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function startOfMonth(date = new Date()) {
  return toISODate(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function endOfMonth(date = new Date()) {
  return toISODate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function monthKey(isoOrDate) {
  const d =
    typeof isoOrDate === "string"
      ? new Date(
          isoOrDate.includes("T") ? isoOrDate : `${isoOrDate}T00:00:00`,
        )
      : isoOrDate;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function inRange(isoDate, from, to) {
  if (!isoDate) return false;
  if (from && isoDate < from) return false;
  if (to && isoDate > to) return false;
  return true;
}

export function todayISO() {
  return toISODate(new Date());
}
