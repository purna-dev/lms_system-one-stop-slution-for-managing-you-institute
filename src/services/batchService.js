import * as batchesRepo from "../repositories/batchesRepo";
import * as studentsRepo from "../repositories/studentsRepo";

export function listBatches() {
  return batchesRepo.getAll();
}

export function getBatch(id) {
  return batchesRepo.getById(id);
}

export function createBatch(payload) {
  if (!payload.name?.trim()) throw new Error("Batch name is required.");
  return batchesRepo.create({
    ...payload,
    name: payload.name.trim(),
  });
}

export function updateBatch(id, patch) {
  return batchesRepo.update(id, patch);
}

export function archiveBatch(id) {
  return batchesRepo.update(id, { status: "archived" });
}

export function removeBatch(id) {
  const linked = studentsRepo.getAll().some((s) => s.batchId === id);
  if (linked) {
    throw new Error("Cannot delete a batch that still has students. Archive it instead.");
  }
  batchesRepo.remove(id);
}

export function studentCountByBatch() {
  const students = studentsRepo.getAll();
  return batchesRepo.getAll().map((b) => ({
    batchId: b.id,
    name: b.name,
    count: students.filter((s) => s.batchId === b.id).length,
  }));
}
