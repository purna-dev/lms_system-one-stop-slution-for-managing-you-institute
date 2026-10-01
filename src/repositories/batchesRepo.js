import { createId } from "../data/id";
import { read, write } from "./storage";

const KEY = "batches";

export function getAll() {
  return read(KEY, []);
}

export function getById(id) {
  return getAll().find((b) => b.id === id) || null;
}

export function create(payload) {
  const items = getAll();
  const item = {
    id: createId("bat"),
    name: payload.name,
    subject: payload.subject || "",
    schedule: payload.schedule || "",
    feeAmount: Number(payload.feeAmount) || 0,
    teacherId: payload.teacherId || "",
    status: payload.status || "active",
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  write(KEY, items);
  return item;
}

export function update(id, patch) {
  const items = getAll();
  const idx = items.findIndex((b) => b.id === id);
  if (idx < 0) return null;
  items[idx] = { ...items[idx], ...patch, id };
  write(KEY, items);
  return items[idx];
}

export function remove(id) {
  write(
    KEY,
    getAll().filter((b) => b.id !== id),
  );
}

export function replaceAll(items) {
  write(KEY, items);
}
