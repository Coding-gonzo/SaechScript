const wordAt = /[\p{L}_$][\p{L}\p{N}_$]*/uy;

/**
 * Übersetzt nur echte Quellwörter. Inhalte von Strings und Kommentaren bleiben
 * unverändert. Leerraum wird absichtlich bewahrt, damit Zeilen und Fehlerorte
 * möglichst stabil bleiben.
 */
export function transpile(source, translations, text = undefined) {
  let result = '';
  let index = 0;

  while (index < source.length) {
    const character = source[index];
    const next = source[index + 1];

    if (character === '/' && next === '/') {
      const end = source.indexOf('\n', index);
      const stop = end === -1 ? source.length : end;
      result += source.slice(index, stop);
      index = stop;
      continue;
    }

    if (character === '/' && next === '*') {
      const end = source.indexOf('*/', index + 2);
      const stop = end === -1 ? source.length : end + 2;
      result += source.slice(index, stop);
      index = stop;
      continue;
    }

    if (character === '"' || character === "'" || character === '`') {
      const end = findQuotedEnd(source, index, character);
      result += source.slice(index, end);
      index = end;
      continue;
    }

    wordAt.lastIndex = index;
    const match = wordAt.exec(source);
    if (match) {
      if (text && match[0] === text.anfang) {
        const translated = translateWordString(source, wordAt.lastIndex, translations, text);
        result += `"${translated.value}"`;
        index = translated.end;
        continue;
      }
      if (text && match[0] === text.wortschutz) {
        const escaped = readProtectedWord(source, wordAt.lastIndex, translations, text);
        result += escaped.value;
        index = escaped.end;
        continue;
      }
      result += translations.get(match[0]) ?? match[0];
      index = wordAt.lastIndex;
      continue;
    }

    result += character;
    index += 1;
  }

  return result;
}

/** Übersetzt TypeScript-Tokens in die kanonischen SächScript-Wörter. */
export function transpileToSaechs(source, translations, reverseTranslations, text) {
  const symbolTargets = [...reverseTranslations.keys()]
    .filter((target) => !/^[\p{L}_$][\p{L}\p{N}_$]*$/u.test(target))
    .sort((left, right) => right.length - left.length);
  let result = '';
  let index = 0;

  while (index < source.length) {
    const character = source[index];
    const next = source[index + 1];

    if (character === '/' && next === '/') {
      const end = source.indexOf('\n', index);
      const stop = end === -1 ? source.length : end;
      result += source.slice(index, stop);
      index = stop;
      continue;
    }
    if (character === '/' && next === '*') {
      const end = source.indexOf('*/', index + 2);
      const stop = end === -1 ? source.length : end + 2;
      result += source.slice(index, stop);
      index = stop;
      continue;
    }
    if (character === '"') {
      const end = findQuotedEnd(source, index, character);
      if (end === source.length && source[end - 1] !== '"') {
        throw new Error('Nicht abgeschlossener TypeScript-Text.');
      }
      const content = source.slice(index + 1, end - 1);
      result += `${text.anfang} ${protectStringWords(content, translations, text)} ${text.ende}`;
      index = end;
      continue;
    }
    if (character === "'" || character === '`') {
      const end = findQuotedEnd(source, index, character);
      result += source.slice(index, end);
      index = end;
      continue;
    }

    wordAt.lastIndex = index;
    const match = wordAt.exec(source);
    if (match) {
      const translated = reverseTranslations.get(match[0]);
      if (translated) result += translated;
      else if (translations.has(match[0]) || [text.anfang, text.ende, text.wortschutz].includes(match[0])) {
        result += `${text.wortschutz} ${match[0]}`;
      } else result += match[0];
      index = wordAt.lastIndex;
      continue;
    }

    const symbol = symbolTargets.find((target) => source.startsWith(target, index));
    if (symbol) {
      result = appendSpaced(result, reverseTranslations.get(symbol));
      index += symbol.length;
      while (source[index] === ' ') index += 1;
      continue;
    }

    result += character;
    index += 1;
  }

  return result;
}

function readProtectedWord(source, start, translations, text) {
  let protectedStart = start;
  if (source[protectedStart] === ' ') protectedStart += 1;
  wordAt.lastIndex = protectedStart;
  const protectedWord = wordAt.exec(source);
  if (!protectedWord) throw new Error(`Nach ${text.wortschutz} muss ein Wort stehen.`);
  const isVocabulary = translations.has(protectedWord[0]) ||
    [text.anfang, text.ende, text.wortschutz].includes(protectedWord[0]);
  if (!isVocabulary) throw new Error(`"${protectedWord[0]}" braucht keinen Wortschutz.`);
  return { value: protectedWord[0], end: wordAt.lastIndex };
}

function protectStringWords(content, translations, text) {
  return content.replace(/[\p{L}_$][\p{L}\p{N}_$]*/gu, (word) => {
    const needsProtection = translations.has(word) ||
      [text.anfang, text.ende, text.wortschutz].includes(word);
    return needsProtection ? `${text.wortschutz} ${word}` : word;
  });
}

function appendSpaced(result, word) {
  const prefix = result.length > 0 && !/\s$/.test(result) ? ' ' : '';
  return `${result}${prefix}${word} `;
}

function translateWordString(source, start, translations, text) {
  let value = '';
  let index = source[start] === ' ' ? start + 1 : start;

  while (index < source.length) {
    wordAt.lastIndex = index;
    const match = wordAt.exec(source);

    if (!match) {
      value += source[index];
      index += 1;
      continue;
    }

    if (match[0] === text.ende) {
      if (value.endsWith(' ') && source[index - 1] === ' ') value = value.slice(0, -1);
      return { value, end: wordAt.lastIndex };
    }

    if (match[0] === text.wortschutz) {
      const escaped = readProtectedWord(source, wordAt.lastIndex, translations, text);
      value += escaped.value;
      index = escaped.end;
      continue;
    }

    if (translations.has(match[0]) || match[0] === text.anfang) {
      throw new Error(`Das Vokabularwort "${match[0]}" muss im Text mit ${text.wortschutz} geschützt werden.`);
    }

    value += match[0];
    index = wordAt.lastIndex;
  }

  throw new Error(`Text wurde mit ${text.anfang} geöffnet, aber nicht mit ${text.ende} geschlossen.`);
}

function findQuotedEnd(source, start, quote) {
  let escaped = false;
  for (let index = start + 1; index < source.length; index += 1) {
    const character = source[index];
    if (escaped) {
      escaped = false;
    } else if (character === '\\') {
      escaped = true;
    } else if (character === quote) {
      return index + 1;
    }
  }
  return source.length;
}
