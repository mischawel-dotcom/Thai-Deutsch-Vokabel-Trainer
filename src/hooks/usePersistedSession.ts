import { useCallback, useEffect, useState } from "react";
import { clearSession, loadSession, saveSession } from "../lib/sessionStorage";

type UsePersistedSessionArgs<T> = {
  key: string;
  isValid: (value: unknown) => value is T;
};

export function usePersistedSession<T>({ key, isValid }: UsePersistedSessionArgs<T>) {
  const [hydrated, setHydrated] = useState(false);
  const [restoredSession, setRestoredSession] = useState<T | null>(null);

  useEffect(() => {
    const restored = loadSession<T>(key, isValid);
    if (restored) {
      setRestoredSession(restored);
    } else {
      clearSession(key);
    }
    setHydrated(true);
  }, [key, isValid]);

  const savePersistedSession = useCallback(
    (value: T) => {
      saveSession(key, value);
    },
    [key]
  );

  const clearPersistedSession = useCallback(() => {
    clearSession(key);
  }, [key]);

  return {
    hydrated,
    restoredSession,
    savePersistedSession,
    clearPersistedSession,
  };
}
