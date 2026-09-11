import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { loadTranslations } from './config.js';
import { transpile } from './transpiler.js';

export async function compileFile(inputPath, outputPath, configPath) {
  const [{ translations }, source] = await Promise.all([
    loadTranslations(configPath),
    readFile(inputPath, 'utf8')
  ]);
  const output = transpile(source, translations);
  if (outputPath) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, output, 'utf8');
  }
  return output;
}
