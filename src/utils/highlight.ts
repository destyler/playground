import { shikiToMonaco } from '@shikijs/monaco'
import * as monaco from 'monaco-editor-core'
import { createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

import langCss from 'shiki/langs/css.mjs'
import langHtml from 'shiki/langs/html.mjs'
import langJavascript from 'shiki/langs/javascript.mjs'
import langJson from 'shiki/langs/json.mjs'
import langJsx from 'shiki/langs/jsx.mjs'
import langTsx from 'shiki/langs/tsx.mjs'
import langTypescript from 'shiki/langs/typescript.mjs'
// 导入语言
import langVue from 'shiki/langs/vue.mjs'

// 导入主题
import themeDark from 'shiki/themes/dark-plus.mjs'
import themeLight from 'shiki/themes/light-plus.mjs'

let registered = false

export function registerHighlighter() {
  if (registered)
return
  registered = true

  const highlighter = createHighlighterCoreSync({
    themes: [themeDark, themeLight],
    langs: [
      langVue,
      langTsx,
      langJsx,
      langHtml,
      langCss,
      langJavascript,
      langTypescript,
      langJson,
    ],
    engine: createJavaScriptRegexEngine(),
  })

  // 注册语言
  monaco.languages.register({ id: 'vue' })
  monaco.languages.register({ id: 'typescript' })
  monaco.languages.register({ id: 'javascript' })
  monaco.languages.register({ id: 'tsx' })
  monaco.languages.register({ id: 'jsx' })
  monaco.languages.register({ id: 'html' })
  monaco.languages.register({ id: 'css' })
  monaco.languages.register({ id: 'json' })

  // 使用 Shiki 注册高亮
  shikiToMonaco(highlighter, monaco)
}
