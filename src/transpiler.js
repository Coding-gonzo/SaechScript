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
      result += translations.get(match[0]) ?? match[0];
      index = wordAt.lastIndex;
      continue;
    }

    result += character;
    index += 1;
  }

  return result;
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
      let protectedStart = wordAt.lastIndex;
      if (source[protectedStart] === ' ') protectedStart += 1;
      wordAt.lastIndex = protectedStart;
      const protectedWord = wordAt.exec(source);
      if (!protectedWord) {
        throw new Error(`Nach ${text.wortschutz} muss innerhalb eines Textes ein Wort stehen.`);
      }
      const isVocabulary = translations.has(protectedWord[0]) ||
        [text.anfang, text.ende, text.wortschutz].includes(protectedWord[0]);
      if (!isVocabulary) {
        throw new Error(`"${protectedWord[0]}" braucht keinen Wortschutz.`);
      }
      value += protectedWord[0];
      index = wordAt.lastIndex;
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
