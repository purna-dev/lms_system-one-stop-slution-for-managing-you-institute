import { listKeys, read } from "../repositories/storage";
import { resetDemoData as reset } from "./bootstrapService";

export function getStorageInfo() {
  return {
    meta: read("meta", null),
    keys: listKeys(),
  };
}

export function resetDemoData(options) {
  return reset(options);
}
