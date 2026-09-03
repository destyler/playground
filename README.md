# Multi-Framework Playground

This is a playground project built with Astro, supporting Vue, React, Solid, and Svelte.

## Features

- **Multi-Framework Support**: Switch between Vue, React, Solid, and Svelte.
- **CDN-based**: All framework dependencies are loaded via CDN in the preview iframe, ensuring isolation and lightweight initial load.
- **Monaco Editor**: Integrated code editor with syntax highlighting.
- **Live Preview**: Code is compiled (if necessary) and executed in the browser.

## How it works

1.  **Shell**: The main application is built with Astro and React (for the Playground component).
2.  **Editor**: Monaco Editor is used for code input.
3.  **Preview**: An `iframe` is used to render the user's code.
4.  **Compilation**:
    -   **React**: Uses `@babel/standalone` in the iframe to compile JSX.
    -   **Vue**: Uses `vue.global.js` (Runtime + Compiler) to compile templates on the fly.
    -   **Solid**: Uses `solid-js/html` (Tagged Template Literals) to avoid complex in-browser JSX compilation for this demo.
    -   **Svelte**: Uses `svelte/compiler` from CDN to compile Svelte components in the browser.

## Running the project

```bash
pnpm install
pnpm dev
```

## Pull request previews

Pull requests opened against `next` are deployed to an isolated Zeabur service. The preview is updated when new commits are pushed, its URL is kept in a single pull request comment, and the service is removed when the pull request is closed or merged.

The workflow requires the following GitHub repository configuration:

- Secret: `ZEABUR_TOKEN`
- Variable: `ZEABUR_PROJECT_ID`
- Variable: `ZEABUR_ENVIRONMENT_ID`

For security, previews run only for branches in this repository. Pull requests from forks are not given access to the Zeabur token.

## Notes

-   **SolidJS**: Uses `html` tagged templates for simplicity in the CDN environment.
-   **Svelte**: Uses the Svelte 4 compiler from CDN.
