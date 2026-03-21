import { ConsonantClassSession } from "./ConsonantClassSession";
import { LOW_CLASS_CONSONANTS } from "./content";

type Props = {
  onExitFullscreen: () => void;
};

export function LowClassConsonantsSection({ onExitFullscreen }: Props) {
  return (
    <ConsonantClassSession
      entries={LOW_CLASS_CONSONANTS}
      classLabelDe="Tief"
      sessionTitle="✏️ Thai Schrift – Tiefklasse"
      ariaTitleId="thai-consonant-session-low"
      onExitFullscreen={onExitFullscreen}
    />
  );
}
