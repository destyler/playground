export function generateVueScript(serializedFiles: string) {
  return `
    <script type="module">
      const files = ${serializedFiles};

      const options = {
        moduleCache: { vue: Vue },
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

      const { loadModule } = window['vue3-sfc-loader'];

      let currentApp = null;

      async function update(newFiles) {
        if (newFiles) {
          Object.assign(files, newFiles);
          // Clear module cache to force reload
          options.moduleCache = { vue: Vue };
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
          const App = await loadModule('./App.vue', options);
          currentApp = Vue.createApp(App);
          currentApp.mount('#app');
        } catch (e) {
          console.error('Error loading Vue app:', e);
          appEl.innerHTML = '<pre style="color:red">' + e.message + '</pre>';
        }
      }

      update();

      window.addEventListener('message', (e) => {
        if (e.data.type === 'UPDATE_FILES') {
          update(e.data.files);
        }
      });
    </script>`
}
