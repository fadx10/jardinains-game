import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

// LINT.IfChange(aistudio_media_plugin)
function aistudioMediaPlugin(): Plugin {
  return {
    name: 'vite-plugin-aistudio-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/aistudio/')) {
          const rawPath = req.url.split('?')[0].split('#')[0];
          try {
            const decodedPath = decodeURIComponent(rawPath);
            const relativePath = decodedPath.replace(/^\//, '');
            const aistudioDir = path.resolve(
              __dirname,
              'public',
              'assets',
              'aistudio',
            );
            const filePath = path.resolve(__dirname, 'public', relativePath);
            if (
              filePath.startsWith(aistudioDir + path.sep) &&
              fs.existsSync(filePath) &&
              fs.statSync(filePath).isFile()
            ) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.bmp': 'image/bmp',
                '.ico': 'image/x-icon',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogv': 'video/ogg',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.ogg': 'audio/ogg',
                '.pdf': 'application/pdf',
              };
              res.setHeader(
                'Content-Type',
                mimeMap[ext] || 'application/octet-stream',
              );
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch {
            // Fall through if URI decoding or file access fails
          }
        }
        next();
      });
    },
  };
}
// LINT.ThenChange(//depot/google3/java/com/google/alkali/boq/makersuite/applet_dev_service/templates/initializers/react_theme/vite.config.ts:aistudio_media_plugin)

// Dev plugin that serves transformed index.source.html for local development
function devSourceHtmlPlugin(): Plugin {
  return {
    name: 'vite-plugin-dev-source-html',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] || '';
        if (url === '/' || url === '/index.html') {
          try {
            const templatePath = path.resolve(__dirname, 'index.source.html');
            if (fs.existsSync(templatePath)) {
              const raw = fs.readFileSync(templatePath, 'utf-8');
              const transformed = await server.transformIndexHtml(req.url || '/', raw);
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.setHeader('Cache-Control', 'no-cache');
              res.end(transformed);
              return;
            }
          } catch (err) {
            return next(err);
          }
        }
        next();
      });
    },
  };
}

// Build plugin that syncs the compiled bundle to both dist/index.html and root index.html
function productionBundleSyncPlugin(): Plugin {
  return {
    name: 'vite-plugin-production-bundle-sync',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const rootHtml = path.resolve(__dirname, 'index.html');
      const distSourceHtml = path.resolve(distDir, 'index.source.html');
      const distIndexHtml = path.resolve(distDir, 'index.html');

      // If vite built into index.source.html, ensure dist/index.html exists
      if (fs.existsSync(distSourceHtml)) {
        fs.copyFileSync(distSourceHtml, distIndexHtml);
        fs.unlinkSync(distSourceHtml);
      }

      // Copy the compiled bundle to root index.html so ANY hosting method works (Git clone, FTP, cPanel, etc.)
      if (fs.existsSync(distIndexHtml)) {
        fs.copyFileSync(distIndexHtml, rootHtml);
        console.log('✓ Successfully synced compiled production bundle to root index.html and dist/index.html');
      }

      // Ensure .htaccess is copied to dist
      const htaccessSource = path.resolve(__dirname, '.htaccess');
      const htaccessDist = path.resolve(distDir, '.htaccess');
      if (fs.existsSync(htaccessSource)) {
        fs.copyFileSync(htaccessSource, htaccessDist);
      }
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'index.source.html'),
        },
      },
    },
    plugins: [
      devSourceHtmlPlugin(),
      react(), 
      tailwindcss(), 
      aistudioMediaPlugin(), 
      viteSingleFile(),
      productionBundleSyncPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
