export type Framework = 'vue' | 'react' | 'solid' | 'svelte'

export interface File {
  name: string
  content: string
  active?: boolean
}
