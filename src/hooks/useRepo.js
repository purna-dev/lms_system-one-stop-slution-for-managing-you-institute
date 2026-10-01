import { useSyncExternalStore } from "react";
import { subscribe, read, getRevision } from "../repositories/storage";

export function useRepo(key, fallback = []) {
  const revision = useStorageVersion();
  // revision forces re-read after writes; value comes from storage
  void revision;
  return read(key, fallback);
}

export function useStorageVersion() {
  return useSyncExternalStore(subscribe, getRevision, () => 0);
}
