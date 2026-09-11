# SächScript

TypeScript goes sächsisch: ein kleiner, erweiterbarer Transpiler von
sächsischem Quelltext nach TypeScript.

```saechs
machema addiere rundeAuf a doppelpunkt zahl komma b doppelpunkt zahl rundeZu geschweifteAuf
  gibbe a plus b semikolon
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
```

Optional kann eine andere Regeldatei verwendet werden:

```powershell
node bin/saechscript.js programm.saechs --config eigene-regeln.json
```

## Neue Wörter und Zeichen ergänzen

Alle Regeln stehen in `config/uebersetzungen.json`. Beispielsweise kann unter
`operatoren` Folgendes ergänzt werden:

```json
"hoch": "**",
"doppelFrage": "??"
```

Der Lexer ersetzt nur vollständige Quellwörter. Strings und Kommentare werden
nicht verändert. Die umgebenden Leerzeichen bleiben erhalten; TypeScript erlaubt
Leerraum rund um die meisten Satzzeichen.

## Aktuelle Grenze

Template-Strings werden in Version 0.1 vollständig als String behandelt. Deshalb
werden sächsische Wörter innerhalb von `${...}` noch nicht übersetzt. Eine
vollständige TypeScript-Syntaxprüfung und Source Maps sind als nächste Etappe in
[`PLAN.md`](./PLAN.md) vorgesehen.
