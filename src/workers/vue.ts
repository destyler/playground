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
          document.head.appendChild(style);
        },
        log(type, ...args) {
          console.log(type, ...args);
        }
      };

      const { loadModule } = window['vue3-sfc-loader'];

      async function update(newFiles) {
        if (newFiles) {
          Object.assign(files, newFiles);
        }

        // Clear existing app
        const appEl = document.getElementById('app');
        appEl.innerHTML = '';

        // Clear styles
        document.querySelectorAll('style[data-vue]').forEach(el => el.remove());

        try {
          const App = await loadModule('./App.vue', options);
          Vue.createApp(App).mount('#app');
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
