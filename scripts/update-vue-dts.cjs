
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

function findFile(startPath, fileName) {
    // Simple find implementation or hardcoded paths
    // Since we know the structure roughly, we can try to construct paths
    // But pnpm structure is tricky.
    // Let's use the paths we found earlier.
    return path.resolve(projectRoot, startPath);
}

const filesToRead = [
    {
        name: 'vue',
        path: 'node_modules/vue/dist/vue.d.ts',
        virtualPath: 'file:///node_modules/vue/index.d.ts'
    },
    {
        name: 'runtime-dom',
        path: 'node_modules/.pnpm/@vue+runtime-dom@3.5.25/node_modules/@vue/runtime-dom/dist/runtime-dom.d.ts',
        virtualPath: 'file:///node_modules/@vue/runtime-dom/index.d.ts'
    },
    {
        name: 'runtime-core',
        path: 'node_modules/.pnpm/@vue+runtime-core@3.5.25/node_modules/@vue/runtime-core/dist/runtime-core.d.ts',
        virtualPath: 'file:///node_modules/@vue/runtime-core/index.d.ts'
    },
    {
        name: 'reactivity',
        path: 'node_modules/.pnpm/@vue+reactivity@3.5.25/node_modules/@vue/reactivity/dist/reactivity.d.ts',
        virtualPath: 'file:///node_modules/@vue/reactivity/index.d.ts'
    },
    {
        name: 'shared',
        path: 'node_modules/.pnpm/@vue+shared@3.5.25/node_modules/@vue/shared/dist/shared.d.ts',
        virtualPath: 'file:///node_modules/@vue/shared/index.d.ts'
    }
];

let output = `export const vueDtsMap = new Map<string, string>();\n\n`;

filesToRead.forEach(file => {
    try {
        const content = fs.readFileSync(path.resolve(projectRoot, file.path), 'utf8');
        // Escape backticks
        const escapedContent = content.replace(/`/g, '\\`').replace(/\$/g, '\\$');
        output += `vueDtsMap.set('${file.virtualPath}', \`${escapedContent}\`);\n\n`;
        console.log(`Read ${file.name}`);
    } catch (e) {
        console.error(`Failed to read ${file.path}: ${e.message}`);
        // Try to find it if hardcoded path fails?
        // For now, just fail.
    }
});

fs.writeFileSync(path.resolve(projectRoot, 'src/utils/vue-dts.ts'), output);
console.log('Updated src/utils/vue-dts.ts');
