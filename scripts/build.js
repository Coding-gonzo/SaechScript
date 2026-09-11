import { mkdir, readdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { compileFile } from '../src/compiler.js';

const examples = (await readdir('examples')).filter((name) => name.endsWith('.saechs'));
await mkdir('dist', { recursive: true });
await Promise.all(examples.map((name) =>
  compileFile(join('examples', name), join('dist', name.replace(/\.saechs$/, '.ts')), 'config/uebersetzungen.json')
));
await copyFile('config/uebersetzungen.json', 'dist/uebersetzungen.json');
console.log(`Nu, das läuft: ${examples.length} Beispiel(e) gebaut.`);
