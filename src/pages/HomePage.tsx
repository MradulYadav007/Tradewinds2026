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
import '../styles/HomePage.css';
import { useEffect, useState } from 'react';

const posterSliderImages = ['/media/1.png', '/media/2.png', '/media/3.png', '/media/4.png', '/media/5.png', '/media/6.png', '/media/7.png'];
const monthNumbers: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

function getScheduleTimestamps(item: (typeof schedule)[number], year: number): { start: number; end: number } | null {
  const dateMatch = item.date.match(/^(\d{1,2})\s+([A-Z]{3})$/i);
  if (!dateMatch) return null;

  const month = monthNumbers[dateMatch[2].toUpperCase()];
  const day = Number(dateMatch[1]);
  if (month === undefined) return null;

  const date = new Date(year, month, day);
  if (date.getMonth() !== month || date.getDate() !== day) return null;

  const timeMatch = item.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!timeMatch) return null;

  const toDateTime = (hour: string, minute: string, period: string) => {
    const time = new Date(date);
    let hours = Number(hour) % 12;
    if (period.toUpperCase() === 'PM') hours += 12;
    time.setHours(hours, Number(minute), 0, 0);
    return time;
  };

  const start = toDateTime(timeMatch[1], timeMatch[2], timeMatch[3]);
  const end = toDateTime(timeMatch[4], timeMatch[5], timeMatch[6]);
  if (end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);
  return { start: start.getTime(), end: end.getTime() };
}

export default function HomePage() {
  const [posterImageIndex, setPosterImageIndex] = useState(0);
  const now = new Date();
  const nowTimestamp = now.getTime();
  const upcomingSchedule = schedule
    .map((item, index) => ({ item, index, timestamps: getScheduleTimestamps(item, site.year) }))
    .filter(({ timestamps }) => timestamps !== null && timestamps.end > nowTimestamp)
    .sort((first, second) => first.timestamps!.start - second.timestamps!.start || first.index - second.index)
    .slice(0, 3);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPosterImageIndex((current) => (current + 1) % posterSliderImages.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="page-shell grid items-center ">
        <div>
          <p className="eyebrow header-tagline">{site.tagline}</p>

          <div className="hero-mark">
            <video
              className="hero-video greyscale"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
            >
              <source src="/media/bg.MOV" type="video/mp4" />
            </video>

            <svg
              className="mark-wide"
              viewBox="0 0 1200 200"
              preserveAspectRatio="none"
              role="img"
              aria-label="TRADE WINDS"
            >
              <defs>
                <mask id="knock">
                  <rect
                    x="-8"
                    y="-8"
                    width="1216"
                    height="203"
                    fill="#fff"
                  />
                  <text
                    x="600"
                    y="188"
                    textAnchor="middle"
                    fontSize="215"
                    textLength="1120"
                    lengthAdjust="spacingAndGlyphs"
                  >
                    TRADEWINDS'26
                  </text>
                </mask>
              </defs>

              <rect
                className="knock"
                x="-8"
                y="-8"
                width="1216"
                height="203"
                mask="url(#knock)"
              />
            </svg>

            <svg
              className="mark-stack"
              viewBox="0 0 620 430"
              preserveAspectRatio="none"
              role="img"
              aria-label="TRADE WINDS"
            >
              <defs>
                <mask id="knock2">
                  <rect
                    x="-8"
                    y="-8"
                    width="636"
                    height="446"
                    fill="#fff"
                  />
                  <text
                    x="310"
                    y="188"
                    textAnchor="middle"
                    fontSize="200"
                    textLength="580"
                    lengthAdjust="spacingAndGlyphs"
                    fill="#000"
                  >
                    TRADE
                  </text>
                  <text
                    x="310"
                    y="388"
                    textAnchor="middle"
                    fontSize="200"
                    textLength="580"
                    lengthAdjust="spacingAndGlyphs"
                    fill="#000"
                  >
                    WINDS
                  </text>
                </mask>
              </defs>

              <rect
                className="knock"
                x="-8"
                y="-8"
                width="636"
                height="446"
                mask="url(#knock2)"
              />
            </svg>
          </div>

          <h2 className="mt-4 text-xl leading-snug font-bold header-theme">
            {site.theme}
          </h2>

          <p className="mt-1 text-base leading-relaxed text-muted header-theme">
            {site.description}
          </p>

          <div className="mt-8 mb-8 flex flex-wrap items-center gap-4 header-buttons-group">
            <ActionLink href="/media/TradeWinds Brochure_2026.pdf" download="TradeWinds Brochure_2026.pdf">
              Download Brochure
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

          <div className={`poster-image-slider ${site.heroMedia?.type === 'image' ? 'bg-canvas/95 p-4' : ''}`}> 
            <div className="poster-image-viewport">
              {posterSliderImages.map((image, index) => (
                <img
                  key={image}
                  src={image}
                  alt=""
                  className={`poster-image-slide ${index === posterImageIndex ? 'poster-image-slide-active' : ''}`}
                />
              ))}
            </div>

            <div className="poster-image-overlay">
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
        </div>
      </section>

      {/* Benefits */}
      <section className="page-shell section-space">
        <SectionHeading {...site.sections.benefits} />
        <div className="grid gap-10 md:grid-cols-3">
          {site.benefits.map((benefit:any, index:any) => (
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

          <div className="overflow-hidden">
            <div className="flex gap-6 animate-event-carousel">
              {[...events.filter((event) => event.featured), ...events.filter((event) => event.featured)].map(
                (event, index) => (
                  <div
                    key={`${event.id}-${index}`}
                    className="w-[280px] shrink-0 md:w-[300px]"
                  >
                    <EventCard event={event} />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="page-shell section-space">
        <SectionHeading {...site.sections.schedule} />

        <div className="divide-y divide-line border-y border-line">
          {upcomingSchedule.length ? upcomingSchedule.map(({ item, timestamps }) => {
            const isLive = nowTimestamp >= timestamps!.start && nowTimestamp < timestamps!.end;

            return (
            <article
              key={item.id}
              className="grid gap-2 py-5 transition-colors hover:bg-surface/60 sm:grid-cols-[140px_1fr_auto] sm:items-center sm:gap-6 sm:px-4"
            >
              <span className="text-sm font-bold text-brand">{item.date} · {item.time}</span>
              <span>
                <span className="block font-display text-2xl font-black tracking-tight">{item.title}</span>
                {item.club && <span className="mt-1 block text-sm text-muted">{item.club}</span>}
              </span>
              {(item.venue || isLive) && (
                <span className="flex items-center gap-3 text-sm sm:justify-end">
                  {item.venue && <span className="text-muted">{item.venue}</span>}
                  {isLive && <span className="border border-brand px-2 py-1 font-bold text-brand">ON GOING</span>}
                </span>
              )}
            </article>
          );}) : (
            <p className="py-10 text-center text-muted">No upcoming events are currently listed.</p>
          )}
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

  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
    {speakers
      .filter((speaker:any) => speaker.featured)
      .slice(0, 5)
      .map((speaker:any) => (
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

        <div className="overflow-hidden">
          <div className="flex gap-6 animate-club-carousel">
            {[...clubs, ...clubs].map((club, index) => (
              <Link
                to="/viewallclubs"
                key={`${club.id}-${index}`}
                className="w-[180px] shrink-0 border border-line p-5 text-center font-display text-3xl font-black hover:bg-surface md:w-[120px]"
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

          <div className="sponsor-marquee" aria-label="Sponsor partners">
            <div className="sponsor-marquee-track">
              {[...sponsors, ...sponsors].map((sponsor, index) => (
                <div
                  key={`${sponsor.id}-${index}`}
                  className={`sponsor-marquee-item${sponsor.id === 'trezix' ? ' sponsor-marquee-item-title' : ''}${sponsor.id === 'kotak' ? ' sponsor-marquee-item-kotak' : ''}${sponsor.id === 'central-bank' ? ' sponsor-marquee-item-cbi' : ''}`}
                >
                  <img
                    className="sponsor-marquee-logo"
                    src={sponsor.logo}
                    alt={sponsor.name}
                  />
                  <div className="sponsor-marquee-meta">
                    <span className="sponsor-marquee-name">{sponsor.name}</span>
                    {sponsor.role && <span className="sponsor-marquee-role">{sponsor.role}</span>}
                  </div>
                </div>
              ))}
            </div>
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

      {/* Contact Us */}
      <section id="contact" className="border-y border-line bg-surface/40">
        <div className="page-shell section-space">
          <SectionHeading
            eyebrow="CONTACT US"
            title="HAVE A QUESTION?"
          />

          <div className="grid gap-8 md:grid-cols-4">
            <div className="contact-card">
              <span className="contact-icon-wrap">
                <img src="/media/contact-email.svg" alt="" className="contact-icon" />
              </span>
              <p className="contact-label">EMAIL</p>
              <a className="contact-link" href="mailto:tradewinds@iift.edu">
                tradewinds@iift.edu
              </a>
            </div>

            <div className="contact-card">
              <span className="contact-icon-wrap">
                <img src="/media/contact-phone.svg" alt="" className="contact-icon" />
              </span>
              <p className="contact-label">PHONE</p>
              <a className="contact-link" href="tel:+919306420334">
                Dr. Sargam Yadav
              </a>
              <a className="contact-link" href="tel:+919306420334">
                +91 9306420334
              </a>
            </div>

            <div className="contact-card">
              <span className="contact-icon-wrap">
                <img src="/media/contact-location.svg" alt="" className="contact-icon" />
              </span>
              <p className="contact-label">LOCATION</p>
              <p className="contact-copy">
                IIFT Delhi, India
              </p>
            </div>

            <div className="contact-card">
              <span className="contact-icon-wrap">
                <img src="/media/contact-instagram.svg" alt="" className="contact-icon" />
              </span>
              <p className="contact-label">INSTAGRAM</p>
              <a className="contact-link" href="https://instagram.com/tradewinds_iiftdelhi" target="_blank" rel="noopener noreferrer">
                @tradewinds_iiftdelhi
              </a>
            </div>
          </div>
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
