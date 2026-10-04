import siteData from './site.json';
import eventData from './events.json';
import speakerData from './speakers.json';
import clubData from './clubs.json';
import type { Event, Speaker, Club } from './types';

export const site:any = siteData;
export const events: Event[] = eventData as Event[];
export const speakers: Speaker[] = speakerData as Speaker[];
export const clubs: Club[] = clubData as Club[];
export { default as schedule } from './schedule.json';
export { default as faqs } from './faqs.json';
export { default as sponsors } from './sponsors.json';
