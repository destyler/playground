
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const filesToRead = [
    {
        name: 'react',
        path: 'node_modules/@types/react/index.d.ts',
        virtualPath: 'file:///node_modules/@types/react/index.d.ts'
    },
    {
        name: 'react-global',
        path: 'node_modules/@types/react/global.d.ts',
        virtualPath: 'file:///node_modules/@types/react/global.d.ts'
    },
    {
        name: 'react-jsx-runtime',
        path: 'node_modules/@types/react/jsx-runtime.d.ts',
        virtualPath: 'file:///node_modules/@types/react/jsx-runtime.d.ts'
    },
    {
        name: 'csstype',
        path: 'node_modules/.pnpm/csstype@3.2.3/node_modules/csstype/index.d.ts',
        virtualPath: 'file:///node_modules/csstype/index.d.ts'
    }
];

let output = `export const reactDtsMap = new Map<string, string>();\n\n`;

filesToRead.forEach(file => {
    try {
        const content = fs.readFileSync(path.resolve(projectRoot, file.path), 'utf8');
        const escapedContent = content.replace(/`/g, '\\`').replace(/\$/g, '\\$');
        output += `reactDtsMap.set('${file.virtualPath}', \`${escapedContent}\`);\n\n`;
        console.log(`Read ${file.name}`);
    } catch (e) {
        console.error(`Failed to read ${file.path}: ${e.message}`);
    }
});

fs.writeFileSync(path.resolve(projectRoot, 'src/utils/react-dts.ts'), output);
console.log('Updated src/utils/react-dts.ts');
