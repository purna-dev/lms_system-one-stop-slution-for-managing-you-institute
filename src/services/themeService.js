import { read, write } from "../repositories/storage";

const KEY = "theme";
export const THEMES = [
  { id: "minimal", label: "Slick Light" },
  { id: "night", label: "Soft Night" },
];

export function getTheme() {
  const saved = read(KEY, "minimal");
  return THEMES.some((t) => t.id === saved) ? saved : "minimal";
}

export function setTheme(themeId) {
  const next = THEMES.some((t) => t.id === themeId) ? themeId : "minimal";
  write(KEY, next);
  applyTheme(next);
  return next;
}

export function applyTheme(themeId = getTheme()) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", themeId);
}

export function toggleTheme() {
  const current = getTheme();
  return setTheme(current === "minimal" ? "night" : "minimal");
}
