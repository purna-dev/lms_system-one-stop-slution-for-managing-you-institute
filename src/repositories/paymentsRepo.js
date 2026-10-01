import { createId } from "../data/id";
import { read, write } from "./storage";

const KEY = "payments";

export function getAll() {
  return read(KEY, []);
}

export function getById(id) {
  return getAll().find((p) => p.id === id) || null;
}

export function create(payload) {
  const items = getAll();
  const item = {
    id: createId("pay"),
    studentId: payload.studentId,
    batchId: payload.batchId,
    amount: Number(payload.amount) || 0,
    method: payload.method || "upi",
    status: payload.status || "pending",
    dueDate: payload.dueDate,
    paidAt: payload.paidAt || null,
    note: payload.note || "",
    methodMeta: payload.methodMeta || null,
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  write(KEY, items);
  return item;
}

export function update(id, patch) {
  const items = getAll();
  const idx = items.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  items[idx] = { ...items[idx], ...patch, id };
  write(KEY, items);
  return items[idx];
}

export function remove(id) {
  write(
    KEY,
    getAll().filter((p) => p.id !== id),
  );
}

export function replaceAll(items) {
  write(KEY, items);
}
