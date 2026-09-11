# SächScript – Projektplan

## Ziel

SächScript ist eine konfigurierbare Quellsprache, die sächsische Wörter in
TypeScript übersetzt. Nicht nur Schlüsselwörter, sondern auch Operatoren und
Satzzeichen werden über `config/uebersetzungen.json` definiert.

## Etappen

1. **MVP (erledigt):** tokenbasierte Übersetzung, externe JSON-Regeln, CLI,
   Kommentare und Strings schützen, Tests und baubares Beispiel.
2. **Rückübersetzung (erledigt):** TypeScript nach SächScript, kanonisches
   Vokabular, `wOrt`-Schutz und Roundtrip-Tests.
3. **Parser (teilweise erledigt):** reguläre Ausdrücke korrekt erkennen und
   Template-Strings sicher erhalten. Ihre Ausdrücke werden noch nicht übersetzt.
4. **TypeScript-Anbindung (weitgehend erledigt):** JavaScript erzeugen, Syntax-
   und Typfehler zurückführen, mehrere Dateien gemeinsam prüfen und relative
   Imports auflösen und echte Source Maps zurück auf `.saechs` erzeugen.
5. **Werkzeuge:** VS-Code-Syntaxhervorhebung, Formatter, Sprachserver und
   automatische Dokumentation der verfügbaren Wörter.
6. **Sprache stabilisieren:** Dialektbeirat, reservierte Wörter, Versionierung der
   Regeln und Kompatibilitätstests.

## Erweiterungsprinzip

Neue Übersetzungen werden ausschließlich als Quellwort/Zieltoken-Paar in einer
Kategorie unter `regeln` ergänzt. Quellwörter müssen gültige Bezeichner sein.
Dadurch kann etwa `hoch` zu `**`, `optional` zu `?.` oder `doppelFrage` zu `??`
werden, ohne den Transpiler-Code anzufassen.
