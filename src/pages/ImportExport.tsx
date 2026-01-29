import { useState } from "react";
import { importCsv, exportCsv } from "../features/vocab/csv";

export default function ImportExport() {
  const [msg, setMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsLoading(true);
      const result = await importCsv(file);
      if (result.added === 0 && result.duplicates > 0) {
        setMsg(`⚠️ Keine neuen Einträge: ${result.duplicates} Duplikate gefunden`);
      } else {
        setMsg(`✅ Importiert: ${result.added} Einträge${result.duplicates > 0 ? `, ${result.duplicates} Duplikate übersprungen` : ''}`);
      }
    } catch (err: any) {
      setMsg(`❌ Fehler: ${err?.message ?? String(err)}`);
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  }

  async function onExport() {
    const blob = await exportCsv();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "thai-de-vocab.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h3>CSV Import</h3>
      {isLoading ? (
        <p>⏳ Lade Vokabeln...</p>
      ) : (
        <input type="file" accept=".csv,text/csv" onChange={onImport} />
      )}

      <h3 style={{ marginTop: 20 }}>CSV Export</h3>
      <button onClick={onExport}>Export herunterladen</button>

      <p style={{ marginTop: 16, opacity: 0.8 }}>
        CSV Header:{" "}
        <code>
          thai,german,transliteration,pos,tags,lesson,exampleThai,exampleGerman
        </code>
      </p>

      {msg && <p>{msg}</p>}
    </div>
  );
}