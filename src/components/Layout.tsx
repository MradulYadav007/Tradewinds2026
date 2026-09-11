import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { site } from '../content';
import { registrationHref } from '../lib/registration';
import { Media } from './Media';
import { Countdown } from './Countdown';

export function ActionLink({ href, children, className = 'button-primary' }: { href: string; children: ReactNode; className?: string }) {
  return href.startsWith('https://') ? <a href={href} className={className}>{children}</a> : <Link to={href} className={className}>{children}</Link>;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  return <header className="page-shell">
     {/* Countdown */}
          <Countdown />
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-canvas focus:p-4">Skip to content</a>
    <div className="relative flex min-h-28 flex-wrap items-center justify-between gap-5 border-b border-line py-5 xl:min-h-[136px]">
      <Link to="/" className="flex items-center gap-4 md:gap-9" aria-label={`${site.name} home`}>
        <Media media={site.logo} priority className="size-14 shrink-0 object-contain md:size-[91px]" />
        <span className="font-display text-3xl leading-none font-black tracking-tight md:text-[40px]">{site.name}</span>
      </Link>
      <button className="rounded-button border border-line px-3 py-2 text-sm font-semibold xl:hidden" aria-controls="site-navigation" aria-expanded={open} onClick={() => setOpen(!open)} onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>{open ? 'Close' : 'Menu'}</button>
      <nav id="site-navigation" aria-label="Main navigation" className={`${open ? 'flex' : 'hidden'} w-full flex-wrap items-center gap-x-5 gap-y-6 py-3 xl:flex xl:w-auto xl:py-0`}>
        {site.navigation.map(item => <Link key={item.href} to={item.href} onClick={() => setOpen(false)} aria-current={pathname === item.href ? 'page' : undefined} className="text-sm font-semibold tracking-wide hover:text-brand aria-[current=page]:text-brand">{item.label}</Link>)}
        <span onClick={() => setOpen(false)}><ActionLink href={registrationHref()}>Register now</ActionLink></span>
      </nav>
    </div>
  </header>;
}

export function Footer() {
  return <footer id="about" className="page-shell">
    <div className="grid gap-8 border-t border-line py-12 md:grid-cols-[1.2fr_1fr]">
      <div><p className="font-display text-3xl font-black">{site.footer.brand}</p><p className="mt-3 max-w-sm text-base leading-relaxed text-muted">{site.footer.description}</p></div>
      <nav aria-label="Footer navigation" className="flex flex-wrap content-start items-start gap-x-7 gap-y-4 md:justify-end">{site.navigation.map(item => <Link key={item.href} to={item.href} className="text-link">{item.label}</Link>)}</nav>
      <p className="text-sm text-muted">© {site.year} {site.name}</p>
    </div>
  </footer>;
}

export function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mb-12"><Link to="/" className="text-link mb-10 inline-block">← Back to Trade Winds</Link><p className="eyebrow mb-6">{eyebrow}</p><h1 className="display-title max-w-4xl lg:text-7xl">{title}</h1><p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted">{description}</p></div>;
}

export function SectionHeading({ eyebrow, title, href, linkText }: { eyebrow: string; title?: string; href?: string; linkText?: string }) {
  return <div className="mb-10 flex flex-wrap items-end justify-between gap-6"><div><p className="eyebrow mb-5">{eyebrow}</p>{title && <h2 className="display-title max-w-3xl">{title}</h2>}</div>{href && <Link to={href} className="text-link">{linkText} →</Link>}</div>;
}

export function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
      else { window.scrollTo(0, 0); document.getElementById('main-content')?.focus({ preventScroll: true }); }
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
}
