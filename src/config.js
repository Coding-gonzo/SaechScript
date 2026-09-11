import { readFile } from 'node:fs/promises';

const identifier = /^[\p{L}_$][\p{L}\p{N}_$]*$/u;

export async function loadTranslations(path) {
  let document;
  try {
    document = JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    throw new Error(`Übersetzungsdatei konnte nicht gelesen werden: ${error.message}`);
  }

  if (!document || typeof document !== 'object' || !document.regeln || typeof document.regeln !== 'object') {
    throw new Error('Übersetzungsdatei braucht ein Objekt "regeln".');
  }

  const text = document.text;
  if (!text || !identifier.test(text.anfang) || !identifier.test(text.ende) || !identifier.test(text.wortschutz)) {
    throw new Error('Die Textsyntax braucht gültige Wörter für "anfang", "ende" und "wortschutz".');
  }

  const translations = new Map();
  for (const [category, rules] of Object.entries(document.regeln)) {
    if (!rules || typeof rules !== 'object' || Array.isArray(rules)) {
      throw new Error(`Regelkategorie "${category}" muss ein Objekt sein.`);
    }
    for (const [source, target] of Object.entries(rules)) {
      if (!identifier.test(source)) {
        throw new Error(`"${source}" ist kein gültiges sächsisches Quellwort.`);
      }
      if (typeof target !== 'string' || target.length === 0) {
        throw new Error(`Das Ziel für "${source}" muss eine nichtleere Zeichenkette sein.`);
      }
      if (translations.has(source)) {
        throw new Error(`Die Regel "${source}" kommt mehrfach vor.`);
      }
      translations.set(source, target);
    }
  }
  for (const specialWord of [text.anfang, text.ende, text.wortschutz]) {
    if (translations.has(specialWord)) {
      throw new Error(`Das Textwort "${specialWord}" darf keine normale Übersetzungsregel sein.`);
    }
  }

  return { document, translations, text };
}
