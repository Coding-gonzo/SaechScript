# SächScript

**TypeScript goes sächsisch.** SächScript übersetzt ausgeschriebene sächsische
Quelltexte nach TypeScript und JavaScript – und vorhandenes TypeScript wieder
zurück nach SächScript.

```saechs
machema addiere klammeruff a doppelpunkt nummer komma b doppelpunkt nummer klammerzu doppelpunkt nummer geschweifteAuf
  gibbe a machmehr b semikolon
geschweifteZu

dauerdings ergebnis issgleich addiere klammeruff 2 komma 3 klammerzu semikolon
```

Daraus entsteht:

```ts
function addiere(a: number, b: number): number {
  return a + b;
}

const ergebnis = addiere(2, 3);
```

## Funktionen

- SächScript nach TypeScript übersetzen
- TypeScript kanonisch nach SächScript zurückübersetzen
- SächScript direkt als modernes JavaScript bauen
- syntaktische und semantische TypeScript-Prüfung
- Fehlerpositionen auf den ursprünglichen SächScript-Quelltext zurückführen
- Strings und kollidierende Bezeichner mit `wOrt` eindeutig schützen
- reguläre Ausdrücke sicher vom Divisionsoperator unterscheiden
- Vokabular über eine JSON-Datei erweitern

## Installation

Benötigt werden Node.js 20 oder neuer und npm.

```powershell
git clone https://github.com/Coding-gonzo/SaechScript.git
cd SaechScript
npm install
```

Optional kann die lokale CLI verlinkt werden:

```powershell
npm link
saechscript --help
```

Ohne Verlinkung werden die folgenden Beispiele mit
`node bin/saechscript.js` ausgeführt.

## Projektmodus

Eine `saechscript.json` definiert Ein- und Ausgabeordner sowie Compileroptionen:

```json
{
  "$schema": "./schemas/saechscript.schema.json",
  "eingabe": "src",
  "ausgabe": "dist",
  "ziel": "ES2022",
  "streng": true,
  "sourceMaps": false
}
```

Danach werden alle `.saechs`-Dateien unter `eingabe` gemeinsam verarbeitet:

```powershell
node bin/saechscript.js pruefe
node bin/saechscript.js bau
```

Relative Imports zwischen SächScript-Dateien werden aufgelöst und gemeinsam
typgeprüft. Unterordner und Dateinamen bleiben im Ausgabeordner erhalten. Eine
abweichende Projektdatei wird mit `-p` angegeben:

```powershell
node bin/saechscript.js bau -p config/mein-projekt.json
```

## CLI und Einzeldateien

### SächScript nach TypeScript

```powershell
node bin/saechscript.js nach-ts programm.saechs -o dist/programm.ts
```

`nach-ts` ist der Standardbefehl und kann weggelassen werden:

```powershell
node bin/saechscript.js programm.saechs --stdout
```

### TypeScript nach SächScript

```powershell
node bin/saechscript.js nach-saechs programm.ts -o dist/programm.saechs
```

Die Rückübersetzung verwendet immer die kanonischen Wörter aus der
Übersetzungsdatei.

### JavaScript bauen

```powershell
node bin/saechscript.js bau programm.saechs -o dist/programm.js
```

### Quelltext prüfen

```powershell
node bin/saechscript.js pruefe programm.saechs
```

Mit einer angegebenen Datei arbeitet `pruefe` im Einzeldateimodus und erzeugt
keine Ausgabe. Ohne Datei verwendet es `saechscript.json`. Syntax- und Typfehler
enthalten den ursprünglichen Dateipfad sowie Zeile und Spalte.

Eine eigene Regeldatei lässt sich mitgeben:

```powershell
node bin/saechscript.js nach-ts programm.saechs --config eigene-regeln.json
```

## Auszug aus dem Vokabular

| TypeScript | SächScript |
| --- | --- |
| `function` | `machema` |
| `var` | `dings` |
| `const` | `dauerdings` |
| `let` | `aenderma` |
| `number` | `nummer` |
| `boolean` | `jane` |
| `true` / `false` | `nuja` / `nee` |
| `return` | `gibbe` |
| `if` / `else` | `wennde` / `sonst` |
| `+` / `-` | `machmehr` / `machweniger` |
| `*` / `/` | `machmal` / `machmaldurch` |
| `=` | `issgleich` |
| `===` / `==` | `isswirklichgleich` / `issungefährgleich` |
| `!==` / `!=` | `isswirklichnichgleich` / `issnichgleich` |
| `(` / `)` | `klammeruff` / `klammerzu` |
| `@` | `ät` |
| `"..."` | `hochkommauff ... hochkommazu` |

Das vollständige Vokabular steht in
[`config/uebersetzungen.json`](./config/uebersetzungen.json).

## Texte und `wOrt`

Texte lassen sich vollständig ausgeschrieben notieren:

```saechs
dauerdings text issgleich hochkommauff Nu, das läuft. hochkommazu semikolon
```

Steht ein Wort aus dem SächScript-Vokabular wörtlich innerhalb eines Textes,
wird ihm `wOrt` vorangestellt:

```saechs
hochkommauff Das Wort wOrt hochkommazu wOrt und wOrt machmehr bleiben Text. hochkommazu
```

Das entspricht:

```ts
"Das Wort hochkommazu und machmehr bleiben Text."
```

`wOrt` schützt auch Bezeichner, die mit dem Vokabular kollidieren. Eine
TypeScript-Variable namens `nummer` wird deshalb als `wOrt nummer` ausgegeben und
nicht mit dem Typ `number` verwechselt.

## Vokabular erweitern

Neue Übersetzungen werden in `config/uebersetzungen.json` ergänzt, beispielsweise:

```json
"machhoch": "**",
"doppelFrage": "??"
```

Jedes TypeScript-Token darf nur eine kanonische SächScript-Rückübersetzung haben.
Die Konfiguration wird beim Laden entsprechend validiert.

## Entwicklung

```powershell
npm test
npm run build
npm run example
```

Der aktuelle Testumfang deckt Vorwärtsübersetzung, Rückübersetzung, Roundtrips,
Textschutz, Regex-Literale, Template-Strings, JavaScript-Ausgabe, Typdiagnosen,
Mehrdateiprojekte und Importauflösung ab.

## Aktuelle Grenzen

- Template-Strings bleiben als sichere TypeScript-Einheit erhalten; Ausdrücke in
  `${...}` werden noch nicht versächsischt.
- TypeScript-Abhängigkeiten aus `node_modules` und komplexe `paths`-Aliase sind
  noch nicht als eigenes SächScript-Konfigurationsmodell abgebildet.
- Echte Source-Map-Dateien zurück auf `.saechs` folgen in einer späteren Version.

Die geplanten Etappen stehen in [`PLAN.md`](./PLAN.md).
