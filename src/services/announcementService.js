import { announcementsRepo } from "../repositories/announcementsRepo";
import { logAction } from "./auditService";
import { getSession } from "./authService";

export function listAnnouncements() {
  return announcementsRepo
    .getAll()
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function createAnnouncement(payload) {
  if (!payload.title?.trim()) throw new Error("Title is required.");
  if (!payload.body?.trim()) throw new Error("Message body is required.");
  const session = getSession();
  const item = announcementsRepo.create({
    title: payload.title.trim(),
    body: payload.body.trim(),
    audience: payload.audience || "all",
    batchId: payload.batchId || "",
    channel: payload.channel || "in_app",
    pinned: Boolean(payload.pinned),
    createdBy: session?.userId || "",
    createdByName: session?.name || "Staff",
  });
  logAction("create", "announcement", item.title);
  return item;
}

export function updateAnnouncement(id, patch) {
  return announcementsRepo.update(id, patch);
}

export function removeAnnouncement(id) {
  const item = announcementsRepo.getById(id);
  announcementsRepo.remove(id);
  if (item) logAction("delete", "announcement", item.title);
}

export function getVisibleAnnouncements({ role, batchId } = {}) {
  return listAnnouncements().filter((a) => {
    if (a.audience === "all") return true;
    if (a.audience === "staff" && (role === "teacher" || role === "admin" || role === "super_admin")) {
      return true;
    }
    if (a.audience === "parents" && role === "parent") return true;
    if (a.audience === "batch" && batchId && a.batchId === batchId) return true;
    return false;
  });
}
