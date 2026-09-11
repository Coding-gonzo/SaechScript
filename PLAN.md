# SächScript – Projektplan

## Ziel

SächScript ist eine konfigurierbare Quellsprache, die sächsische Wörter in
TypeScript übersetzt. Nicht nur Schlüsselwörter, sondern auch Operatoren und
Satzzeichen werden über `config/uebersetzungen.json` definiert.

## Etappen

1. **MVP (erledigt):** tokenbasierte Übersetzung, externe JSON-Regeln, CLI,
   Kommentare und Strings schützen, Tests und baubares Beispiel.
2. **Rückübersetzung (aktuell):** TypeScript nach SächScript, kanonisches
   Vokabular, `wOrt`-Schutz und Roundtrip-Tests.
3. **Parser:** Template-String-Ausdrücke und reguläre Ausdrücke korrekt erkennen,
   genaue Diagnose mit Zeile/Spalte sowie optionale kompakte Formatierung.
4. **TypeScript-Anbindung:** TypeScript-Compiler aufrufen, JavaScript und Source
   Maps erzeugen, Fehlerpositionen auf `.saechs` zurückführen.
5. **Werkzeuge:** VS-Code-Syntaxhervorhebung, Formatter, Sprachserver und
   automatische Dokumentation der verfügbaren Wörter.
6. **Sprache stabilisieren:** Dialektbeirat, reservierte Wörter, Versionierung der
   Regeln und Kompatibilitätstests.

## Erweiterungsprinzip

Neue Übersetzungen werden ausschließlich als Quellwort/Zieltoken-Paar in einer
Kategorie unter `regeln` ergänzt. Quellwörter müssen gültige Bezeichner sein.
Dadurch kann etwa `hoch` zu `**`, `optional` zu `?.` oder `doppelFrage` zu `??`
werden, ohne den Transpiler-Code anzufassen.
