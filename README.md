# SächScript

Aktueller Stand: **Version 0.5.0**

**TypeScript goes sächsisch.** SächScript übersetzt ausgeschriebene sächsische
Quelltexte nach TypeScript und JavaScript – und vorhandenes TypeScript wieder
zurück nach SächScript.

```saechs
machema addiere klammeruff a doppelpunkt nummer komma b doppelpunkt nummer klammerzu doppelpunkt nummer geschweifteauf
  gibbe a machmehr b semikolon
geschweiftezu

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
- standardkonforme Source Maps zurück auf `.saechs` erzeugen
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
  "sourceMaps": true
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

### Source Maps verwenden

Mit `"sourceMaps": true` erzeugt der Projektbuild neben jeder JavaScript-Datei
eine `.js.map`. Die Map verweist direkt auf die ursprüngliche `.saechs`-Datei und
enthält deren Quelltext, sodass Debugger keine erzeugte TypeScript-Datei benötigen.

Node.js berücksichtigt die Maps beispielsweise mit:

```powershell
node --enable-source-maps dist/hallo.js
```

Bei einem Laufzeitfehler zeigt der Stacktrace dadurch auf `examples/hallo.saechs`.
Mit `"sourceMaps": false` lässt sich die Ausgabe abschalten.

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
| `let` | `änderdings` |
| `number` | `nummer` |
| `boolean` | `jane` |
| `true` / `false` | `nuja` / `nee` |
| `return` | `gibbe` |
| `if` / `else` | `wenn` / `sonst` |
| `switch` / `case` / `default` | `probiermal` / `wenndas` / `vonhausaus` |
| `enum` | `aufzähldings` |
| `break` / `continue` | `fertsch` / `weiter` |
| `try` / `catch` / `finally` | `versuchma` / `fangab` / `amende` |
| `throw` | `schmeiss` |
| `do` / `while` | `machma` / `solange` |
| `using` / `defer` | `benutzma` / `später` |
| `namespace` / `module` | `namensdings` / `baustein` |
| `global` | `überall` |
| `class` / `interface` | `sonding` / `bauplan` |
| `extends` / `implements` | `erbtvon` / `machtswie` |
| `constructor` / `new` | `bauarbeiter` / `neu` |
| `in` / `delete` | `drinne` / `machweg` |
| `yield` | `gibweiter` |
| `this` / `super` | `dasda` / `obersonding` |
| `public` / `private` / `protected` | `füralle` / `fürmich` / `geschützt` |
| `static` / `readonly` | `fest` / `nurguggen` |
| `abstract` / `override` | `nuridee` / `überschreib` |
| `get` / `set` | `holma` / `setzma` |
| `accessor` | `zugriff` |
| `instanceof` / `keyof` | `isseinsvon` / `schlüsselvon` |
| `bigint` / `object` | `riesennummer` / `zeuch` |
| `symbol` | `merkzeichen` |
| `void` / `never` | `ohnewert` / `niemals` |
| `unknown` / `any` | `irgendwas` / `egalwas` |
| `null` / `undefined` | `nix` / `weessnisch` |
| `type` / `as` | `art` / `als` |
| `satisfies` / `typeof` | `erfüllt` / `artvon` |
| `infer` / `is` | `abgeleitet` / `ist` |
| `asserts` / `declare` | `versichert` / `angekündigt` |
| `unique` | `einzig` |
| `+` / `-` | `machmehr` / `machweniger` |
| `*` / `/` | `machmal` / `machmaldurch` |
| `=>` | `pfeil` |
| `...` / `?.` | `undsoweiter` / `vielleichtpunkt` |
| `??` / `**` | `wennnix` / `hoch` |
| `++` / `--` | `machmehrmehr` / `machwenigerweniger` |
| `+=` / `-=` | `machmehrgleich` / `machwenigergleich` |
| `*=` / `/=` / `%=` | `machmalgleich` / `machmaldurchgleich` / `restgleich` |
| `**=` | `hochgleich` |
| `&&=` / `||=` / `??=` | `undgleich` / `odergleich` / `wennnixgleich` |
| `=` | `issgleich` |
| `===` / `==` | `isswirklichgleich` / `issungefährgleich` |
| `!==` / `!=` | `isswirklichnichgleich` / `issnichgleich` |
| `(` / `)` | `klammeruff` / `klammerzu` |
| `@` | `ät` |
| `"..."` | `hochkommauff ... hochkommazu` |

Das vollständige Vokabular steht in
[`config/uebersetzungen.json`](./config/uebersetzungen.json).
Eine nach Themen gruppierte Übersicht einschließlich aller noch offenen
TypeScript-Tokens enthält [`VOKABULAR.md`](./VOKABULAR.md).

### Klassenbeispiel

```saechs
gibraus sonding hund erbtvon tier machtswie haustier geschweifteauf
  geschützt bauarbeiter klammeruff name doppelpunkt schrift klammerzu geschweifteauf
    obersonding klammeruff name klammerzu semikolon
  geschweiftezu

  füralle überschreib laut klammeruff klammerzu doppelpunkt schrift geschweifteauf
    gibbe dasda punkt name semikolon
  geschweiftezu
geschweiftezu
```

Eigene Bezeichner wie `hund`, `tier` oder `name` dürfen weiterhin frei gewählt
und auch großgeschrieben werden. Die Kleinschreibungsregel gilt ausschließlich
für reservierte SächScript-Vokabeln.

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
"doppelfrage": "??"
```

Jedes TypeScript-Token darf nur eine kanonische SächScript-Rückübersetzung haben.
Alle eigentlichen Vokabeln werden kleingeschrieben. Der Schutzmarker `wOrt` ist
bewusst die einzige Ausnahme, damit er nicht mit dem normalen Wort „Wort“
verwechselt wird. Die Konfiguration wird beim Laden auf diese Regeln geprüft.

## Entwicklung

```powershell
npm test
npm run build
npm run example
```

Der aktuelle Testumfang deckt Vorwärtsübersetzung, Rückübersetzung, Roundtrips,
Textschutz, Regex-Literale, Template-Strings, JavaScript-Ausgabe, Typdiagnosen,
Mehrdateiprojekte, Importauflösung und komponierte Source Maps ab.

## Aktuelle Grenzen

- Template-Strings bleiben als sichere TypeScript-Einheit erhalten; Ausdrücke in
  `${...}` werden noch nicht versächsischt.
- TypeScript-Abhängigkeiten aus `node_modules` und komplexe `paths`-Aliase sind
  noch nicht als eigenes SächScript-Konfigurationsmodell abgebildet.
- Source Maps enthalten den ursprünglichen SächScript-Quelltext und verweisen
  direkt auf `.saechs`; sehr komplexe Token-Umschreibungen können derzeit noch
  auf den Beginn eines Quellwortes zeigen.

Die geplanten Etappen stehen in [`PLAN.md`](./PLAN.md).
