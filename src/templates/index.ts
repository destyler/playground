import type { File, Framework, FrameworkTemplate, ImportMap } from './types'

import reactImportMap from './react/import-map.json'
import reactTsconfig from './react/tsconfig.json'
import solidImportMap from './solid/import-map.json'
import solidTsconfig from './solid/tsconfig.json'
import svelteImportMap from './svelte/import-map.json'
import svelteTsconfig from './svelte/tsconfig.json'
import vueImportMap from './vue/import-map.json'
// 读取配置文件
import vueTsconfig from './vue/tsconfig.json'

// 使用 import.meta.glob 读取模板文件
const vueTemplates = import.meta.glob('./vue/*', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const reactTemplates = import.meta.glob('./react/*', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const solidTemplates = import.meta.glob('./solid/*', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const svelteTemplates = import.meta.glob('./svelte/*', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

function getFilesFromGlob(templates: Record<string, string>, activeFileName: string): File[] {
  return Object.entries(templates)
    .filter(([path]) => !path.endsWith('.json')) // 排除 JSON 配置文件
    .map(([path, content]) => {
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
  tsconfig: vueTsconfig,
  importMap: vueImportMap as ImportMap,
}

export const REACT_TEMPLATE: FrameworkTemplate = {
  name: 'React',
  color: '#61dafb',
  cdn: [
    'https://unpkg.com/@babel/standalone/babel.min.js',
  ],
  defaultFiles: getFilesFromGlob(reactTemplates, 'App.tsx'),
  tsconfig: reactTsconfig,
  importMap: reactImportMap as ImportMap,
}

export const SOLID_TEMPLATE: FrameworkTemplate = {
  name: 'Solid',
  color: '#2c4f7c',
  cdn: [],
  defaultFiles: getFilesFromGlob(solidTemplates, 'App.tsx'),
  tsconfig: solidTsconfig,
  importMap: solidImportMap as ImportMap,
}

export const SVELTE_TEMPLATE: FrameworkTemplate = {
  name: 'Svelte',
  color: '#ff3e00',
  cdn: [
    'https://unpkg.com/@babel/standalone/babel.min.js',
  ],
  defaultFiles: getFilesFromGlob(svelteTemplates, 'App.svelte'),
  tsconfig: svelteTsconfig,
  importMap: svelteImportMap as ImportMap,
}

export const FRAMEWORKS: Record<Framework, FrameworkTemplate> = {
  vue: VUE_TEMPLATE,
  react: REACT_TEMPLATE,
  solid: SOLID_TEMPLATE,
  svelte: SVELTE_TEMPLATE,
}

export type { File, Framework, FrameworkTemplate, ImportMap }
