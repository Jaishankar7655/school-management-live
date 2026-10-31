import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { pathToFileURL } from 'url';
import dns from 'dns';

// Fix Windows / ISP DNS refusing SRV queries (querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore
}

function matchApiRoute(rawPathname) {
  const pathname = rawPathname.replace(/\/+$/, '') || '/';

  // Auth routes
  if (pathname === '/api/auth/login') return { file: './api/auth/login.js', params: {} };
  if (pathname === '/api/auth/register') return { file: './api/auth/register.js', params: {} };
  if (pathname === '/api/auth/me') return { file: './api/auth/me.js', params: {} };

  // Dashboard & Reports
  if (pathname === '/api/dashboard/stats') return { file: './api/dashboard/stats.js', params: {} };
  if (pathname === '/api/attendance/report') return { file: './api/attendance/report.js', params: {} };
  if (pathname === '/api/attendance') return { file: './api/attendance/index.js', params: {} };

  // Students
  const studentMatch = pathname.match(/^\/api\/students\/([^/]+)$/);
  if (studentMatch) return { file: './api/students/[id].js', params: { id: studentMatch[1] } };
  if (pathname === '/api/students') return { file: './api/students/index.js', params: {} };

  // Teachers
  const teacherMatch = pathname.match(/^\/api\/teachers\/([^/]+)$/);
  if (teacherMatch) return { file: './api/teachers/[id].js', params: { id: teacherMatch[1] } };
  if (pathname === '/api/teachers') return { file: './api/teachers/index.js', params: {} };

  // Classes
  const classMatch = pathname.match(/^\/api\/classes\/([^/]+)$/);
  if (classMatch) return { file: './api/classes/[id].js', params: { id: classMatch[1] } };
  if (pathname === '/api/classes') return { file: './api/classes/index.js', params: {} };

  // Fees
  const feeMatch = pathname.match(/^\/api\/fees\/([^/]+)$/);
  if (feeMatch) return { file: './api/fees/[id].js', params: { id: feeMatch[1] } };
  if (pathname === '/api/fees') return { file: './api/fees/index.js', params: {} };

  return null;
}

const apiDevServerPlugin = (env) => ({
  name: 'api-dev-server',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      // Only intercept requests starting with /api
      if (!req.url || !req.url.startsWith('/api')) {
        return next();
      }

      // Ensure env variables are in process.env
      for (const [key, val] of Object.entries(env)) {
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }

      const urlObj = new URL(req.url, 'http://localhost:5173');
      const route = matchApiRoute(urlObj.pathname);

      if (!route) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: `API route not found: ${urlObj.pathname}` }));
      }

      // Read body using traditional stream events
      let body = {};
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        try {
          const raw = await new Promise((resolve, reject) => {
            let buffer = '';
            req.on('data', (chunk) => {
              buffer += chunk;
            });
            req.on('end', () => resolve(buffer));
            req.on('error', (err) => reject(err));
          });

          if (raw && raw.trim()) {
            body = JSON.parse(raw);
          }
        } catch {
          body = {};
        }
      }

      // Populate Express/Vercel compatibility helpers
      req.body = body;
      req.query = {
        ...Object.fromEntries(urlObj.searchParams.entries()),
        ...route.params,
      };

      res.status = function (code) {
        res.statusCode = code;
        return res;
      };

      res.json = function (payload) {
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'application/json');
        }
        res.end(JSON.stringify(payload));
        return res;
      };

      try {
        const filePath = path.resolve(process.cwd(), route.file);
        const fileUrl = pathToFileURL(filePath).href;
        const mod = await import(/* @vite-ignore */ fileUrl);
        const handler = mod.default || mod;
        await handler(req, res);
      } catch (err) {
        console.error('API Error in dev server:', err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
        }
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  for (const [key, val] of Object.entries(env)) {
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }

  return {
    plugins: [react(), apiDevServerPlugin(env)],
    server: {
      port: 5173,
      open: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
