const wordAt = /[\p{L}_$][\p{L}\p{N}_$]*/uy;

/**
 * Übersetzt nur echte Quellwörter. Inhalte von Strings und Kommentaren bleiben
 * unverändert. Leerraum wird absichtlich bewahrt, damit Zeilen und Fehlerorte
 * möglichst stabil bleiben.
 */
export function transpile(source, translations) {
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
      result += translations.get(match[0]) ?? match[0];
      index = wordAt.lastIndex;
      continue;
    }

    result += character;
    index += 1;
  }

  return result;
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
