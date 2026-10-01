import { read, write } from "./storage";

const KEY = "feePlans";

export function getAll() {
  return read(KEY, []);
}

export function replaceAll(items) {
  write(KEY, items);
}
