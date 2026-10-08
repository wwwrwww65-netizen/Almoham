import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

const SHIM_SCRIPT = `
<script id="mikrotik-server-shim">
  // Simulator error and dialog guards
  window.alert = function(msg) { console.log('[Alert]:', msg); };
  window.confirm = function() { return true; };
  window.checkCookie = function() {};
  window.getCookie2 = function() {};
  window.openLogin = function() { return true; };
  window.delrem = function() {
    try {
      document.cookie = 'uname=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      document.cookie = 'username=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      document.cookie = 'error=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    } catch(e) {}
    return true;
  };
  window.doLogin = function() { return true; };
  window.openAdvert = function() { return true; };

  window.addEventListener('error', function(e) {
    if (e.preventDefault) e.preventDefault();
    return true;
  });
  window.addEventListener('unhandledrejection', function(e) {
    if (e.preventDefault) e.preventDefault();
  });

  window.hotspotConfig = window.hotspotConfig || {
    'enable-hot-cookie': 0,
    'app-store-base-url': ''
  };

  // Safe rem implementation so uname/username never causes null TypeError
  window.rem = function() {
    try {
      var el = document.getElementById('uname') || document.getElementById('username') || document.querySelector('input[name="username"]');
      var uname = el ? el.value : '';
      var remEl = document.getElementById('remember');
      var isRem = remEl ? remEl.checked : true;
      if (isRem && uname) {
        var expires = new Date(Date.now() + 5000).toGMTString();
        var expire = new Date(Date.now() + 259200000).toGMTString();
        document.cookie = 'uname=' + uname + ';expires=' + expire + ';path=/';
        document.cookie = 'username=' + uname + ';expires=' + expire + ';path=/';
        document.cookie = 'error=1;expires=' + expires + ';path=/';
      }
    } catch(e) {}
    return true;
  };

  // Create uname element alias if only username exists, and handle form action
  document.addEventListener('DOMContentLoaded', function() {
    var u = document.getElementById('username');
    if (u && !document.getElementById('uname')) {
      var hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.id = 'uname';
      hidden.value = u.value;
      u.addEventListener('input', function() { hidden.value = u.value; });
      if (u.form) u.form.appendChild(hidden);
    }
    if (!document.getElementById('ChangeProfByAlnesrNetwork')) {
      var d = document.createElement('div');
      d.id = 'ChangeProfByAlnesrNetwork';
      d.style.display = 'none';
      document.body.appendChild(d);
    }
    var forms = document.querySelectorAll('form');
    forms.forEach(function(f) {
      if (!f.action || f.action.includes('link-login') || f.action.includes('$(')) {
        f.action = '/login';
      }
    });
  });
</script>
`;

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'raw-static-serve',
        transformIndexHtml(html) {
          if (html.includes('<head>')) {
            return html.replace('<head>', '<head>' + SHIM_SCRIPT);
          }
          if (html.includes('<head ')) {
            return html.replace(/(<head[^>]*>)/, '$1' + SHIM_SCRIPT);
          }
          return SHIM_SCRIPT + html;
        },
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const rawUrl = req.url ? req.url.split('?')[0] : '';
            const url = decodeURIComponent(rawUrl);

            // Intercept and inject shim into all HTML responses
            if (url.endsWith('.html') || url === '/') {
              let targetHtmlPath = url === '/' ? path.join(__dirname, 'index.html') : path.join(__dirname, url);
              if (!fs.existsSync(targetHtmlPath)) {
                targetHtmlPath = path.join(__dirname, 'yyyy', url.replace(/^\//, ''));
              }
              if (fs.existsSync(targetHtmlPath) && fs.statSync(targetHtmlPath).isFile()) {
                let content = fs.readFileSync(targetHtmlPath, 'utf8');

                // Simulate MikroTik RouterOS variable replacement on-the-fly
                content = content
                  .replace(/\$\(link-login-only\)/g, '/login')
                  .replace(/\$\(link-login\)/g, '/login')
                  .replace(/\$\(link-status\)/g, '/status.html')
                  .replace(/\$\(link-logout\)/g, '/logout')
                  .replace(/\$\(link-orig\)/g, '/status.html')
                  .replace(/\$\(error\)/g, '')
                  .replace(/\$\(ip\)/g, '192.168.88.25')
                  .replace(/\$\(mac\)/g, 'BC:24:11:45:67:89')
                  .replace(/\$\(username\)/g, 'المشترك')
                  .replace(/\$\(uptime\)/g, '02:45:10')
                  .replace(/\$\(bytes-in-nice\)/g, '124.5 MB')
                  .replace(/\$\(bytes-out-nice\)/g, '350.2 MB')
                  .replace(/\$\(session-time-left\)/g, '4h 15m')
                  .replace(/\$\(remain-bytes-total\)/g, '524288000')
                  .replace(/\$\(refresh-timeout-secs\)/g, '60')
                  .replace(/\$\(if chap-id\)[\s\S]*?\$\(endif\)/g, '')
                  .replace(/\$\(if error\)[\s\S]*?\$\(endif\)/g, '');

                if (content.includes('<head>')) {
                  content = content.replace('<head>', '<head>' + SHIM_SCRIPT);
                } else if (content.includes('<head ')) {
                  content = content.replace(/(<head[^>]*>)/, '$1' + SHIM_SCRIPT);
                } else {
                  content = SHIM_SCRIPT + content;
                }

                try {
                  const transformed = await server.transformIndexHtml(url, content);
                  res.setHeader('Content-Type', 'text/html; charset=utf-8');
                  res.end(transformed);
                  return;
                } catch(err) {
                  res.setHeader('Content-Type', 'text/html; charset=utf-8');
                  res.end(content);
                  return;
                }
              }
            }

            // Simulated login handler (accepts /login, /yyyy/login, link-login-only, and any POST login)
            if (
              url === '/login' ||
              url === '/yyyy/login' ||
              url.includes('link-login') ||
              url.includes('$(') ||
              (req.method === 'POST' && url.includes('login'))
            ) {
              const referer = req.headers.referer || '';
              const target = referer.includes('/yyyy/') ? '/yyyy/status.html' : '/status.html';
              res.writeHead(302, { Location: target });
              res.end();
              return;
            }

            // Simulated logout handler
            if (url === '/logout' || url === '/yyyy/logout' || url.includes('link-logout')) {
              const referer = req.headers.referer || '';
              const target = referer.includes('/yyyy/') ? '/yyyy/login.html' : '/login.html';
              res.writeHead(302, { Location: target });
              res.end();
              return;
            }

            // md5.js resolution (usually requested as /md5.js)
            if (url.endsWith('/md5.js') || url === '/md5.js') {
              const candidates = [
                path.join(__dirname, 'img/js/md5.js'),
                path.join(__dirname, 'yyyy/img/js/md5.js'),
              ];
              for (const c of candidates) {
                if (fs.existsSync(c)) {
                  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
                  fs.createReadStream(c).pipe(res);
                  return;
                }
              }
            }

            // welcome.mp3 fallback (ayah.mp3 or onlogin.mp3)
            if (url.endsWith('welcome.mp3')) {
              const candidates = [
                path.join(__dirname, 'ayah.mp3'),
                path.join(__dirname, 'yyyy/ayah.mp3'),
                path.join(__dirname, 'onlogin.mp3'),
                path.join(__dirname, 'yyyy/onlogin.mp3'),
              ];
              for (const c of candidates) {
                if (fs.existsSync(c)) {
                  res.setHeader('Content-Type', 'audio/mpeg');
                  fs.createReadStream(c).pipe(res);
                  return;
                }
              }
            }

            // banner2.jpg fallback
            if (url.endsWith('banner2.jpg')) {
              const candidates = [
                path.join(__dirname, 'img/banner3.jpg'),
                path.join(__dirname, 'yyyy/img/banner3.jpg'),
                path.join(__dirname, 'img/banner1.jpg'),
              ];
              for (const c of candidates) {
                if (fs.existsSync(c)) {
                  res.setHeader('Content-Type', 'image/jpeg');
                  fs.createReadStream(c).pipe(res);
                  return;
                }
              }
            }

            // favicon.png fallback to favicon.ico
            if (url.endsWith('favicon.png')) {
              const candidates = [
                path.join(__dirname, 'favicon.ico'),
                path.join(__dirname, 'yyyy/favicon.ico'),
              ];
              for (const c of candidates) {
                if (fs.existsSync(c)) {
                  res.setHeader('Content-Type', 'image/x-icon');
                  fs.createReadStream(c).pipe(res);
                  return;
                }
              }
            }

            // Serve raw CSS files directly to avoid strict PostCSS parsing issues
            if (url.endsWith('.css')) {
              const candidates = [
                path.join(__dirname, url),
                path.join(__dirname, 'yyyy', url.replace(/^\//, '')),
              ];
              for (const c of candidates) {
                if (fs.existsSync(c) && fs.statSync(c).isFile()) {
                  res.setHeader('Content-Type', 'text/css; charset=utf-8');
                  fs.createReadStream(c).pipe(res);
                  return;
                }
              }
            }

            // Serve JS files (resolving /js/ to /img/js/ if needed)
            if (url.endsWith('.js')) {
              const candidates = [
                path.join(__dirname, url),
                path.join(__dirname, 'yyyy', url.replace(/^\//, '')),
                path.join(__dirname, url.replace(/\/js\//, '/img/js/')),
                path.join(__dirname, 'yyyy', url.replace(/^\//, '').replace(/^js\//, 'img/js/')),
              ];
              for (const c of candidates) {
                if (fs.existsSync(c) && fs.statSync(c).isFile()) {
                  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
                  fs.createReadStream(c).pipe(res);
                  return;
                }
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

