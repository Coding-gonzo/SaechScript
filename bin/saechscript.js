#!/usr/bin/env node
import { resolve, extname, basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileFile } from '../src/compiler.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(`SächScript 0.1.0

Aufruf:
  saechscript <datei.saechs> [-o ausgabe.ts] [--config regeln.json]
  saechscript <datei.saechs> --stdout

Optionen:
  -o, --output   Zielpfad (Standard: dist/<name>.ts)
  -c, --config   Übersetzungsdatei
  --stdout       Ergebnis nur auf stdout ausgeben
  -h, --help     Diese Hilfe anzeigen`);
  process.exit(0);
}

function option(shortName, longName) {
  const index = args.findIndex((arg) => arg === shortName || arg === longName);
  if (index === -1) return undefined;
  if (!args[index + 1] || args[index + 1].startsWith('-')) {
    throw new Error(`Nach ${args[index]} fehlt ein Wert.`);
  }
  return args[index + 1];
}

try {
  const inputArgument = args.find((arg, index) => !arg.startsWith('-') && (index === 0 || !['-o', '--output', '-c', '--config'].includes(args[index - 1])));
  if (!inputArgument) throw new Error('Nu gugge ma: Es fehlt eine .saechs-Datei.');

  const input = resolve(inputArgument);
  const config = resolve(option('-c', '--config') ?? join(projectRoot, 'config', 'uebersetzungen.json'));
  const requestedOutput = option('-o', '--output');
  const stdout = args.includes('--stdout');
  const stem = basename(input, extname(input));
  const output = stdout ? undefined : resolve(requestedOutput ?? join('dist', `${stem}.ts`));
  const code = await compileFile(input, output, config);

  if (stdout) process.stdout.write(code);
  else console.log(`Nu, das läuft: ${output}`);
} catch (error) {
  console.error(`Nu gugge ma, da stimmt was nich: ${error.message}`);
  process.exitCode = 1;
}
