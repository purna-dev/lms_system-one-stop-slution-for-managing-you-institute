const PREFIX = "lms.";

const listeners = new Set();
let revision = 0;

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emit() {
  revision += 1;
  listeners.forEach((fn) => fn());
}

export function getRevision() {
  return revision;
}

export function key(name) {
  return `${PREFIX}${name}`;
}

export function read(name, fallback = null) {
  try {
    const raw = localStorage.getItem(key(name));
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function write(name, value) {
  localStorage.setItem(key(name), JSON.stringify(value));
  emit();
}

export function remove(name) {
  localStorage.removeItem(key(name));
  emit();
}

export function clearNamespace() {
  const toRemove = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) toRemove.push(k);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
  emit();
}

export function listKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) keys.push(k);
  }
  return keys.sort();
}
