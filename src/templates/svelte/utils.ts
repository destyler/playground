// TypeScript utilities for Svelte
export const greeting: string = 'Hello'

export interface User {
  id: number
  name: string
  email: string
}

export function formatUser(user: User): string {
  return `${user.name} <${user.email}>`
}

export function createUser(name: string, email: string): User {
  return {
    id: Date.now(),
    name,
    email,
  }
}
