import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

const ROOT_DIR = process.cwd();

const SHIM_SCRIPT = `<script id="server-mikrotik-shim">
  window.checkCookie = window.checkCookie || function() {
    if (typeof getCookie2 === 'function') {
      try { getCookie2(); } catch (e) {}
    }
  };
  window.hotspotConfig = window.hotspotConfig || {
    'enable-hot-cookie': 0,
    'app-store-base-url': ''
  };
  window.rem = window.rem || function() {};
</script>`;

function findFile(relPath: string): string | null {
  const candidates = [
    path.join(ROOT_DIR, relPath),
    path.join(ROOT_DIR, 'yyyy', relPath),
    path.join(ROOT_DIR, 'yyyy', relPath.replace(/^\//, '')),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return c;
    }
  }
  return null;
}

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'mikrotik-hotspot-server',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const rawUrl = req.url ? req.url.split('?')[0] : '';
            const cleanUrl = decodeURIComponent(rawUrl);

            // 1. Simulate login submission
            if (cleanUrl === '/login' || cleanUrl === '/yyyy/login') {
              res.writeHead(302, { Location: '/status.html' });
              res.end();
              return;
            }

            // 2. Resolve md5.js (often requested as /md5.js)
            if (cleanUrl.endsWith('/md5.js') || cleanUrl === '/md5.js') {
              const md5File = findFile('img/js/md5.js');
              if (md5File) {
                res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
                fs.createReadStream(md5File).pipe(res);
                return;
              }
            }

            // 3. Resolve welcome.mp3 (fallback to onlogin.mp3 or ayah.mp3)
            if (cleanUrl.endsWith('welcome.mp3')) {
              const audioFile = findFile('ayah.mp3') || findFile('onlogin.mp3');
              if (audioFile) {
                res.setHeader('Content-Type', 'audio/mpeg');
                fs.createReadStream(audioFile).pipe(res);
                return;
              }
            }

            // 4. Resolve banner2.jpg (template requests banner2 which is banner3 in assets)
            if (cleanUrl.endsWith('banner2.jpg')) {
              const bannerFile = findFile('img/banner3.jpg') || findFile('img/banner1.jpg');
              if (bannerFile) {
                res.setHeader('Content-Type', 'image/jpeg');
                fs.createReadStream(bannerFile).pipe(res);
                return;
              }
            }

            // 5. Resolve favicon.png fallback to favicon.ico
            if (cleanUrl.endsWith('favicon.png')) {
              const fav = findFile('favicon.ico');
              if (fav) {
                res.setHeader('Content-Type', 'image/x-icon');
                fs.createReadStream(fav).pipe(res);
                return;
              }
            }

            // 6. Handle CSS files with raw Content-Type (bypass PostCSS syntax strictness)
            if (cleanUrl.endsWith('.css')) {
              const cssFile = findFile(cleanUrl);
              if (cssFile) {
                res.setHeader('Content-Type', 'text/css; charset=utf-8');
                fs.createReadStream(cssFile).pipe(res);
                return;
              }
            }

            // 7. Handle JS files (support /js/ and /img/js/ interchangeably)
            if (cleanUrl.endsWith('.js')) {
              let jsFile = findFile(cleanUrl);
              if (!jsFile && cleanUrl.includes('/js/')) {
                jsFile = findFile(cleanUrl.replace('/js/', '/img/js/'));
              }
              if (jsFile) {
                res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
                fs.createReadStream(jsFile).pipe(res);
                return;
              }
            }

            // 8. Handle SVG, PNG, JPG images and fonts
            if (cleanUrl.endsWith('.svg')) {
              const f = findFile(cleanUrl);
              if (f) {
                res.setHeader('Content-Type', 'image/svg+xml');
                fs.createReadStream(f).pipe(res);
                return;
              }
            }
            if (cleanUrl.endsWith('.png')) {
              const f = findFile(cleanUrl);
              if (f) {
                res.setHeader('Content-Type', 'image/png');
                fs.createReadStream(f).pipe(res);
                return;
              }
            }
            if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) {
              const f = findFile(cleanUrl);
              if (f) {
                res.setHeader('Content-Type', 'image/jpeg');
                fs.createReadStream(f).pipe(res);
                return;
              }
            }
            if (cleanUrl.endsWith('.woff2')) {
              const f = findFile(cleanUrl);
              if (f) {
                res.setHeader('Content-Type', 'font/woff2');
                fs.createReadStream(f).pipe(res);
                return;
              }
            }
            if (cleanUrl.endsWith('.mp3')) {
              const f = findFile(cleanUrl);
              if (f) {
                res.setHeader('Content-Type', 'audio/mpeg');
                fs.createReadStream(f).pipe(res);
                return;
              }
            }

            // 9. Handle HTML files: inject shim for checkCookie and global hotspot objects
            if (cleanUrl.endsWith('.html') || cleanUrl === '/') {
              let targetHtmlPath = cleanUrl === '/' ? path.join(ROOT_DIR, 'index.html') : findFile(cleanUrl);
              if (targetHtmlPath && fs.existsSync(targetHtmlPath)) {
                let content = fs.readFileSync(targetHtmlPath, 'utf8');
                if (content.includes('<head>')) {
                  content = content.replace('<head>', `<head>\n${SHIM_SCRIPT}`);
                } else if (content.includes('<head ')) {
                  content = content.replace(/(<head[^>]*>)/, `$1\n${SHIM_SCRIPT}`);
                } else if (content.includes('<body')) {
                  content = content.replace('<body', `${SHIM_SCRIPT}\n<body`);
                }
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(content);
                return;
              }
            }

            next();
          });
        },
      },
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
