export function matchesSearch(text, query) {
  if (!query) return true;
  return String(text || "")
    .toLowerCase()
    .includes(String(query).toLowerCase().trim());
}

export function filterStudents(students, { query, batchId, status }) {
  return students.filter((s) => {
    if (batchId && s.batchId !== batchId) return false;
    if (status && s.status !== status) return false;
    if (
      query &&
      !matchesSearch(s.name, query) &&
      !matchesSearch(s.phone, query) &&
      !matchesSearch(s.email, query)
    ) {
      return false;
    }
    return true;
  });
}
