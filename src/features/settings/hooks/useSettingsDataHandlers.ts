import { useCallback } from "react";
import { downloadBackup, importBackup } from "@/features/vocab/backup";
import { exportCsv, importCsv } from "@/features/vocab/csv";
import type { ImportCsvResult } from "@/features/vocab/csv";

type UseSettingsDataHandlersArgs = {
  setMsg: (message: string) => void;
  setIsLoading: (loading: boolean) => void;
  refreshVocabCount: () => Promise<void>;
  refreshBackupTime: () => void;
  latestCsvUrls: string[];
};

function buildImportMessage(result: ImportCsvResult): string {
  if (result.added === 0 && result.duplicates > 0) {
    return (
      `⚠️ Import ersetzt Alt-Daten, aber Datei enthält nur Duplikate (${result.duplicates})` +
      (result.invalidRows > 0 ? `, ${result.invalidRows} ungültige Zeilen ignoriert` : "")
    );
  }

  if (result.replaced) {
    return (
      `✅ Alt-Daten ersetzt: ${result.added} Einträge importiert` +
      (result.preservedProgress > 0
        ? `, Lernfortschritt für ${result.preservedProgress} bestehende Karten behalten`
        : "") +
      (result.removed > 0 ? `, ${result.removed} alte Karten entfernt` : "") +
      (result.duplicates > 0 ? `, ${result.duplicates} Datei-Duplikate verworfen` : "") +
      (result.invalidRows > 0 ? `, ${result.invalidRows} ungültige Zeilen ignoriert` : "")
    );
  }

  return (
    `✅ Importiert: ${result.added} Einträge` +
    (result.duplicates > 0 ? `, ${result.duplicates} Duplikate übersprungen` : "") +
    (result.invalidRows > 0 ? `, ${result.invalidRows} ungültige Zeilen ignoriert` : "")
  );
}

function validateDownloadedCsv(csvText: string): number {
  const normalized = csvText.replace(/^\uFEFF/, "");
  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV ist leer oder unvollständig");
  }

  const header = lines[0].toLowerCase();
  if (!header.includes("thai") || !header.includes("german")) {
    throw new Error("CSV-Header ungültig (erwarte mindestens thai/german)");
  }

  const rowCount = lines.length - 1;
  if (rowCount < 1000) {
    throw new Error(`CSV scheint veraltet oder unvollständig (${rowCount} Zeilen)`);
  }

  return rowCount;
}

export function useSettingsDataHandlers({
  setMsg,
  setIsLoading,
  refreshVocabCount,
  refreshBackupTime,
  latestCsvUrls,
}: UseSettingsDataHandlersArgs) {
  const onImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        setIsLoading(true);
        const result = await importCsv(file, { mode: "replace" });
        setMsg(buildImportMessage(result));
        await refreshVocabCount();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setMsg(`❌ Fehler: ${message}`);
      } finally {
        setIsLoading(false);
        e.target.value = "";
      }
    },
    [refreshVocabCount, setIsLoading, setMsg]
  );

  const onExport = useCallback(async () => {
    try {
      const blob = await exportCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "thai-de-vocab.csv";
      a.click();
      URL.revokeObjectURL(url);
      setMsg("✅ Export erfolgreich");
      setTimeout(() => setMsg(""), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMsg(`❌ Export-Fehler: ${message}`);
    }
  }, [setMsg]);

  const onBackupExport = useCallback(async () => {
    try {
      setIsLoading(true);
      await downloadBackup();
      refreshBackupTime();
      setMsg("✅ Backup erfolgreich heruntergeladen");
      setTimeout(() => setMsg(""), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMsg(`❌ Backup-Fehler: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [refreshBackupTime, setIsLoading, setMsg]);

  const onBackupImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const confirmed = window.confirm(
        "⚠️ Backup wiederherstellen?\n\nDieser Vorgang überschreibt den aktuellen App-Stand (Vokabeln, Zahlen, Sätze, Lernfortschritt und Einstellungen)."
      );
      if (!confirmed) {
        e.target.value = "";
        return;
      }
      try {
        setIsLoading(true);
        const result = await importBackup(file);
        await refreshVocabCount();
        refreshBackupTime();
        setMsg(
          `✅ Backup importiert: ${result.vocabCount} Vokabeln, ${result.progressCount} Vokabel-Fortschritte, ` +
            `${result.numbersVocabCount} Zahlen, ${result.numbersProgressCount} Zahlen-Fortschritte, ` +
            `${result.sentencesVocabCount} Sätze, ${result.sentencesProgressCount} Satz-Fortschritte. ` +
            "Bitte Seite neu laden, damit alle Ansichten den wiederhergestellten Stand anzeigen."
        );
        setTimeout(() => setMsg(""), 5000);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setMsg(`❌ Backup-Import fehlgeschlagen: ${message}`);
      } finally {
        setIsLoading(false);
        e.target.value = "";
      }
    },
    [refreshBackupTime, refreshVocabCount, setIsLoading, setMsg]
  );

  const importLatestCsvDirectly = useCallback(async () => {
    try {
      setIsLoading(true);
      const cacheBust = Date.now();
      const errors: string[] = [];

      for (const baseUrl of latestCsvUrls) {
        const separator = baseUrl.includes("?") ? "&" : "?";
        const url = `${baseUrl}${separator}cb=${cacheBust}`;

        try {
          const response = await fetch(url, {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          });
          if (!response.ok) {
            errors.push(`${baseUrl} -> HTTP ${response.status}`);
            continue;
          }

          const csvText = await response.text();
          const rowCount = validateDownloadedCsv(csvText);
          const file = new File([csvText], "thai-de-vocab_Ver_2.csv", {
            type: "text/csv;charset=utf-8",
          });
          const result = await importCsv(file, { mode: "replace" });
          const baseMessage = buildImportMessage(result).replace(/^✅\s*/, "");
          setMsg(`✅ Direktimport erfolgreich (${rowCount} Zeilen): ${baseMessage}`);
          await refreshVocabCount();
          return;
        } catch (sourceError) {
          const message = sourceError instanceof Error ? sourceError.message : String(sourceError);
          errors.push(`${baseUrl} -> ${message}`);
        }
      }

      throw new Error(`Alle Quellen fehlgeschlagen: ${errors.join(" | ")}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMsg(`❌ Direktimport fehlgeschlagen: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [latestCsvUrls, refreshVocabCount, setIsLoading, setMsg]);

  const downloadLatestCsv = useCallback(() => {
    const url = `${latestCsvUrls[0]}?cb=${Date.now()}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [latestCsvUrls]);

  return {
    onImport,
    onExport,
    onBackupExport,
    onBackupImport,
    importLatestCsvDirectly,
    downloadLatestCsv,
  };
}

