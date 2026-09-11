import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { loadTranslations } from '../src/config.js';
import { transpile } from '../src/transpiler.js';

const configPath = resolve('config/uebersetzungen.json');

test('übersetzt Schlüsselwörter, Typen, Operatoren und Zeichen', async () => {
  const { translations } = await loadTranslations(configPath);
  const source = 'machema summe rundeAuf a doppelpunkt zahl komma b doppelpunkt zahl rundeZu geschweifteAuf gibbe a plus b semikolon geschweifteZu';
  assert.equal(
    transpile(source, translations),
    'function summe ( a : number , b : number ) { return a + b ; }'
  );
});

test('lässt Strings und Kommentare unberührt', async () => {
  const { translations } = await loadTranslations(configPath);
  const source = '// machema plus\nlassma text ist "machema plus" semikolon /* rundeAuf */';
  assert.equal(
    transpile(source, translations),
    '// machema plus\nconst text = "machema plus" ; /* rundeAuf */'
  );
});

test('übersetzt nur vollständige Wörter', async () => {
  const { translations } = await loadTranslations(configPath);
  assert.equal(transpile('plusplus plus superplus', translations), 'plusplus + superplus');
});
