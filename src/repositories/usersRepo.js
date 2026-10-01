import { createId } from "../data/id";
import { read, write } from "./storage";

const KEY = "users";

export function getAll() {
  return read(KEY, []);
}

export function getById(id) {
  return getAll().find((u) => u.id === id) || null;
}

export function getByEmail(email) {
  const normalized = String(email || "").toLowerCase().trim();
  return getAll().find((u) => u.email.toLowerCase() === normalized) || null;
}

export function create(payload) {
  const items = getAll();
  const item = {
    id: createId("usr"),
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role || "teacher",
    phone: payload.phone || "",
    subjects: payload.subjects || "",
    status: payload.status || "active",
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  write(KEY, items);
  return item;
}

export function update(id, patch) {
  const items = getAll();
  const idx = items.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  const next = { ...items[idx], ...patch, id };
  // never wipe password accidentally with empty string unless provided
  if (patch.password === "" || patch.password == null) {
    next.password = items[idx].password;
  }
  items[idx] = next;
  write(KEY, items);
  return items[idx];
}

export function remove(id) {
  write(
    KEY,
    getAll().filter((u) => u.id !== id),
  );
}

export function replaceAll(items) {
  write(KEY, items);
}
