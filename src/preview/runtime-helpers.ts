/**
 * Shared iframe runtime helpers for destyler module preload.
 * Generated as a string so it can run inside the preview iframe.
 */

export const PRELOAD_CONCURRENCY = 8

/**
 * JS snippet injected into preview iframes.
 * Expects `externalModules` to already be in scope.
 *
 * @param destylerVersion - Selected destyler package version
 * @param builtinModules - Module specifiers already provided by the active runtime
 */
export function generateRuntimeHelpers(
  destylerVersion: string,
  builtinModules: readonly string[] = [],
): string {
  return `
      const DESTYLER_CDN = 'https://esm.sh';
      const DESTYLER_VERSION = ${JSON.stringify(destylerVersion)};
      const PRELOAD_CONCURRENCY = ${PRELOAD_CONCURRENCY};
      const BUILTIN_MODULES = new Set(${JSON.stringify(builtinModules)});
      let previewUpdateGeneration = 0;

      function destylerCdnUrl(name) {
        const tag = !DESTYLER_VERSION || DESTYLER_VERSION === 'latest' ? '' : '@' + DESTYLER_VERSION;
        return DESTYLER_CDN + '/' + name + tag;
      }

      function isIdentifierStart(char) {
        return char !== undefined && /[a-z_$]/i.test(char);
      }

      function isIdentifierPart(char) {
        return char !== undefined && /[\\w$]/.test(char);
      }

      function readIdentifier(source, start) {
        if (!isIdentifierStart(source[start])) return null;
        let end = start + 1;
        while (isIdentifierPart(source[end])) end += 1;
        return { value: source.slice(start, end), end };
      }

      function skipLineComment(source, start) {
        const newline = source.indexOf('\\n', start + 2);
        return newline === -1 ? source.length : newline + 1;
      }

      function skipBlockComment(source, start) {
        const close = source.indexOf('*/', start + 2);
        return close === -1 ? source.length : close + 2;
      }

      function skipTrivia(source, start) {
        let index = start;
        while (index < source.length) {
          if (/\\s/.test(source[index])) {
            index += 1;
            continue;
          }
          if (source[index] === '/' && source[index + 1] === '/') {
            index = skipLineComment(source, index);
            continue;
          }
          if (source[index] === '/' && source[index + 1] === '*') {
            index = skipBlockComment(source, index);
            continue;
          }
          break;
        }
        return index;
      }

      function readString(source, start) {
        const quote = source[start];
        if (quote !== "'" && quote !== '"') return null;
        let value = '';
        let index = start + 1;
        while (index < source.length) {
          const char = source[index];
          if (char === quote) return { value, end: index + 1 };
          if (char === '\\\\' && index + 1 < source.length) {
            value += source[index + 1];
            index += 2;
            continue;
          }
          if (char === '\\n' || char === '\\r') return null;
          value += char;
          index += 1;
        }
        return null;
      }

      function isTypeOnlyNamedClause(source, start, end) {
        let index = skipTrivia(source, start);
        if (source[index] !== '{') return false;
        index += 1;

        while (index < end) {
          index = skipTrivia(source, index);
          if (source[index] === ',') {
            index += 1;
            continue;
          }
          if (source[index] === '}') return true;

          const token = readIdentifier(source, index);
          if (!token || token.value !== 'type') return false;

          const importedName = readIdentifier(source, skipTrivia(source, token.end));
          if (!importedName || importedName.value === 'as') return false;

          index = importedName.end;
          while (index < end && source[index] !== ',' && source[index] !== '}') {
            if (source[index] === '/' && source[index + 1] === '/')
              index = skipLineComment(source, index);
            else if (source[index] === '/' && source[index + 1] === '*')
              index = skipBlockComment(source, index);
            else
              index += 1;
          }
        }
        return true;
      }

      function findModuleSpecifierAfterFrom(source, start) {
        let index = start;
        let braceDepth = 0;

        while (index < source.length) {
          index = skipTrivia(source, index);
          if (index >= source.length) break;

          const char = source[index];
          if (char === ';') return { nextIndex: index + 1 };
          if (char === "'" || char === '"') {
            const literal = readString(source, index);
            return { nextIndex: literal ? literal.end : source.length };
          }
          if (char === '{') {
            braceDepth += 1;
            index += 1;
            continue;
          }
          if (char === '}') {
            braceDepth = Math.max(0, braceDepth - 1);
            index += 1;
            continue;
          }

          const token = readIdentifier(source, index);
          if (!token) {
            index += 1;
            continue;
          }
          if (braceDepth === 0 && (token.value === 'import' || token.value === 'export'))
            return { nextIndex: index };
          if (braceDepth === 0 && token.value === 'from') {
            const literal = readString(source, skipTrivia(source, token.end));
            if (literal) {
              return {
                clauseEnd: index,
                nextIndex: literal.end,
                specifier: literal.value,
              };
            }
          }
          index = token.end;
        }
        return { nextIndex: source.length };
      }

      function findImportEquals(source, afterBinding) {
        const equals = skipTrivia(source, afterBinding);
        if (source[equals] !== '=') return null;

        const requireToken = readIdentifier(source, skipTrivia(source, equals + 1));
        if (!requireToken || requireToken.value !== 'require') return null;

        const openParen = skipTrivia(source, requireToken.end);
        if (source[openParen] !== '(') return null;

        const literal = readString(source, skipTrivia(source, openParen + 1));
        if (!literal) return { nextIndex: openParen + 1 };
        return { nextIndex: literal.end, specifier: literal.value };
      }

      function collectImport(source, afterImport, specifiers) {
        const next = skipTrivia(source, afterImport);
        if (source[next] === '.') return next + 1;

        if (source[next] === '(') {
          const literal = readString(source, skipTrivia(source, next + 1));
          if (literal) specifiers.add(literal.value);
          return literal ? literal.end : next + 1;
        }

        const sideEffectImport = readString(source, next);
        if (sideEffectImport) {
          specifiers.add(sideEffectImport.value);
          return sideEffectImport.end;
        }

        const firstToken = readIdentifier(source, next);
        if (firstToken && (firstToken.value === 'type' || firstToken.value === 'typeof')) {
          const binding = readIdentifier(source, skipTrivia(source, firstToken.end));
          const importEquals = binding ? findImportEquals(source, binding.end) : null;
          if (importEquals) return importEquals.nextIndex;
          return firstToken.end;
        }

        const importEquals = firstToken ? findImportEquals(source, firstToken.end) : null;
        if (importEquals) {
          if (importEquals.specifier) specifiers.add(importEquals.specifier);
          return importEquals.nextIndex;
        }

        const found = findModuleSpecifierAfterFrom(source, next);
        if (found.specifier && found.clauseEnd !== undefined
          && !isTypeOnlyNamedClause(source, next, found.clauseEnd)) {
          specifiers.add(found.specifier);
        }
        return found.nextIndex;
      }

      function collectExport(source, afterExport, specifiers) {
        const next = skipTrivia(source, afterExport);
        const firstToken = readIdentifier(source, next);
        if (firstToken && firstToken.value === 'type') return firstToken.end;
        if (source[next] !== '*' && source[next] !== '{') return next;

        const found = findModuleSpecifierAfterFrom(source, next);
        if (found.specifier && found.clauseEnd !== undefined
          && (source[next] === '*' || !isTypeOnlyNamedClause(source, next, found.clauseEnd))) {
          specifiers.add(found.specifier);
        }
        return found.nextIndex;
      }

      function collectRequire(source, afterRequire, specifiers) {
        const openParen = skipTrivia(source, afterRequire);
        if (source[openParen] !== '(') return afterRequire;
        const literal = readString(source, skipTrivia(source, openParen + 1));
        if (literal) specifiers.add(literal.value);
        return literal ? literal.end : openParen + 1;
      }

      function scanTemplateLiteral(source, start, specifiers) {
        let index = start + 1;
        while (index < source.length) {
          if (source[index] === '\\\\') {
            index += 2;
            continue;
          }
          if (source.charCodeAt(index) === 96) return index + 1;
          if (source[index] === '$' && source[index + 1] === '{') {
            index = scanCode(source, index + 2, specifiers, true);
            continue;
          }
          index += 1;
        }
        return source.length;
      }

      function scanCode(source, start, specifiers, stopAtClosingBrace) {
        let index = start;
        let braceDepth = 0;

        while (index < source.length) {
          const char = source[index];
          if (char === "'" || char === '"') {
            const literal = readString(source, index);
            index = literal ? literal.end : source.length;
            continue;
          }
          if (source.charCodeAt(index) === 96) {
            index = scanTemplateLiteral(source, index, specifiers);
            continue;
          }
          if (char === '/' && source[index + 1] === '/') {
            index = skipLineComment(source, index);
            continue;
          }
          if (char === '/' && source[index + 1] === '*') {
            index = skipBlockComment(source, index);
            continue;
          }
          if (char === '{') {
            braceDepth += 1;
            index += 1;
            continue;
          }
          if (char === '}') {
            if (stopAtClosingBrace && braceDepth === 0) return index + 1;
            braceDepth = Math.max(0, braceDepth - 1);
            index += 1;
            continue;
          }

          const token = readIdentifier(source, index);
          if (!token) {
            index += 1;
            continue;
          }
          if (token.value === 'import')
            index = collectImport(source, token.end, specifiers);
          else if (token.value === 'export')
            index = collectExport(source, token.end, specifiers);
          else if (token.value === 'require')
            index = collectRequire(source, token.end, specifiers);
          else
            index = token.end;
        }
        return source.length;
      }

      function collectImportSpecifiers(fileMap) {
        const specifiers = new Set();
        for (const content of Object.values(fileMap || {})) {
          if (typeof content === 'string') scanCode(content, 0, specifiers, false);
        }
        return specifiers;
      }

      function shouldSkipPreload(moduleName) {
        return BUILTIN_MODULES.has(moduleName);
      }

      function beginPreviewUpdate() {
        previewUpdateGeneration += 1;
        return previewUpdateGeneration;
      }

      function isCurrentPreviewUpdate(generation) {
        return generation === previewUpdateGeneration;
      }

      function resolveExternalUrl(moduleName) {
        if (externalModules[moduleName]) return externalModules[moduleName];
        if (moduleName === '@destyler' || moduleName.startsWith('@destyler/')) {
          return destylerCdnUrl(moduleName);
        }
        return null;
      }

      function collectPreloadNames(fileMap) {
        const names = new Set();
        for (const name of Object.keys(externalModules || {})) {
          if (!shouldSkipPreload(name)) names.add(name);
        }
        for (const name of collectImportSpecifiers(fileMap)) {
          if (!shouldSkipPreload(name) && resolveExternalUrl(name)) names.add(name);
        }
        return [...names];
      }

      async function runPool(items, concurrency, worker) {
        const executing = new Set();
        for (const item of items) {
          const p = Promise.resolve()
            .then(function() { return worker(item); })
            .catch(function(e) {
              const label = Array.isArray(item) ? item[0] : item;
              console.error('[Playground] Failed to load module:', label, e);
            })
            .finally(function() { executing.delete(p); });
          executing.add(p);
          if (executing.size >= concurrency) {
            await Promise.race(executing);
          }
        }
        await Promise.all([...executing]);
      }
`
}
