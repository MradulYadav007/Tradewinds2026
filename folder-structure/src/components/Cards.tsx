import { Link } from 'react-router-dom';
import type { Event, Speaker, Club } from '../content/types';
import { registrationHref } from '../lib/registration';
import { events } from '../content';
import { Media } from './Media';
import { ActionLink } from './Layout';

export function EventCard({ event }: { event: Event }) {
  return <article className="flex min-w-0 flex-col items-start gap-5 border border-line p-6 md:p-7">
    {event.image && <Media media={event.image} className="aspect-video w-full object-cover" />}
    <p className="eyebrow">{event.category}</p>
    <h3 className="font-display text-4xl leading-tight font-black tracking-tight">{event.name}</h3>
    <p className="text-base leading-relaxed text-muted">{event.organizer} · {event.date} · {event.time}</p>
    <p className="w-full border-t border-line pt-4 text-sm leading-relaxed text-muted">{event.venue} · {event.format} · {event.status}</p>
    <div className="mt-auto"><ActionLink href={registrationHref(event)}>Register</ActionLink></div>
  </article>;
}

export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return <article className="min-w-0">
    {speaker.image ? <Media media={speaker.image} className="aspect-[1/1.1] w-full object-cover" /> : <div className="flex aspect-[1/1.1] items-end border border-line bg-linear-to-br from-poster to-canvas p-6" aria-hidden="true"><span className="font-display text-6xl font-black">{speaker.name.split(' ').map(word => word[0]).slice(0, 2).join('')}</span></div>}
    <h3 className="mt-5 font-display text-3xl font-black">{speaker.name}</h3><p className="mt-2 text-base text-muted">{speaker.role}</p>{speaker.bio && <p className="mt-4 leading-relaxed text-muted">{speaker.bio}</p>}
  </article>;
}

export function ClubCard({ club, index }: { club: Club; index: number }) {
  const hostedEvents = events.filter(event => event.clubId === club.id);
  return <article className="flex flex-col items-start gap-5 border border-line p-7">
    {club.logo ? <Media media={club.logo} className="size-20 object-contain" /> : <span className="font-display text-5xl font-black text-brand">{String(index + 1).padStart(2, '0')}</span>}
    <h2 className="font-display text-4xl font-black">{club.name}</h2><p className="text-base text-muted">{club.description}</p>
    {hostedEvents.map(event => <div key={event.id} className="mt-auto"><p className="mb-4 text-sm text-muted">{event.date} · {event.time}</p><Link className="text-link" to={`/registernow?event=${event.id}`}>Explore registration →</Link></div>)}
  </article>;
}
