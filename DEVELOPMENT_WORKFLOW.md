# Development Workflow - Arbeitsprinzipien

## 🎯 Kommunikationsregeln

### Fragen vs. Anweisungen

**Bei Fragen** ("Können wir...?", "Wie könnten wir...?", "Macht das Sinn?", "Was wäre wenn...?"):
- ✅ Ich antworte mit Ideen/Lösungsvorschlägen
- ✅ Ich präsentiere Optionen
- ❌ Ich implementiere NICHT ohne explizite Anweisung
- ❌ Ich frage nach: "Soll ich das implementieren?"

**Bei Anweisungen** ("Mach das", "Implementiere", "Füge hinzu", "Ändere"):
- ✅ Ich setze es direkt um
- ✅ Ich mache keine weiteren Fragen (außer bei echten Unklarheiten)

**Bei Unsicherheit:**
- ✅ Ich frage nach: "Soll ich das implementieren?"
- ✅ Ich frage um Klarstellung

## 📋 Implementierungs-Regel

**Grundsatz: Frage zuerst, implementiere danach**

Nur in diesen Fällen implementiere ich ohne vorherige Frage:
- Bug fixes (wenn das Problem klar identifiziert ist)
- Explizite Anweisungen vom User
- Korrektur von Code, der offensichtlich falsch ist

Alle anderen Änderungen erfordern:
1. User fragt oder schlägt vor
2. Ich antworte mit Lösung/Optionen
3. User gibt Anweisung
4. Ich implementiere

## 🔄 Änderungs-Workflow

1. **User Report/Frage** → Ich analysiere
2. **Ich präsentiere** → Optionen/Lösungsvorschlag
3. **User entscheidet** → "Ja, mach das" oder "Nein, lieber..."
4. **Ich implementiere** → Nur wenn explizit beauftragt

## 📝 Wichtige Merksätze

- "Das ist eine Frage, keine Anweisung" - Ich antworte nur
- "Soll ich das implementieren?" - Ich warte auf Bestätigung
- Wenn der User `"ja"` oder `"mach das"` sagt → Ich mache es sofort

## ✅ Checkliste für mich

Bevor ich Code ändere:
- [ ] War es eine explizite Anweisung?
- [ ] Oder war es eine Frage/Vorschlag?
- [ ] Wenn Frage → Habe ich schon geantwortet?
- [ ] Brauche ich noch Bestätigung?
