/**
 * Vercel Function: GET /api/scoreboard (public) and PUT /api/scoreboard (organizers only).
 * Data lives in one key of an Upstash Redis database connected through the Vercel Marketplace,
 * which sets KV_REST_API_URL/KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN).
 * Organizers send SCOREBOARD_ADMIN_PASSWORD as a Bearer token.
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import { defaultScoreboard, parseScoreboard } from '../src/lib/scoreboard.js';

const KEY = 'tradewinds:scoreboard';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

type Env = Record<string, string | undefined>;
const PASSWORD_VAR = 'SCOREBOARD_ADMIN_PASSWORD';

/** Where this code runs, and which settings it can see (only whether they are set, never their values). */
export function settingsReport(env: Env = process.env) {
  let database = 'missing';
  try { databaseConfig(env); database = 'set'; } catch { /* reported as missing */ }
  const runningOn = env.VERCEL
    ? `Vercel ${env.VERCEL_ENV || ''} deployment${env.VERCEL_GIT_COMMIT_REF ? ` of branch ${env.VERCEL_GIT_COMMIT_REF}` : ''}`.replace('  ', ' ')
    : `local dev server, reading settings from ${env.SCOREBOARD_ENV_DIR || 'the project folder'}`;
  const otherDatabaseVariables = Object.keys(env).filter(key => /KV_|REDIS|UPSTASH/.test(key)).sort();
  return { runningOn, [PASSWORD_VAR]: env[PASSWORD_VAR] ? 'set' : 'missing', 'KV_REST_API_URL + KV_REST_API_TOKEN': database, ...(database === 'missing' && otherDatabaseVariables.length ? { otherDatabaseVariables } : {}) };
}

function fixHint(env: Env): string {
  if (env.VERCEL) {
    const environment = env.VERCEL_ENV === 'production' ? 'Production' : env.VERCEL_ENV === 'preview' ? 'Preview' : 'Development';
    return `Fix: in Vercel, open this same project → Settings → Environment Variables, make sure each variable is enabled for "${environment}", then Deployments → ⋯ → Redeploy.`;
  }
  return `Fix: put the variables in a file named exactly ".env.local" (not ".env.local.txt") in ${env.SCOREBOARD_ENV_DIR || 'the folder that contains package.json'}, then stop and restart npm run dev.`;
}

function notConfigured(what: string, env: Env = process.env): Response {
  return json({ error: `${what} is not set for this ${settingsReport(env).runningOn}. ${fixHint(env)}`, settings: settingsReport(env) }, 500);
}

/** Finds the Upstash REST credentials, including ones Vercel added with a custom prefix (e.g. STORAGE_KV_REST_API_URL). */
export function databaseConfig(env: Env = process.env): { url: string; token: string } {
  for (const [urlSuffix, tokenSuffix] of [['KV_REST_API_URL', 'KV_REST_API_TOKEN'], ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN']]) {
    for (const name of Object.keys(env).filter(key => key.endsWith(urlSuffix)).sort((a, b) => a.length - b.length)) {
      const url = env[name];
      const token = env[name.slice(0, -urlSuffix.length) + tokenSuffix];
      if (url && token) return { url, token };
    }
  }
  const related = Object.keys(env).filter(key => /KV_|REDIS|UPSTASH/.test(key)).sort();
  throw new Error(`Scoreboard database is not configured: KV_REST_API_URL and KV_REST_API_TOKEN are missing. ${related.length ? `Found only: ${related.join(', ')}.` : 'No database variables were found.'}`);
}

async function redis(command: (string | number)[]): Promise<unknown> {
  const { url, token } = databaseConfig();
  const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(command) });
  if (!response.ok) throw new Error(`Database request failed (${response.status})`);
  return ((await response.json()) as { result: unknown }).result;
}

export function isAuthorized(request: Request, password = process.env[PASSWORD_VAR]): boolean {
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!password || !supplied) return false;
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(supplied), digest(password));
}

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  if (params.has('check')) return json(settingsReport());
  if (params.has('auth')) {
    if (!process.env[PASSWORD_VAR]) return notConfigured(`The organizer password (${PASSWORD_VAR})`);
    return isAuthorized(request) ? json({ ok: true }) : json({ error: 'Wrong password' }, 401);
  }
  try { databaseConfig(); } catch { return notConfigured('The scoreboard database (KV_REST_API_URL and KV_REST_API_TOKEN)'); }
  try {
    const stored = await redis(['GET', KEY]);
    return json(typeof stored === 'string' ? parseScoreboard(JSON.parse(stored)) : defaultScoreboard());
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
}

export async function PUT(request: Request): Promise<Response> {
  if (!process.env[PASSWORD_VAR]) return notConfigured(`The organizer password (${PASSWORD_VAR})`);
  if (!isAuthorized(request)) return json({ error: 'Wrong password' }, 401);
  let scoreboard;
  try {
    scoreboard = parseScoreboard(await request.json());
  } catch (error) {
    return json({ error: (error as Error).message }, 400);
  }
  scoreboard.updatedAt = new Date().toISOString();
  try {
    await redis(['SET', KEY, JSON.stringify(scoreboard)]);
    return json(scoreboard);
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
}
