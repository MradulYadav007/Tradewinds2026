# Editing content and media

You can edit these JSON files in GitHub with the pencil icon, commit the change, and let Vercel redeploy. JSON needs double quotes and cannot contain comments or trailing commas. Run `npm run check` locally, or review the GitHub check results, before deploying changes.

## Add an event

Duplicate an object in `src/content/events.json`, then change its values:

```json
{
  "id": "new-event",
  "name": "NEW EVENT",
  "category": "BUSINESS",
  "organizer": "Business Club",
  "clubId": "business-club",
  "date": "13 SEP",
  "time": "03:00 PM",
  "venue": "HALL A",
  "format": "TEAM EVENT",
  "status": "OPEN",
  "featured": true,
  "image": null,
  "registrationUrl": ""
}
```

IDs must be unique lowercase words separated by hyphens. `clubId` must match a club ID, or be `null` for an organizer not listed in the club directory. The example time is illustrative; replace it with confirmed event information.

Set `featured` to `false` to remove it from the homepage. Add as many events as you need; cards and registration options come from this array. Set `registrationUrl` to a live HTTPS form URL when available. The draft page is the fallback.

## Add an image

Upload `speaker-v1.webp` to `public/media/`. Replace a speaker's `image: null` with:

```json
"image": {
  "type": "image",
  "src": "/media/Mradul_Yadav.jpeg",
  "alt": "Mradul Yadav",
  "width": 800,
  "height": 880
}
```

The same object format works in event `image`, club `logo`, and `site.heroMedia`. Use the real file dimensions; they reserve layout space while the image loads. Supply meaningful alt text. A `null` image keeps the current typography or placeholder treatment.

To use an externally hosted image, replace `src` with a full HTTPS media URL. If an image service supplies several sizes, you can add:

```json
"sources": [
  { "src": "/media/speaker-400.webp", "width": 400 },
  { "src": "/media/speaker-800.webp", "width": 800 }
]
```

Upload every referenced file. The browser chooses a source using `srcSet`. The built-in `sizes` value assumes card-like images; adapt `Media.tsx` if you add a different full-width layout.

## Add a video

Set `site.heroMedia` to a video object (or use the same object in a card's image field):

```json
{
  "type": "video",
  "src": "https://YOUR-CDN.example.com/media/conclave.mp4",
  "alt": "Trade Winds introduction",
  "width": 1280,
  "height": 720,
  "poster": "/media/conclave-poster.webp"
}
```

Replace the example URL with your actual public media URL, and upload the poster. Videos use native playback controls, play inline, and do not autoplay. Large files are better hosted by a media provider than committed to GitHub. Add caption tracks in `Media.tsx` when publishing video with spoken content.

## Other content

- Speakers: edit `speakers.json`; `bio` is optional text (use `""` to omit it). Remove `pages.speakers.notice` text in `site.json` when the confirmed lineup is complete.
- Clubs: edit `clubs.json`. Events are associated by `clubId`.
- Calendar: edit `schedule.json`; array order controls display order. The homepage shows the first four items.
- FAQs: edit `faqs.json`; the answer expands using native, keyboard-accessible disclosure controls.
- Sponsors: edit `sponsors.json`; add sponsor names within the tier's `names` array.
- Footer, hero and section copy: edit `site.json`.

## Confirm dates in one editing pass

The reference has October dates. Update the hero date, poster date/month, footer description, all event dates, the schedule, and the FAQ deadline together. Clear `dateNotice` once resolved. These fields remain separate because they use different display formats.

For a live countdown, change:

```json
"target": "2026-10-08T23:59:00+05:30"
```

That timestamp is an example, not a confirmed deadline. Include a timezone offset or `Z`. The countdown stops at zero and uses `closedLabel` after expiry.

## Deploy changes

Changes to JSON, local media, or Tailwind require a build. Push to the GitHub branch connected to Vercel; it rebuilds and publishes according to your Vercel project settings. Changing a `VITE_` environment variable also requires a redeployment.
