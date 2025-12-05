import type { File, Framework, FrameworkTemplate } from './types'

// 使用 import.meta.glob 读取模板文件
const vueTemplates = import.meta.glob('./vue/*', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const reactTemplates = import.meta.glob('./react/*', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const solidTemplates = import.meta.glob('./solid/*', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const svelteTemplates = import.meta.glob('./svelte/*', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

function getFilesFromGlob(templates: Record<string, string>, activeFileName: string): File[] {
  return Object.entries(templates).map(([path, content]) => {
    const name = path.split('/').pop() || ''
    return {
      name,
      content,
      active: name === activeFileName,
    }
  })
}

export const VUE_TEMPLATE: FrameworkTemplate = {
  name: 'Vue',
  color: '#42b883',
  cdn: [
    'https://unpkg.com/vue/dist/vue.global.js',
    'https://unpkg.com/vue3-sfc-loader/dist/vue3-sfc-loader.js',
  ],
  defaultFiles: getFilesFromGlob(vueTemplates, 'App.vue'),
}

export const REACT_TEMPLATE: FrameworkTemplate = {
  name: 'React',
  color: '#61dafb',
  cdn: [
    'https://unpkg.com/@babel/standalone/babel.min.js',
  ],
  defaultFiles: getFilesFromGlob(reactTemplates, 'App.tsx'),
}

export const SOLID_TEMPLATE: FrameworkTemplate = {
  name: 'Solid',
  color: '#2c4f7c',
  cdn: [],
  defaultFiles: getFilesFromGlob(solidTemplates, 'App.tsx'),
}

export const SVELTE_TEMPLATE: FrameworkTemplate = {
  name: 'Svelte',
  color: '#ff3e00',
  cdn: [
    'https://unpkg.com/@babel/standalone/babel.min.js',
  ],
  defaultFiles: getFilesFromGlob(svelteTemplates, 'App.svelte'),
}

export const FRAMEWORKS: Record<Framework, FrameworkTemplate> = {
  vue: VUE_TEMPLATE,
  react: REACT_TEMPLATE,
  solid: SOLID_TEMPLATE,
  svelte: SVELTE_TEMPLATE,
}

export type { File, Framework, FrameworkTemplate }
