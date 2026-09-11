import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { loadTranslations } from '../src/config.js';
import { transpile } from '../src/transpiler.js';

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
