import { Link } from 'react-router-dom';
import type { Event, Speaker, Club } from '../content/types';
import { registrationHref } from '../lib/registration';
import { events } from '../content';
import { Media } from './Media';
import { ActionLink } from './Layout';
import { useState } from 'react';

export function EventCard({ event }: { event: Event }) {
  return <article className="flex min-w-0 flex-col items-start gap-5 border border-line p-6 md:p-7">
    {event.image && <Media media={event} className="aspect-video w-full object-cover" />}
    <p className="eyebrow">{event.category}</p>
    <h3 className="font-display text-4xl leading-tight font-black tracking-tight">{event.name}</h3>
    <p className="text-base leading-relaxed text-muted">{event.organizer} · {event.date} · {event.time}</p>
    <p className="w-full border-t border-line pt-4 text-sm leading-relaxed text-muted">{event.venue} · {event.format} · {event.status}</p>
    <div className="mt-auto"><ActionLink href={registrationHref(event)}>Register</ActionLink></div>
  </article>;
}

export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Speaker Card */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group w-full text-center"
      >
        <div className="aspect-[4/4.2] w-full overflow-hidden rounded-[26px]">
          {speaker.image ? (
            <Media
              media={speaker}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-canvas text-muted">
              No Image
            </div>
          )}
        </div>

        <h3 className="mt-6 font-display text-3xl font-black leading-tight">
          {speaker.name}
        </h3>

        <p className="mt-4 px-2 text-lg font-bold leading-snug">
          {speaker.role}
        </p>
      </button>

      {/* Speaker Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl rounded-[18px] bg-black px-8 py-10 text-white shadow-2xl md:px-16 md:py-12"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-6 top-5 text-5xl font-light leading-none text-white hover:opacity-60"
              aria-label="Close speaker details"
            >
              ×
            </button>

            {/* Speaker Image */}
            <div className="mx-auto size-48 overflow-hidden rounded-full">
              {speaker.image ? (
                <Media
                  media={speaker}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-white/50">
                  No Image
                </div>
              )}
            </div>

            {/* Speaker Details */}
            <div className="mt-8">
              <h2 className="text-2xl font-black leading-tight md:text-3xl">
                {speaker.name}
              </h2>

              <p className="mt-5 text-base leading-relaxed text-white/75 md:text-lg">
                {speaker.description}
              </p>

              {speaker.website && (
                <a
                  href={speaker.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-block text-lg text-cyan-400 underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  {speaker.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ClubCard({ club, index }: { club: Club; index: number }) {
  const hostedEvents = events.filter(event => event.clubId === club.id);
  return <article className="flex flex-col items-start gap-5 border border-line p-7">
    {club.logo ? <Media media={club} className="size-20 object-contain" /> : <span className="font-display text-5xl font-black text-brand">{String(index + 1).padStart(2, '0')}</span>}
    <h2 className="font-display text-4xl font-black">{club.name}</h2><p className="text-base text-muted">{club.description}</p>
    {hostedEvents.map(event => <div key={event.id} className="mt-auto"><p className="mb-4 text-sm text-muted">{event.date} · {event.time}</p><Link className="text-link" to={`/registernow?event=${event.id}`}>Explore registration →</Link></div>)}
  </article>;
}
