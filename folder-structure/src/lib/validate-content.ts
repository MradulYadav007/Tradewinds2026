import { site, events, speakers, clubs, schedule, sponsors, faqs } from '../content';
import { mediaUrl } from './media';

/** Build-time validation makes invalid GitHub content edits fail before deployment. */
export function validateContent() {
  for (const [name, items] of Object.entries({ events, speakers, clubs, schedule, sponsors, faqs })) {
    const ids = new Set<string>();
    for (const item of items) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || ids.has(item.id)) throw new Error(`${name}: invalid or duplicate id ${item.id}`);
      ids.add(item.id);
    }
  }
  for (const event of events) if (event.clubId && !clubs.some(club => club.id === event.clubId)) throw new Error(`${event.id}: unknown clubId ${event.clubId}`);
  for (const url of [site.registration.externalUrl, ...events.map(event => event.registrationUrl)]) {
    if (url && (new URL(url).protocol !== 'https:' || new URL(url).username || new URL(url).password)) throw new Error('Registration URLs must be HTTPS without credentials.');
  }
  for (const asset of [site.logo, site.heroMedia, ...events.map(event => event.image), ...speakers.map(speaker => speaker.image), ...clubs.map(club => club.logo)]) {
    if (!asset) continue;
    if (!['image', 'video'].includes(asset.type) || !asset.alt || !(asset.width > 0) || !(asset.height > 0)) throw new Error('Media requires type (image/video), alt, positive width and height.');
    mediaUrl(asset.src);
    if (asset.poster) mediaUrl(asset.poster);
    for (const source of asset.sources || []) { mediaUrl(source.src); if (!(source.width > 0)) throw new Error('Responsive media source needs a positive width.'); }
  }
  if (site.countdown.target && (!/(Z|[+-]\d\d:\d\d)$/.test(site.countdown.target) || !Number.isFinite(Date.parse(site.countdown.target)))) throw new Error('Use an ISO countdown date with timezone, or null to preserve the reference display.');
}
