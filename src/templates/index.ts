import type { File, Framework, FrameworkTemplate, UserImportMap } from './types'
import { DEFAULT_COMPONENT, generateComponentExampleFiles } from './component-example'

import reactImportMap from './react/import-map.json'
import reactTsconfig from './react/tsconfig.json'
import reactUnoConfig from './react/uno.config.ts?raw'
import solidImportMap from './solid/import-map.json'
import solidTsconfig from './solid/tsconfig.json'
import solidUnoConfig from './solid/uno.config.ts?raw'
import svelteImportMap from './svelte/import-map.json'
import svelteTsconfig from './svelte/tsconfig.json'
import svelteUnoConfig from './svelte/uno.config.ts?raw'
import vueImportMap from './vue/import-map.json'
import vueTsconfig from './vue/tsconfig.json'
import vueUnoConfig from './vue/uno.config.ts?raw'

// Template file imports using Vite's glob import
const vueTemplates = import.meta.glob('./vue/*', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const reactTemplates = import.meta.glob('./react/*', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const solidTemplates = import.meta.glob('./solid/*', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const svelteTemplates = import.meta.glob('./svelte/*', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

/**
 * File extensions/names to exclude from template loading (config files)
 */
const EXCLUDED_FILES = ['.json', 'uno.config.ts']

/**
 * Converts glob import results to File array
 * @param templates - Glob import result
 * @param activeFileName - Name of the file to mark as active
 */
function getFilesFromGlob(templates: Record<string, string>, activeFileName: string): File[] {
  return Object.entries(templates)
    .filter(([path]) => !EXCLUDED_FILES.some(pattern => path.endsWith(pattern)))
    .map(([path, content]) => {
      const name = path.split('/').pop() ?? ''
      return {
        name,
        content,
        active: name === activeFileName,
      }
    })
}

/**
 * Vue framework template
 */
export const VUE_TEMPLATE: FrameworkTemplate = {
  name: 'Vue',
  defaultFiles: getFilesFromGlob(vueTemplates, 'App.vue'),
  tsconfig: vueTsconfig,
  importMap: vueImportMap as UserImportMap,
  unoConfig: vueUnoConfig,
}

/**
 * React framework template
 */
export const REACT_TEMPLATE: FrameworkTemplate = {
  name: 'React',
  defaultFiles: getFilesFromGlob(reactTemplates, 'App.tsx'),
  tsconfig: reactTsconfig,
  importMap: reactImportMap as UserImportMap,
  unoConfig: reactUnoConfig,
}

/**
 * Solid framework template
 */
export const SOLID_TEMPLATE: FrameworkTemplate = {
  name: 'Solid',
  defaultFiles: getFilesFromGlob(solidTemplates, 'App.tsx'),
  tsconfig: solidTsconfig,
  importMap: solidImportMap as UserImportMap,
  unoConfig: solidUnoConfig,
}

/**
 * Svelte framework template
 */
export const SVELTE_TEMPLATE: FrameworkTemplate = {
  name: 'Svelte',
  defaultFiles: getFilesFromGlob(svelteTemplates, 'App.svelte'),
  tsconfig: svelteTsconfig,
  importMap: svelteImportMap as UserImportMap,
  unoConfig: svelteUnoConfig,
}

/**
 * Registry of all framework templates
 */
export const FRAMEWORKS: Record<Framework, FrameworkTemplate> = {
  vue: VUE_TEMPLATE,
  react: REACT_TEMPLATE,
  solid: SOLID_TEMPLATE,
  svelte: SVELTE_TEMPLATE,
}

// Re-export types for convenience
export type { File, Framework, FrameworkTemplate, UserImportMap }

function cloneFiles(files: File[]): File[] {
  return files.map(file => ({
    name: file.name,
    content: file.content,
    active: file.active,
  }))
}

/**
 * Playground files for a framework + destyler component.
 * Checkbox reuses the existing template folders; other components are generated.
 */
export function getComponentExampleFiles(framework: Framework, component: string): File[] {
  if (component === DEFAULT_COMPONENT)
    return cloneFiles(FRAMEWORKS[framework].defaultFiles)
  return generateComponentExampleFiles(framework, component)
}
