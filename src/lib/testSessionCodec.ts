import type { LearnDirection, PersistedTestSessionData } from "./sessionTypes";

export type RestoredTestSessionState = {
  queue: number[];
  currentRound: number[];
  currentId: number;
  flipped: boolean;
  roundIndex: number;
  direction: LearnDirection;
  onlyDue: boolean;
  streaks: Map<number, number>;
  doneIds: Set<number>;
};

type SerializeArgs = {
  queue: number[];
  currentRound: number[];
  currentId: number;
  flipped: boolean;
  roundIndex: number;
  direction: LearnDirection;
  onlyDue: boolean;
  streaks: Map<number, number>;
  doneIds: Set<number>;
};

export function serializeTestSession(args: SerializeArgs): PersistedTestSessionData {
  return {
    sessionActive: true,
    queue: args.queue,
    currentRound: args.currentRound,
    currentId: args.currentId,
    flipped: args.flipped,
    roundIndex: args.roundIndex,
    direction: args.direction,
    onlyDue: args.onlyDue,
    streaks: Array.from(args.streaks.entries()),
    doneIds: Array.from(args.doneIds),
  };
}

export function restoreTestSession(
  persisted: PersistedTestSessionData
): RestoredTestSessionState | null {
  if (!persisted.sessionActive) return null;
  if (persisted.queue.length === 0) return null;
  if (persisted.currentId == null || !persisted.queue.includes(persisted.currentId)) return null;

  const currentRound =
    persisted.currentRound.length > 0 ? persisted.currentRound : persisted.queue;
  const roundIndex = Math.max(0, Math.min(persisted.roundIndex, currentRound.length - 1));

  // Safety policy: reopened sessions restart streaks to preserve strict 5x behaviour.
  const streaks = new Map<number, number>(persisted.queue.map((id) => [id, 0]));

  return {
    queue: persisted.queue,
    currentRound,
    currentId: persisted.currentId,
    flipped: persisted.flipped,
    roundIndex,
    direction: persisted.direction,
    onlyDue: persisted.onlyDue,
    streaks,
    doneIds: new Set<number>(),
  };
}
