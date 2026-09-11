import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';
import { loadTranslations } from './config.js';
import { transpile, transpileDetailed, transpileToSaechs } from './transpiler.js';

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
  const translated = transpileDetailed(source, translations, text);
  const result = emitJavaScript(translated.code, inputPath, translated);
  if (outputPath) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, result.code, 'utf8');
  }
  return result;
}

export function emitJavaScript(source, fileName = 'eingabe.ts', positionMap = undefined) {
  const virtualFile = resolve(fileName).replace(/\.[^.\\/]+$/, '') + '.generated.ts';
  const options = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    noEmitOnError: true,
    skipLibCheck: true
  };
  const host = ts.createCompilerHost(options);
  const originalGetSourceFile = host.getSourceFile.bind(host);
  const normalizedVirtualFile = normalizePath(virtualFile);
  host.getSourceFile = (requestedFile, languageVersion, onError, shouldCreateNewSourceFile) => {
    if (normalizePath(requestedFile) === normalizedVirtualFile) {
      return ts.createSourceFile(virtualFile, source, languageVersion, true, ts.ScriptKind.TS);
    }
    return originalGetSourceFile(requestedFile, languageVersion, onError, shouldCreateNewSourceFile);
  };
  host.fileExists = ((original) => (requestedFile) =>
    normalizePath(requestedFile) === normalizedVirtualFile || original(requestedFile))(host.fileExists.bind(host));
  host.readFile = ((original) => (requestedFile) =>
    normalizePath(requestedFile) === normalizedVirtualFile ? source : original(requestedFile))(host.readFile.bind(host));

  const emitted = new Map();
  host.writeFile = (outputName, content) => emitted.set(outputName, content);
  const program = ts.createProgram([virtualFile], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  const errors = diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  if (errors.length > 0) throw new Error(formatDiagnostics(errors, positionMap, normalizedVirtualFile));

  const emitResult = program.emit();
  const emitErrors = emitResult.diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  if (emitErrors.length > 0) throw new Error(formatDiagnostics(emitErrors, positionMap, normalizedVirtualFile));
  const code = [...emitted.entries()].find(([name]) => name.endsWith('.js'))?.[1];
  if (code === undefined) throw new Error('TypeScript hat keine JavaScript-Ausgabe erzeugt.');
  return { code, diagnostics, typescript: source };
}

function formatDiagnostics(diagnostics, positionMap, normalizedVirtualFile) {
  return diagnostics.map((diagnostic) => {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    if (!diagnostic.file || diagnostic.start === undefined) return message;
    if (positionMap && normalizePath(diagnostic.file.fileName) === normalizedVirtualFile) {
      const generatedPosition = Math.min(diagnostic.start, positionMap.generatedToSource.length - 1);
      let sourcePosition = positionMap.generatedToSource[generatedPosition];
      while (/\s/.test(positionMap.source[sourcePosition] ?? '') && sourcePosition < positionMap.source.length) {
        sourcePosition += 1;
      }
      const position = lineAndCharacter(positionMap.source, sourcePosition);
      return `Zeile ${position.line + 1}, Spalte ${position.character + 1}: ${message}`;
    }
    const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    return `Zeile ${position.line + 1}, Spalte ${position.character + 1}: ${message}`;
  }).join('\n');
}

function lineAndCharacter(source, offset) {
  const before = source.slice(0, offset);
  const lines = before.split(/\r?\n/);
  return { line: lines.length - 1, character: lines.at(-1).length };
}

function normalizePath(path) {
  return resolve(path).replaceAll('\\', '/').toLowerCase();
}
