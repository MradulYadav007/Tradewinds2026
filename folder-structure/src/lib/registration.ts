import { site } from '../content';
import type { Event } from '../content/types';
export function registrationHref(event?: Event): string {
  return event?.registrationUrl || site.registration.externalUrl || (event ? `/registernow?event=${encodeURIComponent(event.id)}` : '/registernow');
}
export function registrationDraft(data: { name: string; email: string; institution: string; event: string; team: string }): string {
  return [`${site.name} ${site.year} — REGISTRATION DRAFT`, 'This draft has not been submitted to the organizers.', '', `Name: ${data.name}`, `Email: ${data.email}`, `Institution: ${data.institution}`, `Event: ${data.event}`, `Team: ${data.team}`].join('\n');
}
