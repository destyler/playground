import react from '@astrojs/react'
import solid from '@astrojs/solid-js'
import svelte from '@astrojs/svelte'
import vue from '@astrojs/vue'
import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  integrations: [
    vue({
      include: ['src/**/*.{vue,md,mdx}', 'src/**/vue/**/*.{js,ts,jsx,tsx,vue}'],
      exclude: ['**/node_modules/**', '**/.astro/**'],
    }),
    react({
      include: ['src/**/react/**/*.{js,ts,jsx,tsx}', 'src/**/*.react.{jsx,tsx}'],
      exclude: ['**/node_modules/**', '**/.astro/**'],
    }),
    solid({
      include: ['src/**/solid/**/*.{js,ts,jsx,tsx}', 'src/**/*.solid.{jsx,tsx}'],
      exclude: ['**/node_modules/**', '**/.astro/**'],
    }),
    svelte({
      include: ['src/**/svelte/**/*.svelte', 'src/**/*.svelte'],
      exclude: ['**/node_modules/**', '**/.astro/**'],
    }),
    UnoCSS(),
  ],
})
