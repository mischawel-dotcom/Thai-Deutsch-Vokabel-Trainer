import { ConsonantClassSession } from "./ConsonantClassSession";
import { MID_CLASS_CONSONANTS } from "./content";

type Props = {
  onExitFullscreen: () => void;
};

export function MidClassConsonantsSection({ onExitFullscreen }: Props) {
  return (
    <ConsonantClassSession
      entries={MID_CLASS_CONSONANTS}
      classLabelDe="Mitte"
      sessionTitle="✏️ Thai Schrift – Mittelklasse"
      ariaTitleId="thai-consonant-session-mid"
      onExitFullscreen={onExitFullscreen}
    />
  );
}
