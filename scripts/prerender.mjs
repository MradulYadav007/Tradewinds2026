import { mkdir, readFile, writeFile, rm, access } from 'node:fs/promises';
import { render, routes, siteOrigin, validateContent, mediaReferences } from '../.prerender/entry-server.js';

validateContent();
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const template = await readFile('dist/index.html', 'utf8');
let origin = siteOrigin.replace(/\/$/, '');
if (origin && (new URL(origin).protocol !== 'https:' || new URL(origin).origin !== origin)) throw new Error('VITE_SITE_URL must be an HTTPS origin, e.g. https://example.com');
for (const route of [...routes, { path: '/404', title: 'Page not found — Trade Winds', description: 'This page is not available.' }]) {
  const markup = render(route.path);
  for (const match of markup.matchAll(/(?:src|poster)="(\/media\/[^"?]+)"/g)) await access(`public${match[1]}`);
  const canonical = origin && route.path !== '/404' ? `<link rel="canonical" href="${escape(origin + route.path)}" />` : '';
  const html = template.replace('<div id="root"></div>', `<div id="root">${markup}</div>`).replace(/<title>.*?<\/title>/, `<title>${escape(route.title)}</title>`).replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/, `$1${escape(route.description)}$2`).replace('</head>', `${canonical}${route.path === '/404' ? '<meta name="robots" content="noindex" />' : ''}</head>`);
  const directory = route.path === '/' || route.path === '/404' ? 'dist' : `dist${route.path}`;
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/${route.path === '/404' ? '404.html' : 'index.html'}`, html);
}
if (origin) await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route => `<url><loc>${escape(origin + route.path)}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''}`);
await rm('.prerender', { recursive: true });
console.log(`Pre-rendered ${routes.length} pages and a 404 page. Output: dist/`);
