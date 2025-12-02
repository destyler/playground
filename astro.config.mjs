import { defineConfig } from 'astro/config'
import React from '@astrojs/react'
import Solid from '@astrojs/solid-js'
import Svelte from '@astrojs/svelte'
import Vue from '@astrojs/vue'

export default defineConfig({
  integrations: [
    Vue({
      include: ['**/*.vue'],
    }),
    React({
      include: ['**/*.react.tsx'],
      experimentalReactChildren: true,
    }),
    Solid({
      include: [
        '**/*.solid.tsx',
        '**/*/*.solid.tsx',
        '**/node_modules/@suid/material/**',
      ],
    }),
    Svelte({
      include: ['**/*.svelte'],
    }),
    // UnoCSS({
    //   injectReset: true,
    // }),
  ],
})
