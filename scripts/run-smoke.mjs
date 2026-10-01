import { createServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
  key: (i) => [...store.keys()][i] ?? null,
  get length() {
    return store.size;
  },
};

const server = await createServer({
  root,
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const mod = await server.ssrLoadModule("/scripts/smoke-body.js");
  const code = await mod.runSmoke();
  process.exit(code);
} finally {
  await server.close();
}
