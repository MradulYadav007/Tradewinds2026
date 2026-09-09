import { site } from './content';
/** Both React Router and pre-rendering use these same route paths. */
export const routes = [
  { path: '/', title: `${site.name} ${site.year} — IIFT Delhi Business Conclave`, description: site.description },
  { path: '/viewallevents', title: `Events — ${site.name}`, description: site.pages.events.description },
  { path: '/viewallspeakers', title: `Speakers — ${site.name}`, description: site.pages.speakers.description },
  { path: '/viewallclubs', title: `Clubs — ${site.name}`, description: site.pages.clubs.description },
  { path: '/calendar', title: `Calendar — ${site.name}`, description: site.pages.calendar.description },
  { path: '/registernow', title: `Register — ${site.name}`, description: site.registration.description },
];
