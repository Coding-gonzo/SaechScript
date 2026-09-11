# SächScript

TypeScript goes sächsisch: ein kleiner, erweiterbarer Transpiler von
sächsischem Quelltext nach TypeScript.

```saechs
machema addiere klammeruff a doppelpunkt nummer komma b doppelpunkt nummer klammerzu geschweifteAuf
  gibbe a machmehr b semikolon
geschweifteZu
```

wird zu:

```ts
function addiere ( a : number , b : number ) {
  return a + b ;
}
```

## Benutzung

Node.js 20 oder neuer genügt; es gibt keine externen Abhängigkeiten.

```powershell
npm test
npm run build
node bin/saechscript.js examples/hallo.saechs --stdout
node bin/saechscript.js mein-programm.saechs -o dist/mein-programm.ts
node bin/saechscript.js nach-saechs mein-programm.ts -o dist/mein-programm.saechs
node bin/saechscript.js bau examples/hallo.saechs -o dist/hallo.js
```

Optional kann eine andere Regeldatei verwendet werden:

```powershell
node bin/saechscript.js programm.saechs --config eigene-regeln.json
```

## Neue Wörter und Zeichen ergänzen

Alle Regeln stehen in `config/uebersetzungen.json`. Beispielsweise kann unter
`operatoren` Folgendes ergänzt werden:

```json
"machhoch": "**",
"doppelFrage": "??"
```

Der Lexer ersetzt nur vollständige Quellwörter. Strings und Kommentare werden
nicht verändert. Die umgebenden Leerzeichen bleiben erhalten; TypeScript erlaubt
Leerraum rund um die meisten Satzzeichen.

Texte können ebenfalls ohne Anführungszeichen geschrieben werden:

```saechs
dauerdings text issgleich hochkommauff Nu, das läuft. hochkommazu semikolon
```

Steht ein Wort aus dem SächScript-Vokabular wörtlich im Text, wird `wOrt`
davorgeschrieben:

```saechs
hochkommauff Das Wort wOrt hochkommazu bleibt Teil des Textes. hochkommazu
```

Das ergibt den TypeScript-Text `"Das Wort hochkommazu bleibt Teil des Textes."`.

`wOrt` schützt außerdem Bezeichner, die zufällig wie ein Vokabularwort heißen.
So wird eine TypeScript-Variable namens `nummer` als `wOrt nummer` ausgegeben und
beim Roundtrip nicht mit dem Typ `number` verwechselt.

## Aktuelle Grenze

Template-Strings werden in Version 0.1 vollständig als String behandelt. Deshalb
werden sächsische Wörter innerhalb von `${...}` noch nicht übersetzt. Eine
vollständige TypeScript-Syntaxprüfung und Source Maps sind als nächste Etappe in
[`PLAN.md`](./PLAN.md) vorgesehen.

Reguläre Ausdrücke werden mithilfe des TypeScript-Parsers sicher vom
Divisionsoperator unterschieden. Template-Strings bleiben derzeit als vollständige
TypeScript-Einheit erhalten; ihre `${...}`-Ausdrücke werden noch nicht versächsischt.

`saechscript bau` erzeugt direkt modernes JavaScript und meldet syntaktische
TypeScript-Fehler mit Zeile und Spalte. Eine projektweite semantische Typprüfung
und präzise Source Maps auf die ursprünglichen Wortspalten folgen noch.
