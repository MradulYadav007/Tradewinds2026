import siteData from './site.json';
import eventData from './events.json';
import speakerData from './speakers.json';
import clubData from './clubs.json';
import type { Event, Speaker, Club, MediaAsset } from './types';
import { AnyAaaaRecord } from 'dns';

export const site:any = siteData;
export const events: Event[] = eventData;
export const speakers: any = speakerData;
export const clubs: Club[] = clubData;
export { default as schedule } from './schedule.json';
export { default as faqs } from './faqs.json';
export { default as sponsors } from './sponsors.json';
