import * as sessionRepo from "../repositories/sessionRepo";
import * as usersRepo from "../repositories/usersRepo";

export function getSession() {
  return sessionRepo.get();
}

export function login(email, password) {
  const user = usersRepo.getByEmail(email);
  if (!user || user.password !== password) {
    return { ok: false, error: "Invalid email or password." };
  }
  if (user.status === "inactive") {
    return { ok: false, error: "This account is inactive." };
  }
  const session = {
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  };
  sessionRepo.set(session);
  return { ok: true, session };
}

export function logout() {
  sessionRepo.clear();
}

export function isSuperAdmin(session = getSession()) {
  return session?.role === "super_admin";
}

export function isAdmin(session = getSession()) {
  return session?.role === "admin" || isSuperAdmin(session);
}

export function canAccessSettings(session = getSession()) {
  return isAdmin(session);
}

export function canManageTeachers(session = getSession()) {
  return isSuperAdmin(session);
}

export function canMutateBatches(session = getSession()) {
  return isAdmin(session);
}

export function canMutatePayments(session = getSession()) {
  return isAdmin(session);
}

export function isParent(session = getSession()) {
  return session?.role === "parent";
}

export function isStaff(session = getSession()) {
  return (
    session?.role === "teacher" ||
    session?.role === "admin" ||
    session?.role === "super_admin"
  );
}

export function roleLabel(role) {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Admin";
  if (role === "teacher") return "Teacher";
  if (role === "parent") return "Parent";
  return role || "Guest";
}
