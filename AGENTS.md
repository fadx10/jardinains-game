# CRITICAL AGENT INSTRUCTIONS FOR JARDINAINS

## 🚨 MANDATORY PRODUCTION DEPLOYMENT RULES (DO NOT MODIFY OR BYPASS)

This application is deployed directly to **Hostinger Shared Web Hosting (Apache/LiteSpeed)** via Git Version Control and FTP at `digitalphablet.com/jardinains/`.
Shared hosting servers **CANNOT compile TypeScript/React on the fly**. They only serve static files directly.

### 1. The Two-File HTML Architecture
- **`index.source.html`** is the **MASTER SOURCE TEMPLATE** for development.
  - Any changes to `<title>`, `<meta>` tags, SEO metadata, fonts, styles, or external scripts MUST be made in `index.source.html`.
  - NEVER delete or rename `index.source.html`.
- **`index.html`** is the **AUTO-GENERATED COMPILED PRODUCTION BUNDLE**.
  - **STRICT PROHIBITION:** NEVER edit `index.html` to insert `<script type="module" src="./src/main.tsx"></script>` or raw uncompiled code!
  - Doing so immediately causes the **Fatal White Screen of Death** on the live website because Apache serves `.tsx` as `text/plain` which modern browsers block.
  - `index.html` is automatically overwritten and kept up to date by `npm run build` via `vite.config.ts`.

### 2. Required Build Step on ANY Change
Whenever you add features, fix bugs, or change any code:
- ALWAYS run `compile_applet` (or `npm run build`) before ending your turn.
- `npm run build` compiles the application into a standalone self-contained bundle and writes it to BOTH `dist/index.html` AND the repository root `index.html`.
- This guarantees that whenever the user commits and pushes to GitHub, Hostinger immediately receives the pre-compiled, fully functional application.

### 3. Server Configuration Files
- NEVER delete or break `/.htaccess` or `/.cpanel.yml`.
- `/.htaccess` provides essential MIME types, SPA fallbacks, and cache-invalidation headers for Hostinger/cPanel.
- `/.cpanel.yml` provides automated deployment commands for Hostinger Git Version Control.
