<!--
  Theme Toggle Component

  A button component that toggles between light and dark themes.
  Persists user preference in localStorage and respects system preference.

  @component Toggle
-->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

// ============================================================================
// Constants
// ============================================================================

/** Theme values */
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const

/** LocalStorage key for theme preference */
const STORAGE_KEY = 'theme'

/** CSS class for dark mode */
const DARK_CLASS = 'dark'

/** Media query for system dark mode preference */
const DARK_MODE_QUERY = '(prefers-color-scheme: dark)'

// ============================================================================
// State
// ============================================================================

const theme = ref<string>(THEMES.LIGHT)

// ============================================================================
// Theme Helpers
// ============================================================================

/**
 * Get the stored theme from localStorage or detect system preference
 */
function getStoredTheme(): string {
  return localStorage.getItem(STORAGE_KEY)
    || (window.matchMedia(DARK_MODE_QUERY).matches ? THEMES.DARK : THEMES.LIGHT)
}

/**
 * Apply theme to the document and persist to localStorage
 *
 * @param newTheme - The theme to apply ('light' or 'dark')
 */
function setTheme(newTheme: string) {
  const root = document.documentElement
  root.setAttribute('data-theme', newTheme)
  root.classList.toggle(DARK_CLASS, newTheme === THEMES.DARK)
  localStorage.setItem(STORAGE_KEY, newTheme)
  theme.value = newTheme
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || getStoredTheme()
  const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
  setTheme(newTheme)
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle system theme preference changes
 *
 * Only applies if user hasn't set a manual preference
 */
function handleSystemThemeChange(e: MediaQueryListEvent) {
  if (!localStorage.getItem(STORAGE_KEY)) {
    setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT)
  }
}

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  const initialTheme = getStoredTheme()
  setTheme(initialTheme)

  window.matchMedia(DARK_MODE_QUERY).addEventListener('change', handleSystemThemeChange)
})

onUnmounted(() => {
  window.matchMedia(DARK_MODE_QUERY).removeEventListener('change', handleSystemThemeChange)
})
</script>

<template>
  <button
    class="text-primary px-1.5 py-px ml-1 flex items-center cursor-pointer bg-transparent m-0 border-[none] [outline:none] op-60 hover:op-100"
    aria-label="Toggle theme"
    @click="toggleTheme"
  >
    <div class="i-ph-sun-dim-duotone dark:i-ph-moon-duotone" />
  </button>
</template>
