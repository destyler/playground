import React from '@astrojs/react'
import Solid from '@astrojs/solid-js'
import Svelte from '@astrojs/svelte'
import Vue from '@astrojs/vue'
import replace from '@rollup/plugin-replace'
import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'

export default defineConfig({
  integrations: [
    Vue({
      include: [
        '**/*.vue',
        '**/*/*.vue',
      ],
      exclude: [
        '**/templates/**',
      ],
    }),
    React({
      include: [
        '**/*.tsx',
        '**/*/*.tsx',
      ],
      exclude: [
        '**/templates/**',
      ],
      experimentalReactChildren: true,
    }),
    Solid({
      include: [
        '**/*.solid.tsx',
        '**/solid/*.tsx',
        '**/*/*.solid.tsx',
        '**/node_modules/@suid/material/**',
      ],
      exclude: [
        '**/templates/**',
      ],
    }),
    Svelte({
      include: [
        '**/*.svelte',
        '**/*/*.svelte',
      ],
      exclude: [
        '**/templates/**',
      ],
    }),
    UnoCSS({
      injectReset: true,
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@vue/compiler-dom': '@vue/compiler-dom/dist/compiler-dom.cjs.js',
        '@vue/compiler-core': '@vue/compiler-core/dist/compiler-core.cjs.js',
      },
    },
    build: {
      commonjsOptions: {
        ignore: ['typescript'],
      },
    },
    worker: {
      format: 'es',
      plugins: () => [
        replace({
          preventAssignment: true,
          values: {
            'process.env.NODE_ENV': JSON.stringify('production'),
          },
        }),
      ],
    },
    optimizeDeps: {
      include: [
        'monaco-editor-core',
        '@volar/monaco',
        '@volar/jsdelivr',
        'vscode-uri',
      ],
    },
  },
})
