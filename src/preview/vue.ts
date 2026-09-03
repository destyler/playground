/**
 * Vue Preview Runtime Script Generator
 *
 * Generates the runtime script for Vue 3 SFC compilation and mounting
 * in the preview iframe. Uses vue3-sfc-loader for runtime SFC compilation.
 *
 * @module preview/vue
 */

import { generateRuntimeHelpers } from './runtime-helpers'

/**
 * Generates the Vue preview runtime script
 *
 * @param serializedFiles - JSON serialized file contents
 * @param serializedImportMap - JSON serialized import map for external modules
 * @param destylerVersion - Selected destyler version (pins esm.sh URLs when not latest)
 * @returns HTML script tags for Vue runtime
 */
export function generateVueScript(serializedFiles: string, serializedImportMap?: string, destylerVersion: string = 'latest') {
  const importMapData = serializedImportMap || '{}'

  return `
    <script type="module">
      // Vue is already loaded and exposed globally by the setup script in <head>
      // We import it here to use in this module scope
      import * as Vue from 'vue';

      const files = ${serializedFiles};
      const importMapData = ${importMapData};
      const externalModules = importMapData.imports || {};
      ${generateRuntimeHelpers(destylerVersion, [
        'vue',
        '@vue/runtime-core',
        '@vue/runtime-dom',
        '@vue/reactivity',
        '@vue/shared',
      ])}

      function wrapVueModule(module) {
        const plainModule = {};
        for (const key of Object.keys(module)) {
          plainModule[key] = module[key];
        }
        if (module.default !== undefined) {
          plainModule.default = module.default;
        }
        if (typeof module.default === 'function') {
          const wrapper = function(...args) {
            return module.default(...args);
          };
          Object.assign(wrapper, plainModule);
          wrapper.default = module.default;
          return wrapper;
        }
        return plainModule;
      }

      async function loadIntoCache(moduleCache, moduleName) {
        if (moduleCache[moduleName]) return moduleCache[moduleName];
        const moduleUrl = resolveExternalUrl(moduleName);
        if (!moduleUrl) return null;
        const module = await import(moduleUrl);
        const wrapped = wrapVueModule(module);
        moduleCache[moduleName] = wrapped;
        return wrapped;
      }

      async function preloadExternalModules(fileMap) {
        const moduleCache = { vue: Vue };
        const names = collectPreloadNames(fileMap);
        await runPool(names, PRELOAD_CONCURRENCY, async (moduleName) => {
          await loadIntoCache(moduleCache, moduleName);
        });
        return moduleCache;
      }

      let options = null;
      let currentApp = null;
      let moduleCache = null;

      async function ensureModulesForFiles(fileMap) {
        if (!moduleCache) {
          moduleCache = await preloadExternalModules(fileMap);
          return;
        }
        const names = collectPreloadNames(fileMap);
        await runPool(names, PRELOAD_CONCURRENCY, async (moduleName) => {
          const wrapped = await loadIntoCache(moduleCache, moduleName);
          if (wrapped && options) {
            options.moduleCache[moduleName] = wrapped;
          }
        });
      }

      async function update(newFiles) {
        // Clear any previous errors
        if (window.__clearError__) window.__clearError__();

        if (newFiles) {
          Object.assign(files, newFiles);
        }

        await ensureModulesForFiles(files);

        // Initialize options with moduleCache
        if (!options) {
          options = {
            moduleCache: { ...moduleCache },
            async getFile(url) {
              const filename = url.replace(/^\\.\\//, '');

              // Check if it's a user file
              if (files[filename]) {
                return files[filename];
              }

              // Check if it's an external module that we've pre-loaded
              // vue3-sfc-loader might request the module by name
              if (moduleCache[url] || moduleCache[filename]) {
                // Return empty string - the module is already in moduleCache
                // This tells vue3-sfc-loader to use the cached version
                return '';
              }

              const requested = (externalModules[url] || moduleCache[url]) ? url
                : (externalModules[filename] || moduleCache[filename]) ? filename
                : (url.startsWith('@destyler/') || filename.startsWith('@destyler/')) ? (url.startsWith('@destyler/') ? url : filename)
                : null;

              if (requested && (externalModules[requested] || requested.startsWith('@destyler/'))) {
                try {
                  const wrapped = await loadIntoCache(moduleCache, requested);
                  if (!wrapped) {
                    throw new Error('Failed to load module: ' + requested);
                  }
                  options.moduleCache[requested] = wrapped;
                  options.moduleCache[url] = wrapped;
                  options.moduleCache[filename] = wrapped;
                  return '';
                } catch (e) {
                  console.error('[Vue Playground] Failed to load module:', url, e);
                  throw new Error('Failed to load module: ' + url);
                }
              }

              throw new Error('File not found: ' + url);
            },
            addStyle(textContent) {
              const style = Object.assign(document.createElement('style'), { textContent });
              style.setAttribute('data-vue', '');
              document.head.appendChild(style);
            },
            log(type, ...args) {
              console.log(type, ...args);
            }
          };
        } else {
          // Reset module cache but keep external modules
          options.moduleCache = { ...moduleCache };
        }

        // Properly unmount existing app
        if (currentApp) {
          try {
            currentApp.unmount();
          } catch (e) {
            // Ignore unmount errors
          }
          currentApp = null;
        }

        // Clear existing app element and recreate it
        const appEl = document.getElementById('app');
        appEl.innerHTML = '';

        // Clear styles
        document.querySelectorAll('style[data-vue]').forEach(el => el.remove());

        try {
          const { loadModule } = window['vue3-sfc-loader'];
          const App = await loadModule('./App.vue', options);
          currentApp = Vue.createApp(App);
          currentApp.mount('#app');
        } catch (e) {
          console.error('Error loading Vue app:', e);
          if (window.__showError__) {
            window.__showError__('Vue Error: ' + e.message, e.stack);
          }
        }
      }

      // Wait for vue3-sfc-loader to be ready
      if (window['vue3-sfc-loader']) {
        update();
      } else {
        window.addEventListener('vue3-sfc-loader-ready', () => update());
      }

      window.addEventListener('message', (e) => {
        if (e.data.type === 'UPDATE_FILES') {
          update(e.data.files);
        }
      });
    </script>`
}
