# SächScript – Projektplan

## Ziel

SächScript ist eine konfigurierbare Quellsprache, die sächsische Wörter in
TypeScript und JavaScript übersetzt und vorhandenes TypeScript kanonisch nach
SächScript zurückübersetzt. Schlüsselwörter, Operatoren und Satzzeichen werden
über `config/uebersetzungen.json` definiert.

## Aktueller Stand

- 126 normale Regeln und 3 Textsteuerwörter
- 19 beim TypeScript-6.0.3-Abgleich noch offene Tokens
- Einzeldatei- und Projektmodus, Typprüfung und JavaScript-Ausgabe
- bidirektionale Übersetzung mit `wOrt`-Kollisionsschutz
- Diagnosepositionen und Source Maps zurück auf `.saechs`

Die genaue Zuordnung steht in [`VOKABULAR.md`](./VOKABULAR.md).

## Arbeitsstand zum Tagesabschluss (12. September 2026)

Der Kompatibilitäts- und Typblock mit `require`, `assert`, `out` und `intrinsic`
ist implementiert, dokumentiert und getestet. Die Testsuite umfasst 33 Tests;
Projektprüfung und Beispiel-Build sind erfolgreich.

Beim nächsten Termin beginnt die Arbeit mit der gemeinsamen Benennung der 13
Bitoperatoren. Erst wenn die Wortfamilie feststeht, werden Konfiguration,
Roundtrip-Tests und Dokumentation zusammen angepasst. Danach folgen private
Felder und Template-Ausdrücke als erste kontextabhängige Lexer-Erweiterungen.

## Nächste Schritte

### 1. Kompatibilitäts- und Typwörter (erledigt)

Der rein konfigurierbare Block ist umgesetzt:

| TypeScript | Arbeitsvorschlag |
| --- | --- |
| `require` | `brauchma` |
| `assert` | `behaupte` |
| `out` | `raus` |
| `intrinsic` | `eingebaut` |

Abnahme: Hin- und Rückübersetzung, Kollisionsschutz und mindestens ein
syntaktisch gültiges Beispiel pro Kontext.

### 2. Bitoperatoren als geschlossene Wortfamilie (als Nächstes)

Offen sind `&`, `|`, `^`, `~`, `<<`, `>>`, `>>>` sowie `&=`, `|=`, `^=`,
`<<=`, `>>=` und `>>>=`. Vor der Implementierung werden gemeinsam eindeutige
Namen festgelegt. Längste Operatoren müssen beim Tokenisieren Vorrang haben.

Abnahme: alle 13 Operatoren in beide Richtungen, einschließlich eines Tests, der
`>>>`, `>>` und `>` sicher auseinanderhält.

### 3. Kontextabhängige Syntax

- `#` für private Klassenfelder, Arbeitsvorschlag `privatzeichen`
- Template-Strings so zerlegen, dass `${...}` als SächScript geschrieben wird
- Backticks als eigene Textbegrenzung festlegen
- JSX/TSX und das schließende `</` erst nach einer Entscheidung über `.saechsx`
  oder einen Projekt-Schalter aufnehmen

Diese Punkte benötigen Lexer- beziehungsweise Parserarbeit und gehören nicht als
globale Ersetzungsregeln in die JSON-Datei.

### 4. Compiler- und Projektintegration

- `node_modules` nach TypeScript-Regeln auflösen
- `baseUrl`, `paths`, `types` und `lib` in `saechscript.json` abbilden
- `Disposable`-Bibliothek für vollständige `using`-Builds konfigurierbar machen
- Projekt-Roundtrips und gemischte `.saechs`-/`.ts`-Projekte testen

### 5. Entwicklerwerkzeuge

- Vokabulardokumentation automatisch aus der JSON-Datei erzeugen und prüfen
- Formatter für ausgeschriebene Strukturwörter
- VS-Code-Syntaxhervorhebung
- später Sprachserver mit Diagnosen und Vervollständigung

### 6. Stabilisierung und Veröffentlichung

- seltene Tokens `debugger`, `with` und `package` bewusst aufnehmen oder ablehnen
- Vokabularversion unabhängig von der Paketversion verwalten
- Kompatibilitätstests für eigene Regeldateien
- Changelog, CI-Matrix für Node 20/22/24 und Release `0.6.0`

## Erledigte Etappen

1. **MVP:** tokenbasierte Übersetzung, externe JSON-Regeln, CLI, geschützte
   Kommentare und Strings, Tests und baubares Beispiel.
2. **Rückübersetzung:** kanonisches Vokabular, `wOrt`-Schutz und Roundtrips.
3. **Lexer-Grundlage:** reguläre Ausdrücke von Division unterscheiden und
   Template-Strings bis zur vollständigen Unterstützung sicher erhalten.
4. **TypeScript-Anbindung:** JavaScript erzeugen, Syntax- und Typfehler auf den
   Ursprung abbilden, Mehrdateiprojekte und relative Imports verarbeiten.
5. **Source Maps:** erzeugtes JavaScript direkt auf `.saechs` zurückführen.

## Erweiterungsprinzip

Kontextfreie Tokens werden als eindeutiges Quellwort/Zieltoken-Paar in einer
Kategorie unter `regeln` ergänzt. Quellwörter müssen gültige Bezeichner und
kleingeschrieben sein; `wOrt` bleibt die einzige bewusste Ausnahme. Jedes
TypeScript-Token besitzt genau eine kanonische Rückübersetzung. Syntax mit eigener
Bedeutung je nach Kontext wird dagegen im Lexer oder Parser implementiert.
