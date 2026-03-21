import { ConsonantClassSession } from "./ConsonantClassSession";
import { HIGH_CLASS_CONSONANTS } from "./content";

type Props = {
  onExitFullscreen: () => void;
};

export function HighClassConsonantsSection({ onExitFullscreen }: Props) {
  return (
    <ConsonantClassSession
      entries={HIGH_CLASS_CONSONANTS}
      classLabelDe="Hoch"
      sessionTitle="✏️ Thai Schrift – Hochklasse"
      ariaTitleId="thai-consonant-session-high"
      onExitFullscreen={onExitFullscreen}
    />
  );
}
