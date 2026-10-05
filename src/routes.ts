import { site } from './content';
/** Both React Router and pre-rendering use these same route paths. `noindex` pages stay out of search and the sitemap. */
export const routes: { path: string; title: string; description: string; noindex?: boolean }[] = [
  { path: '/', title: `${site.name} ${site.year} — IIFT Delhi Business Conclave`, description: site.description },
  { path: '/viewallevents', title: `Events — ${site.name}`, description: site.pages.events.description },
  { path: '/viewallspeakers', title: `Speakers — ${site.name}`, description: site.pages.speakers.description },
  { path: '/viewallclubs', title: `Clubs — ${site.name}`, description: site.pages.clubs.description },
  { path: '/calendar', title: `Calendar — ${site.name}`, description: site.pages.calendar.description },
  { path: '/registernow', title: `Register — ${site.name}`, description: site.registration.description },
  { path: '/scoreboard', title: `Scoreboard — ${site.name}`, description: 'Live scores for all 18 competing teams.' },
  { path: '/scoreboard/admin', title: `Edit Scoreboard — ${site.name}`, description: 'Organizer-only scoreboard editor.', noindex: true },
];
