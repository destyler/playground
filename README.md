# Destyler Playground (Astro reboot)

Fresh start for a multi-framework Destyler playground powered by Astro. The old Vite + Vue REPL has been cleared out so we can rebuild with Vue, React, Svelte, Solid, and vanilla demos side-by-side.

## Quick start

```bash
pnpm install
pnpm dev
```

## What’s included

- Astro 5 with Vue, React, Svelte, and Solid integrations wired up
- UnoCSS (same presets as before) and a minimal base layout
- Clean TypeScript + ESLint + Prettier setup
- Vue import-map playground that pulls Destyler 0.2.x straight from jsDelivr
- React, Svelte, and Solid dialog demos bundled from npm (no CDN import map)

## Next steps

- Add Sandpack/WebContainer-based playgrounds for other frameworks
- Shareable state (hash/URL) and unified styling across demos
- Document how to pin additional CDN dependencies per framework

## License

[MIT](./LICENSE)
