import { VowelPhaseSession } from "./VowelPhaseSession";
import { PHASE1_VOWELS } from "./vowelsContent";

type Props = {
  onExitFullscreen: () => void;
};

export function VowelPhase1Section({ onExitFullscreen }: Props) {
  return (
    <VowelPhaseSession
      entries={PHASE1_VOWELS}
      sessionTitle="✏️ Thai Schrift – Vokale (Teil 1)"
      ariaTitleId="thai-vowel-session-phase1"
      onExitFullscreen={onExitFullscreen}
    />
  );
}
