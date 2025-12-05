/**
 * Vue Preview Runtime Script Generator
 *
 * Generates the runtime script for Vue 3 SFC compilation and mounting
 * in the preview iframe. Uses vue3-sfc-loader for runtime SFC compilation.
 *
 * @module preview/vue
 */

/**
 * Generates the Vue preview runtime script
 *
 * @param serializedFiles - JSON serialized file contents
 * @param serializedImportMap - JSON serialized import map for external modules
 * @returns HTML script tags for Vue runtime
 */
export function generateVueScript(serializedFiles: string, serializedImportMap?: string) {
  const importMapData = serializedImportMap || '{}'

  return `
    <script type="module">
      // Vue is already loaded and exposed globally by the setup script in <head>
      // We import it here to use in this module scope
      import * as Vue from 'vue';

      const files = ${serializedFiles};
      const importMapData = ${importMapData};
      const externalModules = importMapData.imports || {};

      // Pre-load external modules into the module cache
      async function preloadExternalModules() {
        // Use the same Vue instance from import map
        const moduleCache = {
          vue: Vue,
        };

        for (const [moduleName, moduleUrl] of Object.entries(externalModules)) {
          try {
            // Skip Vue - it's already loaded above
            if (moduleName === 'vue') continue;


            const module = await import(moduleUrl);

            // Create a plain object copy since ES Modules are frozen
            const plainModule = {};

            // Copy all named exports
            for (const key of Object.keys(module)) {
              plainModule[key] = module[key];
            }

            // Ensure default is set (some modules have it as a getter)
            if (module.default !== undefined) {
              plainModule.default = module.default;
            }

            // For modules where the main export is a function (like dayjs),
            // make the module itself callable
            if (typeof module.default === 'function') {
              const wrapper = function(...args) {
                return module.default(...args);
              };
              Object.assign(wrapper, plainModule);
              wrapper.default = module.default;
              moduleCache[moduleName] = wrapper;
            } else {
              moduleCache[moduleName] = plainModule;
            }

          } catch (e) {
            console.error('[Vue Playground] Failed to pre-load module:', moduleName, e);
          }
        }

        return moduleCache;
      }

      let options = null;
      let currentApp = null;
      let moduleCache = null;

      async function update(newFiles) {
        // Clear any previous errors
        if (window.__clearError__) window.__clearError__();

        if (newFiles) {
          Object.assign(files, newFiles);
        }

        // Pre-load external modules (only once or when refreshing)
        if (!moduleCache) {
          moduleCache = await preloadExternalModules();
        }

        // Initialize options with moduleCache
        if (!options) {
          options = {
            moduleCache: { ...moduleCache },
            async getFile(url) {
              const filename = url.replace(/^\\.\\//, '');
              if (files[filename]) {
                return files[filename];
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
