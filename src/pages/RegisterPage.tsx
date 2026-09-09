import { useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { events, site } from '../content';
import { ActionLink, PageHeading } from '../components/Layout';
import { registrationDraft } from '../lib/registration';

export default function RegisterPage() {
  const [params] = useSearchParams();
  const requested = params.get('event') || '';
  const [status, setStatus] = useState('');
  const statusRef = useRef<HTMLParagraphElement>(null);
  const selected = events.find(event => event.id === requested);

  function downloadDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const choice = events.find(item => item.id === data.get('event'));
    if (!choice) return;
    const draft = registrationDraft({ name: String(data.get('name')).trim(), email: String(data.get('email')).trim(), institution: String(data.get('institution')).trim(), event: choice.name, team: String(data.get('team') || '').trim() });
    const url = URL.createObjectURL(new Blob([draft], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'tradewinds-registration-draft.txt';
    document.body.append(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Your registration draft has been downloaded. It has not been submitted to the organizers.');
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  const external = selected?.registrationUrl || site.registration.externalUrl;
  return <div className="page-shell section-space"><PageHeading eyebrow="READY TO PARTICIPATE?" title={site.registration.title} description={site.registration.description} />
    <div className="grid items-start gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
      {external ? <div className="border border-line p-8"><h2 className="font-display text-3xl font-black">COMPLETE YOUR REGISTRATION.</h2><p className="my-6 text-base leading-relaxed text-muted">Continue to the registration service to submit your details.</p><ActionLink href={external}>Continue to registration</ActionLink></div> : <form key={requested} onSubmit={downloadDraft} className="grid grid-cols-1 gap-6 border border-line p-6 sm:grid-cols-2 md:p-8">
        <label className="grid gap-2 text-sm font-semibold">Full name<input className="input-field" name="name" autoComplete="name" required maxLength={120} /></label>
        <label className="grid gap-2 text-sm font-semibold">Email address<input className="input-field" name="email" type="email" autoComplete="email" required maxLength={160} /></label>
        <label className="grid gap-2 text-sm font-semibold sm:col-span-2">College / institution<input className="input-field" name="institution" autoComplete="organization" required maxLength={180} /></label>
        <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Choose an event<select name="event" className="input-field" required defaultValue={selected?.id || ''}><option value="">Select an event</option>{events.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Team name (optional)<input className="input-field" name="team" maxLength={100} /></label>
        <p className="text-sm leading-relaxed text-muted sm:col-span-2">{site.registration.draftNotice}</p>
        <button type="submit" className="button-primary sm:col-span-2">Download registration draft</button>
        <p ref={statusRef} tabIndex={-1} role="status" className="text-base leading-relaxed sm:col-span-2">{status}</p>
      </form>}
      <aside className="space-y-7"><div className="border-b border-line pb-7"><p className="eyebrow">VENUE</p><h2 className="mt-4 font-display text-4xl font-black">{site.venue}</h2></div><div className="border-b border-line pb-7"><p className="eyebrow">EVENT DATES</p><p className="mt-4 font-display text-3xl font-black">{site.heroDates}</p>{site.dateNotice && <p className="mt-4 text-base leading-relaxed text-muted">{site.dateNotice}</p>}</div><div><h2 className="font-display text-3xl font-black">WHO CAN PARTICIPATE?</h2><p className="mt-4 text-base leading-relaxed text-muted">{site.registration.eligibility}</p></div></aside>
    </div>
  </div>;
}
