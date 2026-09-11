# Trade Winds — React website

A portable recreation of the Trade Winds site using **React 19, TypeScript, Vite 8, React Router, and Tailwind CSS 4**. All six pages are pre-rendered to HTML, then hydrated for navigation, the mobile menu, and the registration draft flow. No Framer runtime, Codex runtime, database, or hosting-specific backend is required.

## Run locally

Install Node.js 24 (or use `nvm use`), then run these commands **inside this folder**:

```sh
npm ci
npm run dev
```

Use the local URL printed by Vite. To validate and build:

```sh
npm run check
npm run preview
```

The production website is generated in `dist/`. Do not edit that directory: edit `src/` and rebuild.

## Project map

```text
src/
  content/             JSON files for copy, events, speakers, clubs, and schedules
  components/          Shared header, footer, cards, countdown, media renderer
  pages/               Home, content pages, registration
  styles/theme.css     Tailwind colour, typography, and radius tokens
  assets/              Fonts bundled with content hashes
  lib/                 CDN URL resolution, content checks, draft generation
  routes.ts            Route metadata used in rendering and page titles
  App.tsx              React route definitions
  main.tsx             Browser entry
  entry-server.tsx     Build-time rendering only; no production server
public/media/          Images and videos served by your deployment's CDN
scripts/prerender.mjs   Generates HTML pages, robots.txt, and optional sitemap
tests/                 Content, rendering, media, and countdown checks
.github/workflows/      CI checks for pushes and pull requests
vercel.json            Ready-to-import Vercel configuration
```

## Edit content without editing components

| Change | File |
| --- | --- |
| Branding, hero, dates, labels, navigation, footer, registration URL | `src/content/site.json` |
| Add or edit events | `src/content/events.json` |
| Add or edit speakers and portraits | `src/content/speakers.json` |
| Add or edit clubs and logos | `src/content/clubs.json` |
| Schedule | `src/content/schedule.json` |
| FAQ questions and answers | `src/content/faqs.json` |
| Sponsor names and tiers | `src/content/sponsors.json` |
| Colours, fonts, shared theme | `src/styles/theme.css` |

See [the content and media guide](docs/CONTENT.md) for copy-and-paste examples. The same event record appears on the homepage, events page, and registration selector. Use `featured: false` to hide an item from the homepage while keeping its full page entry.

## Put this project on GitHub

1. Create an empty repository on GitHub. Do not initialize it with another README.
2. Open a terminal **inside the `tradewinds-react` folder**, then:

```sh
git init -b main
git add .
git commit -m "Add Trade Winds React website"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the example remote with your repository's URL. The `.gitignore` excludes local dependencies, build output, and environment files. `.env.example` is safe to commit and documents the public settings.

The included GitHub Actions workflow runs tests, TypeScript checks, and a production build. If you want failed checks to block merging, enable a branch rule requiring the **check** job. Vercel's Git integration creates previews for pull requests and deploys changes from its configured production branch; configure deployment protection in Vercel if you need additional review requirements.

## Deploy on Vercel

1. In Vercel, choose **Add New → Project**, then import your GitHub repository.
2. Select **Vite**. If this folder is nested inside another repository, set the Root Directory to this folder.
3. Keep these settings (also recorded in `vercel.json`):

   - Install: `npm ci`
   - Build: `npm run build`
   - Output: `dist`
   - Node.js: `24.x`

4. Optionally set the environment variables from `.env.example`.
5. Deploy. Once you have a production domain, set `VITE_SITE_URL` to that HTTPS origin and redeploy to generate canonical links and `sitemap.xml`.

Each known route has its own HTML file, so directly opening or refreshing `/viewallevents`, `/registernow`, and the other routes works without a catch-all SPA rewrite. A generated `404.html` handles unknown routes. All backend-free output can also be served by another static host; configure that host to resolve directory index files and use `404.html` for missing pages.

See [Vercel's Vite documentation](https://vercel.com/docs/frameworks/frontend/vite) and [Vite's deployment guide](https://vite.dev/guide/static-deploy.html).

## Media and CDN

**Default:** put files in `public/media/` and reference them with `/media/filename.webp` in the content JSON. When deployed to Vercel, these files are delivered through its CDN automatically. You do not need another CDN account.

**External media:** use full HTTPS URLs from your image/video host directly in the same fields. This works with Vercel Blob public URLs, Cloudinary, or your own public CDN. Those services are optional and must be set up separately.

**One CDN for local-style paths:** set `VITE_MEDIA_BASE_URL=https://cdn.example.com`. A content URL of `/media/speaker.webp` resolves to `https://cdn.example.com/media/speaker.webp`. Upload that same path to your CDN before deploying; this project does not upload files to external services. The setting affects content media only, not bundled fonts or JavaScript.

Vite gives bundled fonts, CSS, and JavaScript content-hashed names and long immutable caching. Editable `public/media` files use revalidation in the browser and a one-hour CDN cache in the supplied Vercel configuration. For immediate replacements use a new filename, such as `speaker-v2.webp`, and update the content record. Prefer external hosting for large videos so they do not grow your Git repository.

CDN delivery is not automatic image resizing: supply compressed files or image-service transformation URLs. The `Media` component supports optional responsive image sources and native video controls. See [Vercel CDN documentation](https://vercel.com/docs/how-vercel-cdn-works) and [Vite asset handling](https://vite.dev/guide/assets).

## Themes with Tailwind

Change the `@theme` block in `src/styles/theme.css`:

```css
@theme {
  --color-canvas: #f7f4ec;
  --color-ink: #111b31;
  --color-brand: #b89343;
  --color-brand-hover: #98732b;
  --color-muted: #606775;
  --color-line: #d4d2cc;
}
```

These create semantic utilities such as `bg-canvas`, `text-ink`, `bg-brand`, and `border-line`. Every page uses the shared tokens. Typography and button radius are controlled in the same block. There is no separate `tailwind.config.js` in this Tailwind 4 project. If you change the canvas colour, also update the browser `theme-color` meta tag in `index.html`.

See [Tailwind theme variables](https://tailwindcss.com/docs/theme).

## Registration and source content

The default form downloads an **unsubmitted registration draft**. It sends nothing to a server and stores no personal data in localStorage. To use a real registration form, set `registration.externalUrl` in `site.json`, or an individual event's `registrationUrl`, to an HTTPS registration service URL. The calls to action then link to that service. An embedded submission backend, payment handling, and confirmation emails are not included.

The published reference contains conflicting dates and some TRADEWINDS wording. Those values remain editable in the content files. Resolve them with the organizers before public launch. `site.countdown.target` is `null`, preserving the reference's static display; set an explicit ISO date with timezone to activate the countdown. Speaker data lists the one named person rather than duplicating the same person four times.

This is file-based content editing, not an admin dashboard. Updating JSON or repository media requires a new deployment, which Vercel's Git integration can trigger automatically. External CDN files can be managed through the provider's dashboard.

## Asset provenance

The logo comes from the supplied Trade Winds reference. Fonts were retained from that reference. See [asset notes](docs/ASSETS.md). This export adds no license grant for the event branding or supplied media.
