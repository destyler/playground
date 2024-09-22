import transformerDirective from '@unocss/transformer-directives'
import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'
import { presetAnimations } from 'unocss-preset-animations'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetAnimations(),
  ],
  transformers: [transformerDirective()],
  shortcuts: {
  },
})
