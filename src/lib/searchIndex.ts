// Pure helpers for the header search: which passport sections and garments
// match what was typed. Diacritics and case are ignored (so "garde robe",
// "Garde-robe" and "guarda roupa" all work).
export type SearchEntry = { id: string; label: string; hint: string; screen: number };

export const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[-_]/g, " ").trim();

export function searchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(/\s+/);
  return entries.filter((e) => {
    const hay = normalize(`${e.label} ${e.hint}`);
    return words.every((w) => hay.includes(w));
  });
}
