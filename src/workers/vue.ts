import { vueDtsMap } from '../utils/vue-dts'

export function getVueMonacoConfig(monaco: any) {
  const extraLibs: any[] = []
  vueDtsMap.forEach((content, filePath) => {
    extraLibs.push({ content, filePath })
  })

  return {
    compilerOptions: {
      jsx: monaco.languages.typescript.JsxEmit.Preserve,
    },
    extraLibs,
  }
}

export function generateVueScript(serializedFiles: string) {
  return `
    <script>
      const { loadModule } = window['vue3-sfc-loader'];

      let app = null;

      // Store files globally so they can be updated
      window.__FILES__ = ${serializedFiles};

      async function update(files) {
        if (files) {
          window.__FILES__ = files;
        }

        if (app) {
          app.unmount();
          document.getElementById('app').innerHTML = '';
        }

        const options = {
          moduleCache: {
            vue: Vue
          },
          async getFile(url) {
            const content = window.__FILES__[url.replace(/^\\.\\//, '')];
            if (!content) throw new Error('File not found: ' + url);
            return content;
          },
          addStyle(textContent) {
            const style = document.createElement('style');
            style.textContent = textContent;
            style.dataset.generated = 'true';
            const ref = document.head.getElementsByTagName('style')[0] || null;
            document.head.insertBefore(style, ref);
          },
        }

        // Clean up old styles
        document.querySelectorAll('style[data-generated]').forEach(el => el.remove());

        app = Vue.createApp(Vue.defineAsyncComponent(() => loadModule('./App.vue', options)));
        app.mount('#app');
      }

      // Initial load
      update();

      // Listen for updates
      window.addEventListener('message', (e) => {
        if (e.data.type === 'UPDATE_FILES') {
          update(e.data.files);
        }
      });
    </script>`
}
