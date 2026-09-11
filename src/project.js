import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { GenMapping, addSegment, setSourceContent, toEncodedMap } from '@jridgewell/gen-mapping';
import { TraceMap, decodedMappings } from '@jridgewell/trace-mapping';
import { loadTranslations } from './config.js';
import { transpileDetailed } from './transpiler.js';

export async function loadProject(projectPath = 'saechscript.json') {
  const absoluteProjectPath = resolve(projectPath);
  let config;
  try {
    config = JSON.parse(await readFile(absoluteProjectPath, 'utf8'));
  } catch (error) {
    throw new Error(`Projektdatei konnte nicht gelesen werden: ${error.message}`);
  }
  const projectDirectory = dirname(absoluteProjectPath);
  if (!config.eingabe || !config.ausgabe) {
    throw new Error('saechscript.json braucht "eingabe" und "ausgabe".');
  }
  return {
    projectPath: absoluteProjectPath,
    inputRoot: resolve(projectDirectory, config.eingabe),
    outputRoot: resolve(projectDirectory, config.ausgabe),
    target: config.ziel ?? 'ES2022',
    strict: config.streng ?? true,
    sourceMaps: config.sourceMaps ?? false
  };
}

export async function compileProject(project, configPath, { emit = true } = {}) {
  const files = await findFiles(project.inputRoot, '.saechs');
  if (files.length === 0) throw new Error(`Keine .saechs-Dateien unter ${project.inputRoot} gefunden.`);
  const { translations, text } = await loadTranslations(configPath);
  const entries = new Map();

  await Promise.all(files.map(async (file) => {
    const source = await readFile(file, 'utf8');
    const translated = transpileDetailed(source, translations, text);
    const virtualFile = file.slice(0, -extname(file).length) + '.ts';
    entries.set(normalizePath(virtualFile), { virtualFile, sourceFile: file, ...translated });
  }));

  const result = compileEntries(entries, project, emit);
  if (emit) {
    await Promise.all(result.outputs.map(async ({ path, content }) => {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content, 'utf8');
    }));
  }
  return { files: files.length, outputs: result.outputs.length, diagnostics: result.diagnostics };
}

function compileEntries(entries, project, emit) {
  const target = ts.ScriptTarget[project.target];
  if (target === undefined) throw new Error(`Unbekanntes JavaScript-Ziel "${project.target}".`);
  const options = {
    target,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    rootDir: project.inputRoot,
    outDir: project.outputRoot,
    strict: project.strict,
    noEmit: !emit,
    noEmitOnError: true,
    skipLibCheck: true,
    sourceMap: project.sourceMaps,
    inlineSources: project.sourceMaps
  };
  const host = ts.createCompilerHost(options);
  const originalGetSourceFile = host.getSourceFile.bind(host);
  const originalFileExists = host.fileExists.bind(host);
  const originalReadFile = host.readFile.bind(host);

  host.fileExists = (file) => entries.has(normalizePath(file)) || originalFileExists(file);
  host.readFile = (file) => entries.get(normalizePath(file))?.code ?? originalReadFile(file);
  host.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) => {
    const entry = entries.get(normalizePath(file));
    if (entry) return ts.createSourceFile(entry.virtualFile, entry.code, languageVersion, true, ts.ScriptKind.TS);
    return originalGetSourceFile(file, languageVersion, onError, shouldCreateNewSourceFile);
  };

  let outputs = [];
  host.writeFile = (path, content) => outputs.push({ path, content });
  const program = ts.createProgram([...entries.values()].map((entry) => entry.virtualFile), options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  const errors = diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  if (errors.length > 0) throw new Error(formatProjectDiagnostics(errors, entries));

  if (emit) {
    const result = program.emit();
    const emitErrors = result.diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
    if (emitErrors.length > 0) throw new Error(formatProjectDiagnostics(emitErrors, entries));
    if (project.sourceMaps) outputs = composeSourceMaps(outputs, entries);
  }
  return { outputs, diagnostics };
}

function composeSourceMaps(outputs, entries) {
  return outputs.map((output) => {
    if (!output.path.endsWith('.js.map')) return output;
    const rawMap = JSON.parse(output.content);
    const decoded = decodedMappings(new TraceMap(rawMap));
    const generatedMap = new GenMapping({ file: rawMap.file });
    const sourceNames = new Map();

    for (let generatedLine = 0; generatedLine < decoded.length; generatedLine += 1) {
      for (const segment of decoded[generatedLine]) {
        if (segment.length < 4) continue;
        const [, sourceIndex, originalLine, originalColumn] = segment;
        const intermediateSource = resolve(dirname(output.path), rawMap.sourceRoot ?? '', rawMap.sources[sourceIndex]);
        const entry = entries.get(normalizePath(intermediateSource));
        if (!entry) continue;
        const lineStarts = getLineStarts(entry.code);
        const generatedOffset = Math.min((lineStarts[originalLine] ?? entry.code.length) + originalColumn, entry.generatedToSource.length - 1);
        const sourceOffset = entry.generatedToSource[generatedOffset];
        const original = lineAndCharacter(entry.source, sourceOffset);
        let sourceName = sourceNames.get(entry.sourceFile);
        if (!sourceName) {
          sourceName = relative(dirname(output.path), entry.sourceFile).replaceAll('\\', '/');
          sourceNames.set(entry.sourceFile, sourceName);
          setSourceContent(generatedMap, sourceName, entry.source);
        }
        addSegment(generatedMap, generatedLine, segment[0], sourceName, original.line, original.character);
      }
    }

    return { ...output, content: JSON.stringify(toEncodedMap(generatedMap)) };
  });
}

function getLineStarts(source) {
  const starts = [0];
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '\n') starts.push(index + 1);
  }
  return starts;
}

function formatProjectDiagnostics(diagnostics, entries) {
  return diagnostics.map((diagnostic) => {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    if (!diagnostic.file || diagnostic.start === undefined) return message;
    const entry = entries.get(normalizePath(diagnostic.file.fileName));
    if (!entry) {
      const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      return `${diagnostic.file.fileName}:${position.line + 1}:${position.character + 1}: ${message}`;
    }
    const generatedPosition = Math.min(diagnostic.start, entry.generatedToSource.length - 1);
    const sourcePosition = entry.generatedToSource[generatedPosition];
    const position = lineAndCharacter(entry.source, sourcePosition);
    return `${relative(process.cwd(), entry.sourceFile)}:${position.line + 1}:${position.character + 1}: ${message}`;
  }).join('\n');
}

async function findFiles(directory, extension) {
  const found = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await findFiles(path, extension));
    else if (entry.isFile() && extname(entry.name) === extension) found.push(resolve(path));
  }
  return found.sort();
}

function lineAndCharacter(source, offset) {
  const lines = source.slice(0, offset).split(/\r?\n/);
  return { line: lines.length - 1, character: lines.at(-1).length };
}

function normalizePath(path) {
  return resolve(path).replaceAll('\\', '/').toLowerCase();
}
