import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import vue from '@astrojs/vue'

export default defineConfig({
  integrations: [
    vue({
      include: ['src/**/*.{vue,md,mdx}', 'src/**/vue/**/*.{js,ts,jsx,tsx,vue}'],
    }),
    react({
      include: ['src/**/*.{js,ts,jsx,tsx}', 'src/**/react/**/*.{js,ts,jsx,tsx}'],
    }),
  ],
})
