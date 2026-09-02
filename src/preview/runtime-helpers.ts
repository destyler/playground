/**
 * Shared iframe runtime helpers for destyler module preload.
 * Generated as a string so it can run inside the preview iframe.
 */

export const PRELOAD_CONCURRENCY = 8

/**
 * JS snippet injected into preview iframes.
 * Expects `externalModules` to already be in scope.
 */
export function generateRuntimeHelpers(destylerVersion: string): string {
  return `
      const DESTYLER_CDN = 'https://esm.sh';
      const DESTYLER_VERSION = ${JSON.stringify(destylerVersion)};
      const PRELOAD_CONCURRENCY = ${PRELOAD_CONCURRENCY};

      function destylerCdnUrl(name) {
        const tag = !DESTYLER_VERSION || DESTYLER_VERSION === 'latest' ? '' : '@' + DESTYLER_VERSION;
        return DESTYLER_CDN + '/' + name + tag;
      }

      function collectImportSpecifiers(fileMap) {
        const specs = new Set();
        const staticRe = /(?:import|export)\\s+(?:type\\s+)?(?:[\\s\\S]*?from\\s+)?['"]([^'"]+)['"]/g;
        const dynamicRe = /import\\s*\\(\\s*['"]([^'"]+)['"]\\s*\\)/g;
        for (const content of Object.values(fileMap || {})) {
          if (typeof content !== 'string') continue;
          let m;
          staticRe.lastIndex = 0;
          dynamicRe.lastIndex = 0;
          while ((m = staticRe.exec(content))) specs.add(m[1]);
          while ((m = dynamicRe.exec(content))) specs.add(m[1]);
        }
        return specs;
      }

      function shouldSkipPreload(moduleName) {
        return moduleName === 'vue'
          || moduleName.startsWith('@vue/')
          || moduleName === 'react'
          || moduleName.startsWith('react-dom')
          || moduleName === 'solid-js'
          || moduleName.startsWith('solid-js/')
          || moduleName === 'svelte'
          || moduleName.startsWith('svelte/');
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
