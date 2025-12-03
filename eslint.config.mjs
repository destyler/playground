// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  astro: true,
  ignores: [
    '.specstory/**',
    'src/workers/vue.worker.ts',
  ],
})
