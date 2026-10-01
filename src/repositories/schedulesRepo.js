import { createId } from "../data/id";
import { read, write } from "./storage";

const KEY = "schedules";

export function getAll() {
  return read(KEY, []);
}

export function getById(id) {
  return getAll().find((s) => s.id === id) || null;
}

export function create(payload) {
  const items = getAll();
  const item = {
    id: createId("sch"),
    batchId: payload.batchId,
    teacherId: payload.teacherId,
    days: payload.days || [],
    startTime: payload.startTime,
    endTime: payload.endTime,
    room: payload.room || "",
    status: payload.status || "active",
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  write(KEY, items);
  return item;
}

export function update(id, patch) {
  const items = getAll();
  const idx = items.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  items[idx] = { ...items[idx], ...patch, id };
  write(KEY, items);
  return items[idx];
}

export function remove(id) {
  write(
    KEY,
    getAll().filter((s) => s.id !== id),
  );
}

export function replaceAll(items) {
  write(KEY, items);
}
