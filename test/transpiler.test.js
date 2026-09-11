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
  const source = 'machema summe klammeruff a doppelpunkt nummer komma b doppelpunkt nummer klammerzu geschweifteAuf gibbe a machmehr b semikolon geschweifteZu';
  assert.equal(
    transpile(source, translations, text),
    'function summe ( a : number , b : number ) { return a + b ; }'
  );
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
  assert.match(saechs, /wennde klammeruff zahl isswirklichgleich 5 klammerzu/);
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
  const saechs = 'machema doppelt klammeruff wert doppelpunkt nummer klammerzu geschweifteAuf gibbe wert machmal 2 semikolon geschweifteZu';
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
