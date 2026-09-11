import { useEffect, useState } from 'react';
import { site } from '../content';

export function remainingTime(target: string, now: number): string | null {
  const end = Date.parse(target);
  if (!Number.isFinite(end)) throw new Error('countdown.target must be an ISO date with timezone.');
  const seconds = Math.max(0, Math.floor((end - now) / 1000));
  if (!seconds) return null;
  return [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60].map(value => String(value).padStart(2, '0')).join(' : ');
}

export function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  const { target, display, label, closedLabel } = site.countdown;
  useEffect(() => { if (!target) return; setNow(Date.now()); const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, [target]);
  const time = target && now !== null ? remainingTime(target, now) : display;
  return <section className="border-y border-line py-2"><div className="page-shell flex flex-wrap items-center justify-between gap-3"><p className="eyebrow">{time === null ? closedLabel : label}</p><div><p className="font-display text-3xl font-black tracking-wide tabular-nums md:text-4xl">{time === null ? '00 : 00 : 00 : 00' : time}</p><p className="mt-3 flex justify-between text-xs tracking-wider text-muted"><span>DAYS</span><span>HOURS</span><span>MINUTES</span><span>SECONDS</span></p></div></div></section>;
}
