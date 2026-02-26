export function loadSession<T>(
  key: string,
  isValid?: (value: unknown) => value is T
): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (isValid && !isValid(parsed)) return null;
    return parsed as T;
  } catch {
    return null;
  }
}

export function saveSession<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write failures (e.g., quota/private mode)
  }
}

export function clearSession(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage remove failures
  }
}
