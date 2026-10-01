import { createId } from "../data/id";
import { read, write } from "./storage";

export function createCollectionRepo(key, idPrefix) {
  function getAll() {
    return read(key, []);
  }

  function getById(id) {
    return getAll().find((item) => item.id === id) || null;
  }

  function create(payload) {
    const items = getAll();
    const item = {
      id: createId(idPrefix),
      ...payload,
      createdAt: payload.createdAt || new Date().toISOString(),
    };
    items.push(item);
    write(key, items);
    return item;
  }

  function update(id, patch) {
    const items = getAll();
    const idx = items.findIndex((item) => item.id === id);
    if (idx < 0) return null;
    items[idx] = { ...items[idx], ...patch, id };
    write(key, items);
    return items[idx];
  }

  function remove(id) {
    write(
      key,
      getAll().filter((item) => item.id !== id),
    );
  }

  function replaceAll(items) {
    write(key, items || []);
  }

  return { getAll, getById, create, update, remove, replaceAll };
}
