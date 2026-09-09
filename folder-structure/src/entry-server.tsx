import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { site, events, speakers, clubs } from './content';
import { mediaUrl } from './lib/media';
export { routes } from './routes';
export { validateContent } from './lib/validate-content';
export const siteOrigin: string = import.meta.env.VITE_SITE_URL || '';
export const mediaReferences = [site.logo, site.heroMedia, ...events.map(event => event.image), ...speakers.map(speaker => speaker.image), ...clubs.map(club => club.logo)]
  .flatMap(asset => asset ? [asset.src, ...(asset.poster ? [asset.poster] : []), ...(asset.sources || []).map(source => source.src)] : []).map(src => mediaUrl(src));
export function render(path: string) {
  return renderToString(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
}
