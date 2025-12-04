<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const theme = ref<string>('light')

// 获取保存的主题或使用系统偏好
function getStoredTheme(): string {
  return localStorage.getItem('theme')
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
}

// 设置主题
function setTheme(newTheme: string) {
  const root = document.documentElement
  root.setAttribute('data-theme', newTheme)
  root.classList.toggle('dark', newTheme === 'dark')
  localStorage.setItem('theme', newTheme)
  theme.value = newTheme
}

// 切换主题
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || getStoredTheme()
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  setTheme(newTheme)
}

// 监听系统主题变化
function handleSystemThemeChange(e: MediaQueryListEvent) {
  if (!localStorage.getItem('theme')) {
    setTheme(e.matches ? 'dark' : 'light')
  }
}

onMounted(() => {
  const initialTheme = getStoredTheme()
  setTheme(initialTheme)

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChange)
})

onUnmounted(() => {
  window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSystemThemeChange)
})
</script>

<template>
  <button
    class="text-primary px-1.5 py-px ml-1 flex items-center cursor-pointer bg-transparent m-0 border-[none] [outline:none]"
    aria-label="Toggle theme"
    @click="toggleTheme"
  >
    <div class="i-ph-sun-dim-duotone dark:i-ph-moon-duotone" />
  </button>
</template>
