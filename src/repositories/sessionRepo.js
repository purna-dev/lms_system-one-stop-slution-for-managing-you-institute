import { read, write, remove } from "./storage";

const KEY = "session";

export function get() {
  return read(KEY, null);
}

export function set(session) {
  write(KEY, session);
}

export function clear() {
  remove(KEY);
}
