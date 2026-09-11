# SächScript-Vokabular

Stand: TypeScript 6.0.3 / SächScript 0.5.0

Diese Übersicht gruppiert das vorhandene Vokabular und die beim automatischen
Abgleich mit TypeScript noch fehlenden Tokens. Die maschinenlesbare Quelle bleibt
[`config/uebersetzungen.json`](./config/uebersetzungen.json).

## Vorhanden

### Variablen und Funktionen

| TypeScript | SächScript |
| --- | --- |
| `function` | `machema` |
| `var` | `dings` |
| `let` | `änderdings` |
| `const` | `dauerdings` |
| `return` | `gibbe` |
| `async` | `nebenbei` |
| `await` | `wardema` |
| `=>` | `pfeil` |

### Bedingungen und Fallauswahl

| TypeScript | SächScript |
| --- | --- |
| `if` | `wenn` |
| `else` | `sonst` |
| `switch` | `probiermal` |
| `case` | `wenndas` |
| `default` | `vonhausaus` |
| `break` | `fertsch` |
| `continue` | `weiter` |

### Schleifen

| TypeScript | SächScript |
| --- | --- |
| `for` | `fuer` |
| `of` | `von` |
| `while` | `solange` |
| `do` | `machma` |

### Aufzählungen, Objekte und Generatoren

| TypeScript | SächScript |
| --- | --- |
| `enum` | `aufzähldings` |
| `in` | `drinne` |
| `delete` | `machweg` |
| `yield` | `gibweiter` |

### Fehlerbehandlung

| TypeScript | SächScript |
| --- | --- |
| `try` | `versuchma` |
| `catch` | `fangab` |
| `finally` | `amende` |
| `throw` | `schmeiss` |

### Module

| TypeScript | SächScript |
| --- | --- |
| `import` | `holrein` |
| `export` | `gibraus` |
| `from` | `aus` |
| `require` | `brauchma` |
| `assert` | `behaupte` |

### Namensräume

| TypeScript | SächScript |
| --- | --- |
| `namespace` | `namensdings` |
| `module` | `baustein` |
| `global` | `überall` |

### Ressourcen und Zugriffe

| TypeScript | SächScript |
| --- | --- |
| `using` | `benutzma` |
| `defer` | `später` |
| `accessor` | `zugriff` |

### Klassen und Objekte

| TypeScript | SächScript |
| --- | --- |
| `class` | `sonding` |
| `interface` | `bauplan` |
| `extends` | `erbtvon` |
| `implements` | `machtswie` |
| `constructor` | `bauarbeiter` |
| `new` | `neu` |
| `this` | `dasda` |
| `super` | `obersonding` |
| `public` | `füralle` |
| `private` | `fürmich` |
| `protected` | `geschützt` |
| `static` | `fest` |
| `readonly` | `nurguggen` |
| `abstract` | `nuridee` |
| `override` | `überschreib` |
| `get` | `holma` |
| `set` | `setzma` |
| `instanceof` | `isseinsvon` |

### Typen und Werte

| TypeScript | SächScript |
| --- | --- |
| `string` | `schrift` |
| `number` | `nummer` |
| `bigint` | `riesennummer` |
| `boolean` | `jane` |
| `object` | `zeuch` |
| `symbol` | `merkzeichen` |
| `void` | `ohnewert` |
| `unknown` | `irgendwas` |
| `any` | `egalwas` |
| `never` | `niemals` |
| `keyof` | `schlüsselvon` |
| `type` | `art` |
| `as` | `als` |
| `satisfies` | `erfüllt` |
| `typeof` | `artvon` |
| `infer` | `abgeleitet` |
| `is` | `ist` |
| `asserts` | `versichert` |
| `declare` | `angekündigt` |
| `unique` | `einzig` |
| `out` | `raus` |
| `intrinsic` | `eingebaut` |
| `true` | `nuja` |
| `false` | `nee` |
| `null` | `nix` |
| `undefined` | `weessnisch` |

### Rechnen, Vergleichen und Logik

| TypeScript | SächScript |
| --- | --- |
| `+` / `-` | `machmehr` / `machweniger` |
| `*` / `/` / `%` | `machmal` / `machmaldurch` / `rest` |
| `=` | `issgleich` |
| `==` / `===` | `issungefährgleich` / `isswirklichgleich` |
| `!=` / `!==` | `issnichgleich` / `isswirklichnichgleich` |
| `<` / `>` | `kleener` / `groesser` |
| `<=` / `>=` | `kleenergleich` / `groessergleich` |
| `&&` / `||` / `!` | `und` / `oder` / `nicht` |
| `...` | `undsoweiter` |
| `?.` | `vielleichtpunkt` |
| `??` | `wennnix` |
| `**` | `hoch` |
| `++` / `--` | `machmehrmehr` / `machwenigerweniger` |
| `+=` / `-=` | `machmehrgleich` / `machwenigergleich` |
| `*=` / `/=` / `%=` | `machmalgleich` / `machmaldurchgleich` / `restgleich` |
| `**=` | `hochgleich` |
| `&&=` / `||=` / `??=` | `undgleich` / `odergleich` / `wennnixgleich` |

### Strukturzeichen und Texte

| TypeScript | SächScript |
| --- | --- |
| `(` / `)` | `klammeruff` / `klammerzu` |
| `[` / `]` | `eckigeauf` / `eckigezu` |
| `{` / `}` | `geschweifteauf` / `geschweiftezu` |
| `,` / `.` | `komma` / `punkt` |
| `:` / `;` | `doppelpunkt` / `semikolon` |
| `?` | `fragezeichen` |
| `@` | `ät` |
| `"..."` | `hochkommauff ... hochkommazu` |
| Schutzmarker | `wOrt` |

## Fehlend: hohe Priorität

Diese Tokens kommen in modernem TypeScript regelmäßig vor.

### Moderne Operatoren und Syntax

| TypeScript | Arbeitsvorschlag |
| --- | --- |
| `#` | `privatzeichen` |
| `` ` `` | noch offen – Teil der Template-String-Syntax |

## Fehlend: Bitoperatoren

Die Operatoren `&`, `|`, `^`, `~`, `<<`, `>>`, `>>>` sowie ihre
Zuweisungsvarianten `&=`, `|=`, `^=`, `<<=`, `>>=` und `>>>=` sind noch offen.
Sie sollten als eine gemeinsame Wortfamilie festgelegt werden.

## Fehlend: selten oder gesondert zu behandeln

| Token | Grund |
| --- | --- |
| `debugger` | Entwicklungsanweisung; Name noch offen |
| `with` | veraltet und im Strict Mode verboten |
| `package` | reserviertes Wort, kaum als TypeScript-Syntax verwendet |
| `</` | JSX/TSX; `.saechs` unterstützt derzeit kein JSX |

## Zählung

- 126 normale Übersetzungsregeln
- 3 Textsteuerwörter (`hochkommauff`, `hochkommazu`, `wOrt`)
- 19 noch nicht zugeordnete TypeScript-Tokens
