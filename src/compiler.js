import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import ts from 'typescript';
import { loadTranslations } from './config.js';
import { transpile, transpileToSaechs } from './transpiler.js';

export async function compileFile(inputPath, outputPath, configPath) {
  const [{ translations, text }, source] = await Promise.all([
    loadTranslations(configPath),
    readFile(inputPath, 'utf8')
  ]);
  const output = transpile(source, translations, text);
  if (outputPath) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, output, 'utf8');
  }
  return output;
}

export async function translateTypeScriptFile(inputPath, outputPath, configPath) {
  const [{ translations, reverseTranslations, text }, source] = await Promise.all([
    loadTranslations(configPath),
    readFile(inputPath, 'utf8')
  ]);
  const output = transpileToSaechs(source, translations, reverseTranslations, text);
  if (outputPath) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, output, 'utf8');
  }
  return output;
}

export async function buildJavaScriptFile(inputPath, outputPath, configPath) {
  const [{ translations, text }, source] = await Promise.all([
    loadTranslations(configPath),
    readFile(inputPath, 'utf8')
  ]);
  const typescript = transpile(source, translations, text);
  const result = emitJavaScript(typescript, inputPath);
  if (outputPath) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, result.code, 'utf8');
  }
  return result;
}

export function emitJavaScript(source, fileName = 'eingabe.ts') {
  const result = ts.transpileModule(source, {
    fileName,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      strict: true
    }
  });
  const errors = (result.diagnostics ?? []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  if (errors.length > 0) throw new Error(formatDiagnostics(errors));
  return { code: result.outputText, diagnostics: result.diagnostics ?? [], typescript: source };
}

function formatDiagnostics(diagnostics) {
  return diagnostics.map((diagnostic) => {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    if (!diagnostic.file || diagnostic.start === undefined) return message;
    const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    return `Zeile ${position.line + 1}, Spalte ${position.character + 1}: ${message}`;
  }).join('\n');
}
