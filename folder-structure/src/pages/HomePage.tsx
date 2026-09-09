import { Link } from 'react-router-dom';
import {
  site,
  events,
  speakers,
  clubs,
  schedule,
  sponsors,
  faqs,
} from '../content';
import { ActionLink, SectionHeading } from '../components/Layout';
import { Media } from '../components/Media';
import { EventCard, SpeakerCard } from '../components/Cards';
import { Countdown } from '../components/Countdown';
import { registrationHref } from '../lib/registration';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="page-shell grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.45fr_1fr] lg:gap-20">
        <div>
          <p className="eyebrow mb-7">{site.tagline}</p>

          <h1 className="font-display text-7xl leading-none font-black tracking-tight md:text-[80px]">
            {site.name}
          </h1>

          <h2 className="mt-8 text-xl leading-snug font-bold">
            {site.theme}
          </h2>

          <p className="mt-8 max-w-xl text-base leading-relaxed text-muted">
            {site.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm">
            <strong>{site.heroDates}</strong>
            <span>{site.venue}</span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ActionLink href={registrationHref()}>
              Register now
            </ActionLink>

            <Link to="/viewallevents" className="text-link">
              Explore events
            </Link>
          </div>
        </div>

        <div className="relative flex min-h-[420px] flex-col justify-end overflow-hidden border border-line bg-linear-to-br from-poster via-canvas to-poster p-6 md:min-h-[460px]">
          {site.heroMedia && (
            <Media
              media={site.heroMedia}
              priority
              className={
                site.heroMedia.type === 'video'
                  ? 'mb-6 w-full object-cover'
                  : 'absolute inset-0 h-full w-full object-cover'
              }
            />
          )}

          <div
            className={`relative ${
              site.heroMedia?.type === 'image'
                ? 'bg-canvas/95 p-4'
                : ''
            }`}
          >
            <p className="font-display text-6xl leading-[.88] font-black tracking-tight">
              {site.posterDates}
              <br />
              {site.posterMonth}
            </p>

            <p className="mt-4 text-xs font-bold tracking-wider">
              {site.posterTagline}
            </p>
          </div>
        </div>
      </section>

      {/* Countdown */}
      <Countdown />

      {/* Benefits */}
      <section className="page-shell section-space">
        <SectionHeading {...site.sections.benefits} />

        <div className="grid gap-10 md:grid-cols-3">
          {site.benefits.map((benefit, index) => (
            <article key={benefit.title}>
              <span className="font-display text-4xl font-black text-brand">
                {String(index + 1).padStart(2, '0')}
              </span>

              <h3 className="mt-5 font-display text-3xl font-black">
                {benefit.title}
              </h3>

              <p className="mt-4 text-base leading-relaxed text-muted">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Events */}
      <section
        id="events"
        className="border-y border-line bg-surface/40"
      >
        <div className="page-shell section-space">
          <SectionHeading
            {...site.sections.events}
            href="/viewallevents"
            linkText="View all events"
          />

          <div className="grid gap-6 md:grid-cols-3">
            {events
              .filter((event) => event.featured)
              .map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="page-shell section-space">
        <SectionHeading {...site.sections.schedule} />

        <div className="divide-y divide-line border-y border-line">
          {schedule.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="grid gap-3 py-6 text-sm md:grid-cols-[1fr_1.3fr_1fr] md:items-center"
            >
              <span className="text-muted">
                {item.date} · {item.time}
              </span>

              <strong>{item.title}</strong>

              <span className="text-muted md:text-right">
                {item.venue}
              </span>
            </div>
          ))}
        </div>

        <Link
          className="text-link mt-8 inline-block"
          to="/calendar"
        >
          View full calendar →
        </Link>
      </section>

      {/* Speakers */}
      <section id="speakers" className="border-y border-line">
        <div className="page-shell section-space">
          <SectionHeading
            {...site.sections.speakers}
            href="/viewallspeakers"
            linkText="View all speakers"
          />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {speakers
              .filter((speaker) => speaker.featured)
              .map((speaker) => (
                <SpeakerCard
                  key={speaker.id}
                  speaker={speaker}
                />
              ))}
          </div>
        </div>
      </section>

      {/* Clubs */}
      <section id="clubs" className="page-shell section-space">
        <SectionHeading eyebrow={site.sections.clubs.eyebrow} />

        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {clubs.map((club) => (
            <Link
              to="/viewallclubs"
              key={club.id}
              className="flex min-h-32 items-center justify-center border border-line p-5 text-center font-display text-3xl font-black hover:bg-surface"
            >
              {club.logo ? (
                <Media
                  media={club.logo}
                  className="size-20 object-contain"
                />
              ) : (
                club.name
              )}
            </Link>
          ))}
        </div>

        <Link
          className="text-link mt-8 inline-block"
          to="/viewallclubs"
        >
          View all clubs →
        </Link>
      </section>

      {/* Sponsors */}
      <section
        id="sponsors"
        className="border-y border-line bg-surface/40"
      >
        <div className="page-shell section-space">
          <SectionHeading {...site.sections.sponsors} />

          <div className="space-y-7">
            {sponsors.map((sponsor) => (
              <p
                key={sponsor.id}
                className="text-base font-semibold md:text-lg"
              >
                <span className="text-muted">
                  {sponsor.tier} ·{' '}
                </span>

                {sponsor.names.join(' / ')}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="page-shell section-space">
        <SectionHeading {...site.sections.faq} />

        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.id}
              className="rounded-button border border-line bg-surface p-5"
            >
              <summary className="text-base font-semibold">
                {faq.question}
              </summary>

              <p className="mt-4 text-base leading-relaxed text-muted">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-line">
        <div className="page-shell flex flex-wrap items-center justify-between gap-8 py-14">
          <div>
            <h2 className="font-display text-4xl font-black">
              {site.finalCta.title}
            </h2>

            <p className="mt-4 text-base text-muted">
              {site.finalCta.description}
            </p>
          </div>

          <ActionLink href={registrationHref()}>
            Register now
          </ActionLink>
        </div>
      </section>
    </>
  );
}