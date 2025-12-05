export type Framework = 'vue' | 'react' | 'solid' | 'svelte'

export interface File {
  name: string
  content: string
  active?: boolean
}

export interface FrameworkTemplate {
  name: string
  color: string
  cdn: string[]
  defaultFiles: File[]
}
