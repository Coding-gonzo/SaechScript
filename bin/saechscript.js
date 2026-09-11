#!/usr/bin/env node
import { resolve, extname, basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildJavaScriptFile, compileFile, translateTypeScriptFile } from '../src/compiler.js';
import { compileProject, loadProject } from '../src/project.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(`SächScript 0.4.0

Aufruf:
  saechscript nach-ts <datei.saechs> [-o ausgabe.ts]
  saechscript nach-saechs <datei.ts> [-o ausgabe.saechs]
  saechscript bau <datei.saechs> [-o ausgabe.js]
  saechscript pruefe <datei.saechs>
  saechscript bau [-p saechscript.json]
  saechscript pruefe [-p saechscript.json]
  saechscript <datei.saechs> --stdout

Optionen:
  -o, --output   Zielpfad (Standard: dist/<name>.ts)
  -c, --config   Übersetzungsdatei
  -p, --project  Projektdatei (Standard: saechscript.json)
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
  const command = ['nach-ts', 'nach-saechs', 'bau', 'pruefe'].includes(args[0]) ? args.shift() : 'nach-ts';
  const inputArgument = args.find((arg, index) => !arg.startsWith('-') && (index === 0 || !['-o', '--output', '-c', '--config', '-p', '--project'].includes(args[index - 1])));
  const config = resolve(option('-c', '--config') ?? join(projectRoot, 'config', 'uebersetzungen.json'));
  if (!inputArgument) {
    if (!['bau', 'pruefe'].includes(command)) throw new Error('Nu gugge ma: Es fehlt eine Eingabedatei.');
    const project = await loadProject(option('-p', '--project') ?? 'saechscript.json');
    const result = await compileProject(project, config, { emit: command === 'bau' });
    console.log(command === 'bau'
      ? `Nu, das läuft: ${result.files} Datei(en), ${result.outputs} Ausgabe(n).`
      : `Nu, das passt: ${result.files} Datei(en) geprüft.`);
    process.exit(0);
  }

  const input = resolve(inputArgument);
  const requestedOutput = option('-o', '--output');
  const stdout = args.includes('--stdout');
  const stem = basename(input, extname(input));
  const extension = command === 'nach-saechs' ? '.saechs' : command === 'bau' ? '.js' : '.ts';
  const output = stdout || command === 'pruefe' ? undefined : resolve(requestedOutput ?? join('dist', `${stem}${extension}`));
  const built = command === 'nach-saechs'
    ? await translateTypeScriptFile(input, output, config)
    : command === 'bau' || command === 'pruefe'
      ? await buildJavaScriptFile(input, output, config)
      : await compileFile(input, output, config);
  const code = typeof built === 'string' ? built : built.code;

  if (stdout) process.stdout.write(code);
  else if (command === 'pruefe') console.log('Nu, das passt.');
  else console.log(`Nu, das läuft: ${output}`);
} catch (error) {
  console.error(`Nu gugge ma, da stimmt was nich: ${error.message}`);
  process.exitCode = 1;
}
