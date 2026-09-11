import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import { loadTranslations } from '../src/config.js';
import { transpile, transpileToSaechs } from '../src/transpiler.js';
import { emitJavaScript } from '../src/compiler.js';
import { compileProject } from '../src/project.js';

const configPath = resolve('config/uebersetzungen.json');

test('übersetzt Schlüsselwörter, Typen, Operatoren und Zeichen', async () => {
  const { translations, text } = await loadTranslations(configPath);
  const source = 'machema summe klammeruff a doppelpunkt nummer komma b doppelpunkt nummer klammerzu geschweifteauf gibbe a machmehr b semikolon geschweiftezu';
  assert.equal(
    transpile(source, translations, text),
    'function summe ( a : number , b : number ) { return a + b ; }'
  );
});

test('übersetzt vonhausaus in beiden Richtungen kanonisch', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  assert.equal(transpile('gibraus vonhausaus Ding semikolon', translations, text), 'export default Ding ;');
  assert.match(transpileToSaechs('export default Ding;', translations, reverseTranslations, text), /gibraus vonhausaus Ding semikolon/);
});

test('übersetzt die Variablenfamilie kanonisch', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const saechs = 'dings alt issgleich 1 semikolon änderdings aktuell issgleich 2 semikolon dauerdings festwert issgleich 3 semikolon';
  const typescript = 'var alt = 1 ; let aktuell = 2 ; const festwert = 3 ;';
  assert.equal(transpile(saechs, translations, text), typescript);
  assert.match(
    transpileToSaechs(typescript, translations, reverseTranslations, text),
    /dings alt issgleich 1 semikolon änderdings aktuell issgleich 2 semikolon dauerdings festwert issgleich 3 semikolon/
  );
});

test('übersetzt die Fallauswahl mit probiermal und wenndas', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const saechs = 'probiermal klammeruff farbe klammerzu geschweifteauf wenndas rot doppelpunkt vonhausaus doppelpunkt geschweiftezu';
  const typescript = 'switch ( farbe ) { case rot : default : }';
  assert.equal(transpile(saechs, translations, text), typescript);
  assert.match(transpileToSaechs(typescript, translations, reverseTranslations, text), /probiermal klammeruff farbe klammerzu geschweifteauf wenndas rot doppelpunkt vonhausaus doppelpunkt geschweiftezu/);
});

test('übersetzt if, else und Schleifensteuerung als Paket', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const saechs = 'wenn klammeruff bereit klammerzu geschweifteauf weiter semikolon geschweiftezu sonst geschweifteauf fertsch semikolon geschweiftezu';
  const typescript = 'if ( bereit ) { continue ; } else { break ; }';
  assert.equal(transpile(saechs, translations, text), typescript);
  assert.match(transpileToSaechs(typescript, translations, reverseTranslations, text), /wenn klammeruff bereit klammerzu geschweifteauf weiter semikolon geschweiftezu sonst geschweifteauf fertsch semikolon geschweiftezu/);
});

test('übersetzt try, catch, finally und throw als Paket', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const saechs = 'versuchma geschweifteauf schmeiss fehler semikolon geschweiftezu fangab klammeruff fehler klammerzu geschweifteauf geschweiftezu amende geschweifteauf geschweiftezu';
  const typescript = 'try { throw fehler ; } catch ( fehler ) { } finally { }';
  assert.equal(transpile(saechs, translations, text), typescript);
  assert.match(transpileToSaechs(typescript, translations, reverseTranslations, text), /versuchma geschweifteauf schmeiss fehler semikolon geschweiftezu fangab klammeruff fehler klammerzu geschweifteauf geschweiftezu amende geschweifteauf geschweiftezu/);
});

test('übersetzt do-while mit machma und solange', async () => {
  const { translations, text } = await loadTranslations(configPath);
  assert.equal(
    transpile('machma geschweifteauf geschweiftezu solange klammeruff aktiv klammerzu semikolon', translations, text),
    'do { } while ( aktiv ) ;'
  );
});

test('übersetzt Klassen, Vererbung und Sichtbarkeit bidirektional', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const saechs = 'gibraus sonding Hund erbtvon Tier machtswie Haustier geschweifteauf geschützt bauarbeiter klammeruff name doppelpunkt schrift klammerzu geschweifteauf obersonding klammeruff name klammerzu semikolon geschweiftezu füralle überschreib laut klammeruff klammerzu doppelpunkt schrift geschweifteauf gibbe dasda punkt name semikolon geschweiftezu geschweiftezu';
  const typescript = 'export class Hund extends Tier implements Haustier { protected constructor ( name : string ) { super ( name ) ; } public override laut ( ) : string { return this . name ; } }';
  assert.equal(transpile(saechs, translations, text), typescript);
  const roundtrip = transpileToSaechs(typescript, translations, reverseTranslations, text);
  assert.match(roundtrip, /sonding Hund erbtvon Tier machtswie Haustier/);
  assert.match(roundtrip, /geschützt bauarbeiter/);
  assert.match(roundtrip, /obersonding klammeruff name klammerzu/);
  assert.match(roundtrip, /füralle überschreib laut/);
});

test('übersetzt Interfaces und abstrakte, statische sowie schreibgeschützte Elemente', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const typescript = 'interface Ding { readonly wert: object; } abstract class Basis { static readonly art: keyof Ding; }';
  const saechs = transpileToSaechs(typescript, translations, reverseTranslations, text);
  assert.match(saechs, /bauplan Ding/);
  assert.match(saechs, /nurguggen wert doppelpunkt zeuch/);
  assert.match(saechs, /nuridee sonding Basis/);
  assert.match(saechs, /fest nurguggen wOrt art doppelpunkt schlüsselvon Ding/);
  assert.equal(transpile(saechs, translations, text).replace(/\s+/g, ''), typescript.replace(/\s+/g, ''));
});

test('übersetzt Pfeilfunktionen und this mit pfeil und dasda', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const saechs = 'dauerdings holWert issgleich klammeruff klammerzu pfeil dasda punkt wert semikolon';
  const typescript = 'const holWert = ( ) => this . wert ;';
  assert.equal(transpile(saechs, translations, text), typescript);
  assert.match(
    transpileToSaechs(typescript, translations, reverseTranslations, text),
    /dauerdings holWert issgleich klammeruff klammerzu pfeil dasda punkt wert semikolon/
  );
});

test('übersetzt die vollständige Grundtypenfamilie bidirektional', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const typescript = 'let a: bigint; let b: object; let c: symbol; let d: void; let e: unknown; let f: any; let g: never; const h = null; const i = undefined;';
  const saechs = transpileToSaechs(typescript, translations, reverseTranslations, text);
  assert.match(saechs, /riesennummer/);
  assert.match(saechs, /zeuch/);
  assert.match(saechs, /merkzeichen/);
  assert.match(saechs, /ohnewert/);
  assert.match(saechs, /irgendwas/);
  assert.match(saechs, /egalwas/);
  assert.match(saechs, /niemals/);
  assert.match(saechs, /nix/);
  assert.match(saechs, /weessnisch/);
  assert.equal(transpile(saechs, translations, text).replace(/\s+/g, ''), typescript.replace(/\s+/g, ''));
});

test('übersetzt Typdefinitionen und Typoperatoren bidirektional', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const typescript = 'declare type Element<T> = T extends (infer U)[] ? U : never; const wert = eingabe as string satisfies string; function istText(wert: unknown): wert is string { return typeof wert === "string"; } function prüfe(wert: unknown): asserts wert is string {} type Kennung = unique symbol;';
  const saechs = transpileToSaechs(typescript, translations, reverseTranslations, text);
  for (const word of ['angekündigt', 'art', 'abgeleitet', 'als', 'erfüllt', 'ist', 'artvon', 'versichert', 'einzig']) {
    assert.match(saechs, new RegExp(word));
  }
  assert.equal(transpile(saechs, translations, text).replace(/\s+/g, ''), typescript.replace(/\s+/g, ''));
});

test('übersetzt moderne Operatoren bidirektional', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const typescript = 'function summe(...werte: number[]) { let index = 0; index++; index--; return werte?.[index] ?? 2 ** 3; }';
  const saechs = transpileToSaechs(typescript, translations, reverseTranslations, text);
  for (const word of ['undsoweiter', 'vielleichtpunkt', 'wennnix', 'hoch', 'machmehrmehr', 'machwenigerweniger']) {
    assert.match(saechs, new RegExp(word));
  }
  const roundtrip = transpile(saechs, translations, text);
  assert.equal(roundtrip.replace(/\s+/g, ''), typescript.replace(/\s+/g, ''));
  assert.doesNotThrow(() => emitJavaScript(roundtrip));
});

test('übersetzt zusammengesetzte Zuweisungen bidirektional', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const typescript = 'let a = 1; a += 2; a -= 3; a *= 4; a **= 2; a /= 5; a %= 6; let b = true; b &&= false; b ||= true; let c: number | null = null; c ??= 7;';
  const saechs = transpileToSaechs(typescript, translations, reverseTranslations, text);
  for (const word of ['machmehrgleich', 'machwenigergleich', 'machmalgleich', 'hochgleich', 'machmaldurchgleich', 'restgleich', 'undgleich', 'odergleich', 'wennnixgleich']) {
    assert.match(saechs, new RegExp(word));
  }
  const roundtrip = transpile(saechs, translations, text);
  assert.equal(roundtrip.replace(/\s+/g, ''), typescript.replace(/\s+/g, ''));
  assert.doesNotThrow(() => emitJavaScript(roundtrip));
});

test('übersetzt Aufzählungen, Objektoperationen und Generatoren bidirektional', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const typescript = 'enum Farbe { Rot, Blau } const ding: { wert?: number } = { wert: 1 }; const vorhanden = "wert" in ding; delete ding.wert; function* zahlen() { yield 1; }';
  const saechs = transpileToSaechs(typescript, translations, reverseTranslations, text);
  for (const word of ['aufzähldings', 'drinne', 'machweg', 'gibweiter']) {
    assert.match(saechs, new RegExp(word));
  }
  const roundtrip = transpile(saechs, translations, text);
  assert.equal(roundtrip.replace(/\s+/g, ''), typescript.replace(/\s+/g, ''));
  assert.doesNotThrow(() => emitJavaScript(roundtrip));
});

test('übersetzt Namensräume und Module bidirektional', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const sources = [
    'namespace Werkstatt { export const werkzeug = 1; } export {}; declare global { interface Window { werkzeug?: number; } }',
    'declare module "bauteile" { export const schraube: number; }'
  ];
  const saechsSources = sources.map((source) => transpileToSaechs(source, translations, reverseTranslations, text));
  const combined = saechsSources.join(' ');
  for (const word of ['namensdings', 'baustein', 'überall']) {
    assert.match(combined, new RegExp(word));
  }
  for (const [index, saechs] of saechsSources.entries()) {
    const roundtrip = transpile(saechs, translations, text);
    assert.equal(roundtrip.replace(/\s+/g, ''), sources[index].replace(/\s+/g, ''));
    assert.doesNotThrow(() => emitJavaScript(roundtrip));
  }
});

test('übersetzt Ressourcen und Accessors bidirektional', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const sources = [
    'using ressource = null;',
    'class Speicher { accessor wert = 1; }',
    'import defer * as werkzeuge from "./werkzeuge.js";'
  ];
  const saechsSources = sources.map((source) => transpileToSaechs(source, translations, reverseTranslations, text));
  const combined = saechsSources.join(' ');
  for (const word of ['benutzma', 'später', 'zugriff']) {
    assert.match(combined, new RegExp(word));
  }
  for (const [index, saechs] of saechsSources.entries()) {
    const roundtrip = transpile(saechs, translations, text);
    assert.equal(roundtrip.replace(/\s+/g, ''), sources[index].replace(/\s+/g, ''));
  }
  assert.doesNotThrow(() => emitJavaScript(transpile(saechsSources[1], translations, text)));
});

test('übersetzt Kompatibilitäts- und Typwörter bidirektional', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const sources = [
    'import Werkzeug = require("werkzeug");',
    'import daten from "./daten.json" assert { type: "json" };',
    'interface Quelle<out T> { hole(): T; }',
    'type Eingebaut<S extends string> = intrinsic;'
  ];
  const saechsSources = sources.map((source) => transpileToSaechs(source, translations, reverseTranslations, text));
  const combined = saechsSources.join(' ');
  for (const word of ['brauchma', 'behaupte', 'raus', 'eingebaut']) {
    assert.match(combined, new RegExp(word));
  }
  for (const [index, saechs] of saechsSources.entries()) {
    const roundtrip = transpile(saechs, translations, text);
    assert.equal(roundtrip.replace(/\s+/g, ''), sources[index].replace(/\s+/g, ''));
  }
  assert.doesNotThrow(() => emitJavaScript(transpile(saechsSources[2], translations, text)));
});

test('lässt Strings und Kommentare unberührt', async () => {
  const { translations } = await loadTranslations(configPath);
  const source = '// machema machmehr\ndauerdings text issgleich "machema machmehr" semikolon /* klammeruff */';
  assert.equal(
    transpile(source, translations),
    '// machema machmehr\nconst text = "machema machmehr" ; /* klammeruff */'
  );
});

test('übersetzt nur vollständige Wörter', async () => {
  const { translations } = await loadTranslations(configPath);
  assert.equal(transpile('machmehrfach machmehr supermachmehr', translations), 'machmehrfach + supermachmehr');
});

test('schützt Vokabular in ausgeschriebenen Texten mit wOrt', async () => {
  const { translations, text } = await loadTranslations(configPath);
  const source = 'dauerdings text issgleich hochkommauff Das Wort wOrt hochkommazu wOrt und wOrt machmehr bleiben Text. hochkommazu semikolon';
  assert.equal(
    transpile(source, translations, text),
    'const text = "Das Wort hochkommazu und machmehr bleiben Text." ;'
  );
});

test('meldet ungeschützte schließende Textwörter eindeutig', async () => {
  const { translations, text } = await loadTranslations(configPath);
  assert.equal(
    transpile('hochkommauff Hallo hochkommazu', translations, text),
    '"Hallo"'
  );
});

test('verlangt wOrt vor jedem Vokabularwort im Text', async () => {
  const { translations, text } = await loadTranslations(configPath);
  assert.throws(
    () => transpile('hochkommauff Das macht machmehr Spaß. hochkommazu', translations, text),
    /muss im Text mit wOrt geschützt werden/
  );
});

test('übersetzt TypeScript mit längsten Operatoren zurück', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const source = 'const zahl: number = 2 + 3;\nif (zahl === 5) {}';
  const saechs = transpileToSaechs(source, translations, reverseTranslations, text);
  assert.match(saechs, /dauerdings zahl doppelpunkt nummer issgleich 2 machmehr 3 semikolon/);
  assert.match(saechs, /wenn klammeruff zahl isswirklichgleich 5 klammerzu/);
});

test('Roundtrip schützt kollidierende Bezeichner und Wörter im Text', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const typescript = 'const nummer = "hochkommazu und machmehr";';
  const saechs = transpileToSaechs(typescript, translations, reverseTranslations, text);
  assert.match(saechs, /dauerdings wOrt nummer/);
  assert.match(saechs, /wOrt hochkommazu wOrt und wOrt machmehr/);
  assert.equal(
    transpile(saechs, translations, text).replace(/\s+/g, ''),
    typescript.replace(/\s+/g, '')
  );
});

test('unterscheidet reguläre Ausdrücke sicher von Division', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const typescript = 'const muster = /hochkommazu\\s+/gi; const hälfte = 10 / 2;';
  const saechs = transpileToSaechs(typescript, translations, reverseTranslations, text);
  assert.match(saechs, /\/hochkommazu\\s\+\/gi/);
  assert.match(saechs, /10 machmaldurch 2/);
  assert.equal(
    transpile(saechs, translations, text).replace(/\s+/g, ''),
    typescript.replace(/\s+/g, '')
  );
});

test('lässt Template-Strings samt Ausdrücken als sichere Einheit stehen', async () => {
  const { translations, reverseTranslations, text } = await loadTranslations(configPath);
  const template = 'const text = `Wert: ${zahl + 1}`;';
  const saechs = transpileToSaechs(template, translations, reverseTranslations, text);
  assert.match(saechs, /`Wert: \$\{zahl \+ 1\}`/);
  assert.equal(transpile(saechs, translations, text).replace(/\s+/g, ''), template.replace(/\s+/g, ''));
});

test('erzeugt ausführbares JavaScript aus übersetztem TypeScript', async () => {
  const { translations, text } = await loadTranslations(configPath);
  const saechs = 'machema doppelt klammeruff wert doppelpunkt nummer klammerzu geschweifteauf gibbe wert machmal 2 semikolon geschweiftezu';
  const typescript = transpile(saechs, translations, text);
  const { code } = emitJavaScript(typescript);
  assert.match(code, /function doppelt\(wert\)/);
  assert.match(code, /return wert \* 2/);
  assert.doesNotMatch(code, /: number/);
});

test('meldet TypeScript-Syntaxfehler mit einer Position', () => {
  assert.throws(
    () => emitJavaScript('const kaputt = ;'),
    /Zeile 1, Spalte \d+/
  );
});

test('meldet semantische Typfehler', () => {
  assert.throws(
    () => emitJavaScript('const alter: number = "zwölf";'),
    /Type 'string' is not assignable to type 'number'/
  );
});

test('bildet Diagnosepositionen auf das ursprüngliche SächScript ab', async () => {
  const { translations, text } = await loadTranslations(configPath);
  const source = 'dauerdings alter doppelpunkt nummer issgleich hochkommauff zwölf hochkommazu semikolon';
  const { transpileDetailed } = await import('../src/transpiler.js');
  const translated = transpileDetailed(source, translations, text);
  assert.throws(
    () => emitJavaScript(translated.code, 'fehler.saechs', translated),
    /Zeile 1, Spalte 12:/
  );
});

test('prüft mehrere SächScript-Dateien und löst ihre Imports auf', async () => {
  const fixture = resolve('test/fixtures/project');
  const result = await compileProject({
    inputRoot: fixture,
    outputRoot: resolve('dist/test-project'),
    target: 'ES2022',
    strict: true,
    sourceMaps: false
  }, configPath, { emit: false });
  assert.equal(result.files, 2);
  assert.equal(result.outputs, 0);
});

test('erzeugt Source Maps zurück auf die ursprüngliche SächScript-Datei', async () => {
  const fixture = resolve('test/fixtures/project');
  const outputRoot = resolve('test-output/source-map');
  const result = await compileProject({
    inputRoot: fixture,
    outputRoot,
    target: 'ES2022',
    strict: true,
    sourceMaps: true
  }, configPath);
  assert.equal(result.outputs, 4);

  const javascript = await readFile(resolve(outputRoot, 'mathe.js'), 'utf8');
  const map = new TraceMap(await readFile(resolve(outputRoot, 'mathe.js.map'), 'utf8'));
  const returnOffset = javascript.indexOf('return');
  const beforeReturn = javascript.slice(0, returnOffset).split('\n');
  const original = originalPositionFor(map, {
    line: beforeReturn.length,
    column: beforeReturn.at(-1).length
  });
  assert.match(original.source, /mathe\.saechs$/);
  assert.equal(original.line, 2);
});
