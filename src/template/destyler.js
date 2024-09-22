import { getCurrentInstance } from 'vue'

let installed = false

export function setupUI() {
  if (installed)
    return
  const instance = getCurrentInstance()
  installed = true
}

