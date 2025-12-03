const fs = require('node:fs')
const path = require('node:path')

const projectRoot = path.resolve(__dirname, '..')

const filesToRead = [
  {
    name: 'solid-js',
    path: 'node_modules/solid-js/types/index.d.ts',
    virtualPath: 'file:///node_modules/solid-js/index.d.ts',
    },
  {
    name: 'solid-js-web',
    path: 'node_modules/solid-js/web/types/index.d.ts',
    virtualPath: 'file:///node_modules/solid-js/web/index.d.ts',
    },
  {
    name: 'solid-js-web-client',
    path: 'node_modules/solid-js/web/types/client.d.ts',
    virtualPath: 'file:///node_modules/solid-js/web/client.d.ts',
    },
  {
    name: 'solid-js-web-server-mock',
    path: 'node_modules/solid-js/web/types/server-mock.d.ts',
    virtualPath: 'file:///node_modules/solid-js/web/server-mock.d.ts',
    },
  {
    name: 'solid-js-web-jsx',
    path: 'node_modules/solid-js/web/types/jsx.d.ts',
    virtualPath: 'file:///node_modules/solid-js/web/jsx.d.ts',
    },
  {
    name: 'solid-js-html',
    path: 'node_modules/solid-js/html/types/index.d.ts',
    virtualPath: 'file:///node_modules/solid-js/html/index.d.ts',
    },
  {
    name: 'solid-js-jsx-runtime',
    path: 'node_modules/solid-js/jsx-runtime.d.ts',
    virtualPath: 'file:///node_modules/solid-js/jsx-runtime.d.ts',
    },
  {
    name: 'solid-js-jsx',
    path: 'node_modules/solid-js/types/jsx.d.ts', // Check if this is correct
    virtualPath: 'file:///node_modules/solid-js/jsx.d.ts',
    }
]

// Check if jsx.d.ts exists in types
try {
  fs.accessSync(path.resolve(projectRoot, 'node_modules/solid-js/types/jsx.d.ts'))
}
 catch (e) {
  // Maybe it's inside index.d.ts or elsewhere
  console.log('jsx.d.ts not found in types, skipping')
    filesToRead.pop()
}

let output = `export const solidDtsMap = new Map<string, string>();\n\n`

filesToRead.forEach((file) => {
  try {
    const content = fs.readFileSync(path.resolve(projectRoot, file.path), 'utf8')
        const escapedContent = content.replace(/`/g, '\\`').replace(/\$/g, '\\$')
        output += `solidDtsMap.set('${file.virtualPath}', \`${escapedContent}\`);\n\n`
        console.log(`Read ${file.name}`)
    }
 catch (e) {
    console.error(`Failed to read ${file.path}: ${e.message}`)
    }
})

fs.writeFileSync(path.resolve(projectRoot, 'src/utils/solid-dts.ts'), output)
console.log('Updated src/utils/solid-dts.ts')
