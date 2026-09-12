import { site, events, speakers, clubs, schedule } from '../content';
import { PageHeading } from '../components/Layout';
import { EventCard, SpeakerCard, ClubCard } from '../components/Cards';

export function EventsPage() { return <div className="page-shell section-space"><PageHeading {...site.pages.events} /><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{events.map(event => <EventCard key={event.id} event={event} />)}</div></div>; }
export function SpeakersPage() { return <div className="page-shell section-space"><PageHeading {...site.pages.speakers} /><div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">{speakers.map(speaker => <SpeakerCard key={speaker.id} speaker={speaker} />)}</div>{site.pages.speakers.notice && <p className="mt-12 max-w-2xl border-t border-line pt-6 text-base leading-relaxed text-muted">{site.pages.speakers.notice}</p>}</div>; }
export function ClubsPage() { return <div className="page-shell section-space"><PageHeading {...site.pages.clubs} /><div className="grid gap-6 md:grid-cols-2">{clubs.map((club, index) => <ClubCard key={club.id} club={club} index={index} />)}</div></div>; }
export function CalendarPage() { return <div className="page-shell section-space"><PageHeading {...site.pages.calendar} /><div className="divide-y divide-line border-y border-line"><div className="grid gap-3 py-14 text-center"><span className="font-display text-4xl font-black tracking-tight">COMING SOON</span></div></div></div>; }
export function NotFoundPage() { return <div className="page-shell section-space"><PageHeading eyebrow="404" title="PAGE NOT FOUND." description="This page is not available. Return to Trade Winds to explore the events." /></div>; }
