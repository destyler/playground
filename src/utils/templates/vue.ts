import type { File } from './types'

export const VUE_TEMPLATE: { name: string, color: string, cdn: string[], defaultFiles: File[] } = {
  name: 'Vue',
  color: '#42b883',
  cdn: [
    'https://unpkg.com/vue@3/dist/vue.global.js',
    'https://unpkg.com/vue3-sfc-loader/dist/vue3-sfc-loader.js',
  ],
  defaultFiles: [
    {
      name: 'App.vue',
      content: `<script setup>
import { ref } from 'vue'
import Comp from './Comp.vue'

const msg = ref('Hello World!')
</script>

<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg">
  <Comp />
</template>`,
      active: true,
    },
    {
      name: 'Comp.vue',
      content: `<template>
  <div class="comp">
    I am a component
  </div>
</template>

<style scoped>
.comp {
  border: 1px solid #ddd;
  padding: 10px;
  margin-top: 10px;
  border-radius: 4px;
}
</style>`,
    },
  ],
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
