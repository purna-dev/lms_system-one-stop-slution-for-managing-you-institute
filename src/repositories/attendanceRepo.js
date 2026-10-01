import { createId } from "../data/id";
import { read, write } from "./storage";

const KEY = "attendance";

export function getAll() {
  return read(KEY, []);
}

export function getById(id) {
  return getAll().find((a) => a.id === id) || null;
}

export function upsert(payload) {
  const items = getAll();
  const idx = items.findIndex(
    (a) => a.studentId === payload.studentId && a.date === payload.date,
  );
  if (idx >= 0) {
    items[idx] = {
      ...items[idx],
      ...payload,
      id: items[idx].id,
    };
    write(KEY, items);
    return items[idx];
  }
  const item = {
    id: createId("att"),
    studentId: payload.studentId,
    batchId: payload.batchId,
    date: payload.date,
    status: payload.status,
    markedBy: payload.markedBy,
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  write(KEY, items);
  return item;
}

export function remove(id) {
  write(
    KEY,
    getAll().filter((a) => a.id !== id),
  );
}

export function replaceAll(items) {
  write(KEY, items);
}
