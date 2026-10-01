import { leadsRepo } from "../repositories/leadsRepo";
import * as studentsRepo from "../repositories/studentsRepo";
import { todayISO } from "../utils/date";
import { logAction } from "./auditService";

export function listLeads({ status } = {}) {
  return leadsRepo
    .getAll()
    .filter((l) => !status || l.status === status)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function createLead(payload) {
  if (!payload.name?.trim()) throw new Error("Name is required.");
  if (!payload.phone?.trim()) throw new Error("Phone is required.");
  const lead = leadsRepo.create({
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email || "",
    interestedBatchId: payload.interestedBatchId || "",
    source: payload.source || "walk-in",
    status: payload.status || "new",
    notes: payload.notes || "",
    followUpDate: payload.followUpDate || "",
  });
  logAction("create", "lead", lead.name);
  return lead;
}

export function updateLead(id, patch) {
  const lead = leadsRepo.update(id, patch);
  if (lead) logAction("update", "lead", lead.name);
  return lead;
}

export function removeLead(id) {
  const lead = leadsRepo.getById(id);
  leadsRepo.remove(id);
  if (lead) logAction("delete", "lead", lead.name);
}

export function convertLeadToStudent(leadId, { batchId, joinDate } = {}) {
  const lead = leadsRepo.getById(leadId);
  if (!lead) throw new Error("Lead not found.");
  if (!batchId) throw new Error("Batch is required to enroll.");
  const student = studentsRepo.create({
    name: lead.name,
    email: lead.email || `${lead.phone}@parent.demo`,
    phone: lead.phone,
    batchId,
    status: "active",
    joinDate: joinDate || todayISO(),
    guardianName: lead.name,
    notes: `Converted from lead ${lead.id}`,
  });
  leadsRepo.update(leadId, {
    status: "enrolled",
    convertedStudentId: student.id,
  });
  logAction("convert", "lead", `${lead.name} → ${student.id}`);
  return student;
}

export function leadPipelineStats() {
  const all = leadsRepo.getAll();
  const statuses = ["new", "contacted", "follow_up", "enrolled", "lost"];
  return statuses.map((status) => ({
    status,
    count: all.filter((l) => l.status === status).length,
  }));
}
