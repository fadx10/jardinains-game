# Jardinains Development Instructions

## Hosting and deployment

This project is hosted exclusively on **GitHub Pages**:

https://fadx10.github.io/jardinains-game/

Do not add FTP, Hostinger, cPanel, Apache, or DigitalPhablet deployment steps or credentials. GitHub Pages publishes the generated standalone bundle from the repository's `main` branch.

## Source and production HTML

- `index.source.html` is the master HTML template. Make title, description, canonical URL, social metadata, fonts, and head changes there.
- `index.html` is the generated standalone production bundle. Do not edit it manually or replace it with a development entry point that loads raw TypeScript/TSX.
- `vite.config.ts` uses `vite-plugin-singlefile` and synchronizes the generated production output to the repository root `index.html` during `npm run build`.

## Required validation

For every code or feature change:

1. Run `npm run lint`.
2. Run `npm run build`.
3. Confirm that the generated root `index.html` contains the latest application.

The GitHub Actions workflow performs the same checks and commits the generated standalone bundle so GitHub Pages can publish it.
