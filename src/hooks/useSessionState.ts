import { useReducer, useCallback } from "react";

export type SessionState = {
  sessionActive: boolean;
  queue: number[];
  currentId: number | null;
  flipped: boolean;
  streaks: Map<number, number>;
  doneIds: Set<number>;
  currentRound: number[];
  roundIndex: number;
};

export type SessionAction =
  | { type: "set"; payload: Partial<SessionState> }
  | { type: "updateStreak"; id: number; value: number }
  | { type: "resetStreak"; id: number }
  | { type: "addDone"; id: number };

const initialSessionState: SessionState = {
  sessionActive: false,
  queue: [],
  currentId: null,
  flipped: false,
  streaks: new Map(),
  doneIds: new Set(),
  currentRound: [],
  roundIndex: 0,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "set":
      return { ...state, ...action.payload };
    case "updateStreak": {
      const newStreaks = new Map(state.streaks);
      newStreaks.set(action.id, action.value);
      return { ...state, streaks: newStreaks };
    }
    case "resetStreak": {
      const newStreaks = new Map(state.streaks);
      newStreaks.set(action.id, 0);
      return { ...state, streaks: newStreaks };
    }
    case "addDone": {
      const newDoneIds = new Set(state.doneIds);
      newDoneIds.add(action.id);
      return { ...state, doneIds: newDoneIds };
    }
    default:
      return state;
  }
}

/**
 * Hook für Session State Management
 * Verwaltet den Zustand einer Test-Session (aktive Karten, Fortschritt, Streaks)
 */
export function useSessionState() {
  const [session, dispatchSession] = useReducer(sessionReducer, initialSessionState);

  const flipCard = useCallback(() => {
    if (!session.flipped) {
      dispatchSession({ type: "set", payload: { flipped: true } });
    }
  }, [session.flipped]);

  return {
    session,
    dispatchSession,
    // Actions
    flipCard,
  };
}
