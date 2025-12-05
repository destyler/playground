export type Framework = 'vue' | 'react' | 'solid' | 'svelte'

export interface File {
  name: string
  content: string
  active?: boolean
}

export interface ImportMap {
  imports: Record<string, string>
}

export interface FrameworkTemplate {
  name: string
  defaultFiles: File[]
  tsconfig: object
  importMap: ImportMap
}
