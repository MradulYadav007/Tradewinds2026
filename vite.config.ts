import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Vercel runs api/*.ts as server functions in production. `vite dev` would otherwise serve
 * those files as browser modules, so run the scoreboard function locally instead.
 * Put the database and password variables in .env.local (e.g. with `vercel env pull .env.local`).
 */
function localApi(): Plugin {
  return {
    name: 'local-vercel-api',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''));
      server.middlewares.use('/api/scoreboard', async (req, res) => {
        try {
          const handlers = await server.ssrLoadModule('/api/scoreboard.ts');
          const handler = handlers[req.method || 'GET'];
          if (typeof handler !== 'function') { res.statusCode = 405; res.end(); return; }
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(key, value);
          const response: Response = await handler(new Request(`http://${req.headers.host}${req.originalUrl}`, { method: req.method, headers, body: chunks.length ? Buffer.concat(chunks) : undefined }));
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await response.text());
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: (error as Error).message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localApi()],
  build: { sourcemap: false },
});
