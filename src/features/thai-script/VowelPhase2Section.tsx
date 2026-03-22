import { VowelPhaseSession } from "./VowelPhaseSession";
import { PHASE2_VOWELS } from "./vowelsContent";

type Props = {
  onExitFullscreen: () => void;
};

export function VowelPhase2Section({ onExitFullscreen }: Props) {
  return (
    <VowelPhaseSession
      entries={PHASE2_VOWELS}
      sessionTitle="✏️ Thai Schrift – Vokale (Teil 2)"
      ariaTitleId="thai-vowel-session-phase2"
      onExitFullscreen={onExitFullscreen}
    />
  );
}
