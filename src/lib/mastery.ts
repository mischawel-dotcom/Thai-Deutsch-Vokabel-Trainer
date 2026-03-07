const STORAGE_DATE_KEY = "masteredTodayDate";
const STORAGE_IDS_KEY = "masteredTodayIds";

function getTodayKey(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function loadIdsForToday(): number[] {
  const today = getTodayKey();
  const storedDate = localStorage.getItem(STORAGE_DATE_KEY);
  if (storedDate !== today) {
    localStorage.setItem(STORAGE_DATE_KEY, today);
    localStorage.setItem(STORAGE_IDS_KEY, "[]");
    return [];
  }

  const raw = localStorage.getItem(STORAGE_IDS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => Number.isInteger(v)) : [];
  } catch {
    return [];
  }
}

function saveIds(ids: number[]): void {
  localStorage.setItem(STORAGE_IDS_KEY, JSON.stringify(ids));
}

export function recordMasteredToday(entryId: number): void {
  const ids = loadIdsForToday();
  if (ids.includes(entryId)) return;
  ids.push(entryId);
  saveIds(ids);
}

export function getMasteredTodayCount(): number {
  return loadIdsForToday().length;
}
