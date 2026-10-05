import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Vercel runs api/*.ts as server functions in production. `vite dev` would otherwise serve
 * those files as browser modules, so run the scoreboard function locally instead.
 * Put the database and password variables in .env.local (e.g. with `vercel env pull .env.local`).
 */
/**
 * Reads .env.local, including files Windows tools saved as UTF-16 (e.g. PowerShell's `echo ... > .env.local`),
 * which Vite's own loader cannot parse. Returns the variables and a short description for diagnostics.
 */
export function readEnvLocal(dir: string): { vars: Record<string, string>; description: string } {
  const path = join(dir, '.env.local');
  if (!existsSync(path)) return { vars: {}, description: '.env.local not found' };
  const bytes = readFileSync(path);
  const utf16 = (bytes[0] === 0xff && bytes[1] === 0xfe) || bytes.subarray(0, 64).includes(0);
  const text = bytes.toString(utf16 ? 'utf16le' : 'utf8').replace(/^\uFEFF/, '');
  const vars: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (match) vars[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  const names = Object.keys(vars);
  return { vars, description: `.env.local found${utf16 ? ' (UTF-16, converted)' : ''} with ${names.length ? names.join(', ') : 'no settings — check it is saved and each line looks like NAME=value'}` };
}

function localApi(): Plugin {
  return {
    name: 'local-vercel-api',
    configureServer(server) {
      const envDir = typeof server.config.envDir === 'string' ? server.config.envDir : server.config.root;
      const envLocal = readEnvLocal(envDir);
      Object.assign(process.env, loadEnv(server.config.mode, envDir, ''), envLocal.vars, { SCOREBOARD_ENV_DIR: envDir, SCOREBOARD_ENV_FILE: envLocal.description });
      const misnamed = readdirSync(envDir).filter(file => /^\.?env/i.test(file) && !/^\.env(\.(development|production|test))?(\.local)?$|^\.env\.example$/.test(file));
      const status = (name: string) => `${name} ${process.env[name] ? 'set' : 'MISSING'}`;
      server.config.logger.info(`  Scoreboard: ${envLocal.description}. Settings from ${envDir}: ${['SCOREBOARD_ADMIN_PASSWORD', 'KV_REST_API_URL', 'KV_REST_API_TOKEN'].map(status).join(', ')}`);
      if (misnamed.length) server.config.logger.warn(`  Rename ${misnamed.join(', ')} to .env.local so the scoreboard can read it.`);
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
