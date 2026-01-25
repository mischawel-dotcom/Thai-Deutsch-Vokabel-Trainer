import { useEffect, useState } from "react";
import { db } from "../db/db";

export default function Home() {
  const [dueCount, setDueCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const run = async () => {
      const now = Date.now();
      const due = await db.progress.where("dueAt").belowOrEqual(now).count();
      const vocab = await db.vocab.count();
      setDueCount(due);
      setTotal(vocab);
    };
    run();
  }, []);

  return (
    <div>
      <p><b>Vokabeln:</b> {total} &nbsp; | &nbsp; <b>Heute fällig:</b> {dueCount}</p>
      <p style={{ marginTop: 16, opacity: 0.8 }}>
        Tipp: Importiere die Sample-CSV über Import/Export, dann hast du sofort Karten.
      </p>
    </div>
  );
}