import { useEffect, useMemo, useState } from "react";
import { db } from "../db/db";
import type { VocabEntry } from "../db/db";
import { ensureProgress } from "../db/srs";

type EditorMode = "create" | "edit";
type TagMode = "AND" | "OR";

type EditorState = {
  open: boolean;
  mode: EditorMode;
  id?: number;
  thai: string;
  german: string;
  transliteration: string;
  pos: string;
  lesson?: number;
  tags: string; // comma separated
  exampleThai: string;
  exampleGerman: string;
  error: string;
};

const emptyEditor: EditorState = {
  open: false,
  mode: "create",
  id: undefined,
  thai: "",
  german: "",
  transliteration: "",
  pos: "",
  lesson: undefined,
  tags: "",
  exampleThai: "",
  exampleGerman: "",
  error: "",
};

function normalizeTags(tags: string): string[] {
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function Chip(props: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  title?: string;
}) {
  const { label, selected, onClick, onRemove, title } = props;

  // Theme-Variablen (Light/Dark kompatibel)
  const bg = selected ? "hsla(var(--ring), 0.18)" : "hsl(var(--muted))";
  const border = selected ? "hsl(var(--ring))" : "hsl(var(--border))";
  const text = "hsl(var(--foreground))";

  return (
    <span
      title={title}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        border: `1px solid ${border}`,
        cursor: onClick ? "pointer" : "default",
        background: bg,
        color: text,
        userSelect: "none",
        fontSize: 12,
        lineHeight: 1.2,
      }}
    >
      <span>{label}</span>

      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Entfernen"
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 0,
            lineHeight: 1,
            fontSize: 14,
            color: text,
            opacity: 0.75,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}

export default function VocabList() {
  const [items, setItems] = useState<VocabEntry[]>([]);
  const [q, setQ] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<number | undefined>(undefined);
  const [tagMode, setTagMode] = useState<TagMode>("OR");
  const [editor, setEditor] = useState<EditorState>(emptyEditor);

  async function refresh() {
    setItems(await db.vocab.orderBy("updatedAt").reverse().toArray());
  }

  useEffect(() => {
    void refresh();
  }, []);

  // Alle verfügbaren Tags (für Chips-Bar)
  const allTags = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of items) {
      for (const t of v.tags ?? []) {
        const key = t.trim();
        if (!key) continue;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0], "de"))
      .map(([tag, count]) => ({ tag, count }));
  }, [items]);

  // Alle verfügbaren Lektionen
  const allLessons = useMemo(() => {
    const set = new Set<number>();
    for (const v of items) {
      if (v.lesson !== undefined && v.lesson > 0) {
        set.add(v.lesson);
      }
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [items]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    return items.filter((v) => {
      // Textfilter
      const textOk =
        !s ||
        v.thai.toLowerCase().includes(s) ||
        v.german.toLowerCase().includes(s) ||
        (v.transliteration ?? "").toLowerCase().includes(s) ||
        (v.pos ?? "").toLowerCase().includes(s) ||
        (v.tags ?? []).join(",").toLowerCase().includes(s);

      if (!textOk) return false;

      // Lektionsfilter
      if (activeLesson !== undefined && v.lesson !== activeLesson) {
        return false;
      }

      // Tagfilter
      if (activeTags.length === 0) return true;

      const tagsSet = new Set((v.tags ?? []).map((t) => t.trim()).filter(Boolean));

      if (tagMode === "AND") {
        // alle ausgewählten Tags müssen vorhanden sein
        return activeTags.every((t) => tagsSet.has(t));
      }

      // OR: mindestens ein Tag muss passen
      return activeTags.some((t) => tagsSet.has(t));
    });
  }, [items, q, activeTags, activeLesson, tagMode]);

  function toggleTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  }

  function clearTags() {
    setActiveTags([]);
  }

  function openCreate() {
    setEditor({
      ...emptyEditor,
      open: true,
      mode: "create",
    });
  }

  function openEdit(v: VocabEntry) {
    setEditor({
      open: true,
      mode: "edit",
      id: v.id,
      thai: v.thai ?? "",
      german: v.german ?? "",
      transliteration: v.transliteration ?? "",
      pos: v.pos ?? "",
      lesson: v.lesson,
      tags: (v.tags ?? []).join(", "),
      exampleThai: v.exampleThai ?? "",
      exampleGerman: v.exampleGerman ?? "",
      error: "",
    });
  }

  function closeEditor() {
    setEditor((e) => ({ ...e, open: false, error: "" }));
  }

  async function saveEditor() {
    const thai = editor.thai.trim();
    const german = editor.german.trim();

    if (!thai || !german) {
      setEditor((e) => ({ ...e, error: "Bitte Thai und Deutsch ausfüllen." }));
      return;
    }

    const now = Date.now();
    const payload: Omit<VocabEntry, "id"> = {
      thai,
      german,
      transliteration: editor.transliteration.trim() || undefined,
      lesson: editor.lesson,
      pos: editor.pos.trim() || undefined,
      tags: normalizeTags(editor.tags),
      exampleThai: editor.exampleThai.trim() || undefined,
      exampleGerman: editor.exampleGerman.trim() || undefined,
      createdAt: now, // wird bei edit überschrieben
      updatedAt: now,
    };

    if (editor.mode === "create") {
      const id = await db.vocab.add(payload);
      await ensureProgress(id);
    } else {
      if (!editor.id) {
        setEditor((e) => ({ ...e, error: "Interner Fehler: ID fehlt." }));
        return;
      }
      const existing = await db.vocab.get(editor.id);
      if (!existing) {
        setEditor((e) => ({ ...e, error: "Eintrag nicht gefunden." }));
        return;
      }

      await db.vocab.put({
        ...existing,
        ...payload,
        id: editor.id,
        createdAt: existing.createdAt ?? now,
        updatedAt: now,
      });
    }

    await refresh();
    closeEditor();
  }

  async function remove(id?: number) {
    if (!id) return;
    if (!confirm("Wirklich löschen?")) return;
    await db.vocab.delete(id);
    await db.progress.delete(id);
    await refresh();
  }

  const border = "hsl(var(--border))";
  const bg = "hsl(var(--background))";
  const fg = "hsl(var(--foreground))";
  const mutedFg = "hsl(var(--muted-foreground))";
  const mutedBg = "hsl(var(--muted))";

  return (
    <div style={{ color: fg }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Suche Thai / Deutsch / Transliteration / Tag..."
          style={{
            flex: 1,
            padding: 8,
            background: bg,
            color: fg,
            border: `1px solid ${border}`,
            borderRadius: 8,
          }}
        />
        <button
          onClick={openCreate}
          style={{
            padding: "8px 10px",
            background: mutedBg,
            color: fg,
            border: `1px solid ${border}`,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          + Neu
        </button>
      </div>

      {/* Tag Chips Bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Lektionen Filter */}
          <span style={{ opacity: 0.85, fontSize: 12, color: mutedFg }}>Lektionen:</span>
          <div
            style={{
              display: "inline-flex",
              border: `1px solid ${border}`,
              borderRadius: 4,
              overflow: "hidden",
              background: bg,
            }}
          >
            <button
              onClick={() => setActiveLesson(undefined)}
              style={{
                padding: "4px 10px",
                border: "none",
                cursor: "pointer",
                background: activeLesson === undefined ? "hsla(var(--ring), 0.18)" : "transparent",
                color: fg,
                borderRight: `1px solid ${border}`,
              }}
              title="Alle Lektionen anzeigen"
            >
              Alle
            </button>
            {allLessons.map((lesson) => (
              <button
                key={lesson}
                onClick={() => setActiveLesson(lesson)}
                style={{
                  padding: "4px 10px",
                  border: "none",
                  cursor: "pointer",
                  background: activeLesson === lesson ? "hsla(var(--ring), 0.18)" : "transparent",
                  color: fg,
                  borderRight: `1px solid ${border}`,
                }}
                title={`Lektion ${lesson}`}
              >
                L{lesson}
              </button>
            ))}
          </div>

          <span style={{ marginLeft: 12, opacity: 0.85, fontSize: 12, color: mutedFg }}>Tags:</span>

          <span style={{ marginLeft: 6, opacity: 0.85, fontSize: 12, color: mutedFg }}>
            Modus:
          </span>

          <div
            style={{
              display: "inline-flex",
              border: `1px solid ${border}`,
              borderRadius: 999,
              overflow: "hidden",
              background: bg,
            }}
          >
            <button
              onClick={() => setTagMode("OR")}
              style={{
                padding: "4px 10px",
                border: "none",
                cursor: "pointer",
                background: tagMode === "OR" ? "hsla(var(--ring), 0.18)" : "transparent",
                color: fg,
              }}
              title="OR: mind. ein Tag muss passen"
            >
              OR
            </button>
            <button
              onClick={() => setTagMode("AND")}
              style={{
                padding: "4px 10px",
                border: "none",
                cursor: "pointer",
                background: tagMode === "AND" ? "hsla(var(--ring), 0.18)" : "transparent",
                borderLeft: `1px solid ${border}`,
                color: fg,
              }}
              title="AND: alle Tags müssen passen"
            >
              AND
            </button>
          </div>

          {allTags.length === 0 && (
            <span style={{ opacity: 0.85, fontSize: 12, color: mutedFg }}>
              Keine Tags vorhanden.
            </span>
          )}

          {allTags.map(({ tag, count }) => (
            <Chip
              key={tag}
              label={`${tag} (${count})`}
              selected={activeTags.includes(tag)}
              onClick={() => toggleTag(tag)}
              title="Klicken zum Filtern"
            />
          ))}

          {activeTags.length > 0 && (
            <>
              <span style={{ marginLeft: 6, opacity: 0.85, fontSize: 12, color: mutedFg }}>
                Aktiv:
              </span>
              {activeTags.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  selected
                  onRemove={() => toggleTag(t)}
                  title="Filter entfernen"
                />
              ))}
              <button
                onClick={clearTags}
                style={{
                  marginLeft: 6,
                  padding: "6px 10px",
                  background: "transparent",
                  color: fg,
                  border: `1px solid ${border}`,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Alle Filter löschen
              </button>
            </>
          )}
        </div>

        {activeTags.length > 0 && (
          <p style={{ marginTop: 6, marginBottom: 0, opacity: 0.9, fontSize: 12, color: mutedFg }}>
            Aktiver Tag-Filter: <b style={{ color: fg }}>{tagMode}</b> —{" "}
            {tagMode === "OR"
              ? "Eintrag muss mindestens einen Tag haben."
              : "Eintrag muss alle Tags haben."}
          </p>
        )}
      </div>

      {/* Table */}
      <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: `1px solid ${border}` }}>
            <th>Thai</th>
            <th>Deutsch</th>
            <th>Lektion</th>
            <th>Translit.</th>
            <th>Wortart</th>
            <th>Tags</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((v) => (
            <tr key={v.id} style={{ borderBottom: `1px solid ${border}` }}>
              <td style={{ fontSize: 18 }}>{v.thai}</td>
              <td>{v.german}</td>
              <td style={{ color: mutedFg, textAlign: "center" }}>
                {v.lesson ? `L${v.lesson}` : "—"}
              </td>
              <td style={{ color: mutedFg }}>{v.transliteration ?? ""}</td>
              <td style={{ color: mutedFg }}>{v.pos ?? ""}</td>

              <td style={{ opacity: 0.98 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(v.tags ?? []).length === 0 && <span style={{ color: mutedFg }}>—</span>}
                  {(v.tags ?? []).map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      selected={activeTags.includes(t)}
                      onClick={() => toggleTag(t)}
                      title="Klicken zum Filtern"
                    />
                  ))}
                </div>
              </td>

              <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                <button
                  onClick={() => openEdit(v)}
                  style={{
                    marginRight: 8,
                    padding: "6px 10px",
                    background: "transparent",
                    color: fg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => remove(v.id)}
                  style={{
                    padding: "6px 10px",
                    background: "transparent",
                    color: fg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  Löschen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && <p style={{ color: mutedFg }}>Keine Treffer.</p>}

      {/* Modal */}
      {editor.open && (
        <div
          onClick={closeEditor}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(720px, 100%)",
              background: bg,
              color: fg,
              borderRadius: 12,
              padding: 16,
              border: `1px solid ${border}`,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <h3 style={{ margin: 0 }}>
                {editor.mode === "create" ? "Neue Vokabel" : "Vokabel bearbeiten"}
              </h3>
              <button
                onClick={closeEditor}
                title="Schließen"
                style={{
                  border: `1px solid ${border}`,
                  background: "transparent",
                  color: fg,
                  borderRadius: 8,
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {editor.error && (
              <p
                style={{
                  background: "hsla(0, 100%, 60%, 0.12)",
                  border: "1px solid hsla(0, 100%, 60%, 0.25)",
                  padding: 10,
                  borderRadius: 8,
                  color: fg,
                }}
              >
                {editor.error}
              </p>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Thai *</span>
                <input
                  value={editor.thai}
                  onChange={(e) => setEditor((x) => ({ ...x, thai: e.target.value, error: "" }))}
                  style={{
                    padding: 8,
                    background: bg,
                    color: fg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                  }}
                  placeholder="z.B. กิน"
                  autoFocus
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Deutsch *</span>
                <input
                  value={editor.german}
                  onChange={(e) => setEditor((x) => ({ ...x, german: e.target.value, error: "" }))}
                  style={{
                    padding: 8,
                    background: bg,
                    color: fg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                  }}
                  placeholder="z.B. essen"
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Transliteration</span>
                <input
                  value={editor.transliteration}
                  onChange={(e) => setEditor((x) => ({ ...x, transliteration: e.target.value }))}
                  style={{
                    padding: 8,
                    background: bg,
                    color: fg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                  }}
                  placeholder="z.B. gin"
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Wortart</span>
                <input
                  value={editor.pos}
                  onChange={(e) => setEditor((x) => ({ ...x, pos: e.target.value }))}
                  style={{
                    padding: 8,
                    background: bg,
                    color: fg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                  }}
                  placeholder="z.B. Verb / Nomen"
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Lektion</span>
                <input
                  type="number"
                  value={editor.lesson ?? ""}
                  onChange={(e) => setEditor((x) => ({ ...x, lesson: e.target.value ? parseInt(e.target.value, 10) : undefined }))}
                  style={{
                    padding: 8,
                    background: bg,
                    color: fg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                  }}
                  placeholder="z.B. 1, 2, 3..."
                  min="1"
                />
              </label>

              <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>
                <span>Tags (Komma-getrennt)</span>
                <input
                  value={editor.tags}
                  onChange={(e) => setEditor((x) => ({ ...x, tags: e.target.value }))}
                  style={{
                    padding: 8,
                    background: bg,
                    color: fg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                  }}
                  placeholder="z.B. Food, A1"
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Beispiel Thai</span>
                <textarea
                  value={editor.exampleThai}
                  onChange={(e) => setEditor((x) => ({ ...x, exampleThai: e.target.value }))}
                  style={{
                    padding: 8,
                    minHeight: 70,
                    resize: "vertical",
                    background: bg,
                    color: fg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                  }}
                  placeholder="z.B. ฉันกินข้าว"
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Beispiel Deutsch</span>
                <textarea
                  value={editor.exampleGerman}
                  onChange={(e) => setEditor((x) => ({ ...x, exampleGerman: e.target.value }))}
                  style={{
                    padding: 8,
                    minHeight: 70,
                    resize: "vertical",
                    background: bg,
                    color: fg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                  }}
                  placeholder="z.B. Ich esse Reis."
                />
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
              <button
                onClick={closeEditor}
                style={{
                  padding: "8px 10px",
                  background: "transparent",
                  color: fg,
                  border: `1px solid ${border}`,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={saveEditor}
                style={{
                  padding: "8px 10px",
                  background: mutedBg,
                  color: fg,
                  border: `1px solid ${border}`,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                {editor.mode === "create" ? "Speichern" : "Änderungen speichern"}
              </button>
            </div>

            <p style={{ marginTop: 10, color: mutedFg }}>
              Tipp: Tags als Komma-Liste, z.B. <code>Food, A1</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}