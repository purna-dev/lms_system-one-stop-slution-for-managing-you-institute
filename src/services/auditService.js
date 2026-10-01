import { auditRepo } from "../repositories/auditRepo";
import { getSession } from "./authService";

export function logAction(action, entity, details = "") {
  const session = getSession();
  return auditRepo.create({
    action,
    entity,
    details,
    actorId: session?.userId || "system",
    actorName: session?.name || "System",
    at: new Date().toISOString(),
  });
}

export function listAuditLogs(limit = 100) {
  return auditRepo
    .getAll()
    .sort((a, b) => String(b.at).localeCompare(String(a.at)))
    .slice(0, limit);
}
