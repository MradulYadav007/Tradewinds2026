import { useEffect, useState, type FormEvent } from 'react';
import { PageHeading } from '../components/Layout';
import { ROUND_COUNT, parseScoreboard, rankTeams, totalScore, type Scoreboard, type Slot } from '../lib/scoreboard';

const API = '/api/scoreboard';
const REFRESH_MS = 10_000;
const PASSWORD_KEY = 'scoreboard-admin-password';
const ROUND_LABELS = Array.from({ length: ROUND_COUNT }, (_, r) => `R${r + 1}`);
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap';

async function fetchScoreboard(): Promise<Scoreboard> {
  const response = await fetch(API, { cache: 'no-store' });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || `Request failed (${response.status})`);
  return parseScoreboard(body);
}

function updatedLabel(updatedAt: string | null) {
  return updatedAt ? `Last updated ${new Date(updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}` : 'No scores published yet';
}

function SlotStandings({ slot }: { slot: Slot }) {
  const winner = slot.teams.find(team => team.id === slot.winnerId);
  return <section aria-labelledby={`${slot.id}-title`} className="trade-times">
    <div className="trade-times__head">
      <h2 id={`${slot.id}-title`} className="trade-times__title">{slot.title}</h2>
      <span className="trade-times__kicker">{winner ? 'Final standings' : 'Standings'}</span>
    </div>
    {winner && <p className="trade-times__winner"><span className="trade-times__kicker">Winner</span> <strong>{winner.name}</strong></p>}
    <table className="trade-times__table">
      <thead><tr><th scope="col">#</th><th scope="col" className="text-left">Team</th>{ROUND_LABELS.map(label => <th key={label} scope="col" className="trade-times__round">{label}</th>)}<th scope="col" className="text-right">Total</th></tr></thead>
      <tbody>
        {rankTeams(slot.teams).map(({ team, total, rank }) => <tr key={team.id} className={team.id === slot.winnerId ? 'is-winner' : undefined}>
          <td><span className={`trade-times__rank ${rank === 1 ? 'is-top' : ''}`}>{rank}</span></td>
          <th scope="row" className="trade-times__team">{team.name}</th>
          {team.rounds.map((score, r) => <td key={r} className="trade-times__round">{score ?? '–'}</td>)}
          <td className="trade-times__total">{total}</td>
        </tr>)}
      </tbody>
    </table>
  </section>;
}

export function ScoreboardPage() {
  const [board, setBoard] = useState<Scoreboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load the newspaper font without holding up the scores; Georgia stands in until it arrives.
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: FONT_URL }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (document.hidden) return;
      try {
        const next = await fetchScoreboard();
        if (!cancelled) { setBoard(next); setError(''); }
      } catch {
        if (!cancelled) setError('Could not refresh the scores. Retrying automatically…');
      }
    }
    load();
    const timer = window.setInterval(load, REFRESH_MS);
    document.addEventListener('visibilitychange', load);
    return () => { cancelled = true; window.clearInterval(timer); document.removeEventListener('visibilitychange', load); };
  }, []);

  return <div className="page-shell section-space">
    <div className="mx-auto max-w-5xl">
      <div className="trade-times__masthead">
        <p className="trade-times__kicker">Live results · {board ? updatedLabel(board.updatedAt) : 'Loading scores…'}</p>
        <h1 className="trade-times__name">{board?.title || 'The Trade Times'}</h1>
        <p role="status" className="trade-times__status">{error}</p>
      </div>
      {board && <div className="grid gap-10">{board.slots.map(slot => <SlotStandings key={slot.id} slot={slot} />)}</div>}
    </div>
  </div>;
}

export function ScoreboardAdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [board, setBoard] = useState<Scoreboard | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  async function login(candidate: string) {
    setBusy(true); setStatus('');
    try {
      const response = await fetch(`${API}?auth=1`, { headers: { Authorization: `Bearer ${candidate}` }, cache: 'no-store' });
      if (!response.ok) throw new Error(response.status === 401 ? 'Wrong password.' : `Login failed (${response.status}).`);
      try { sessionStorage.setItem(PASSWORD_KEY, candidate); } catch { /* private mode: stay logged in for this page only */ }
      setPassword(candidate); setAuthed(true);
      setBoard(await fetchScoreboard()); setDirty(false);
    } catch (error) {
      setStatus((error as Error).message);
    } finally { setBusy(false); }
  }

  useEffect(() => {
    let saved = '';
    try { saved = sessionStorage.getItem(PASSWORD_KEY) || ''; } catch { /* storage unavailable */ }
    if (saved) login(saved);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function edit(change: (draft: Scoreboard) => void) {
    setBoard(current => { if (!current) return current; const draft = structuredClone(current); change(draft); return draft; });
    setDirty(true); setStatus('');
  }

  async function save() {
    if (!board) return;
    setBusy(true); setStatus('Publishing…');
    try {
      const response = await fetch(API, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` }, body: JSON.stringify(board) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Save failed (${response.status})`);
      setBoard(parseScoreboard(body)); setDirty(false);
      setStatus(`Published. ${updatedLabel(body.updatedAt)}.`);
    } catch (error) {
      setStatus(`Not saved: ${(error as Error).message}`);
    } finally { setBusy(false); }
  }

  async function reload() {
    if (dirty && !window.confirm('Discard your unpublished changes?')) return;
    setBusy(true);
    try { setBoard(await fetchScoreboard()); setDirty(false); setStatus('Loaded the latest published scores.'); }
    catch (error) { setStatus(`Could not load: ${(error as Error).message}`); }
    finally { setBusy(false); }
  }

  function logout() {
    try { sessionStorage.removeItem(PASSWORD_KEY); } catch { /* storage unavailable */ }
    setAuthed(false); setPassword(''); setBoard(null); setDirty(false); setStatus('');
  }

  if (!authed) {
    const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); login(String(new FormData(event.currentTarget).get('password') || '')); };
    return <div className="page-shell section-space">
      <PageHeading eyebrow="ORGANIZERS ONLY" title="Edit Scoreboard" description="Enter the organizer password to edit team names and scores." />
      <form onSubmit={submit} className="grid max-w-md gap-4 border border-line p-6">
        <label className="grid gap-2 text-sm font-semibold">Password<input className="input-field" name="password" type="password" autoComplete="current-password" required /></label>
        <button type="submit" className="button-primary" disabled={busy}>{busy ? 'Checking…' : 'Log in'}</button>
        <p role="status" className="text-sm text-muted">{status}</p>
      </form>
    </div>;
  }

  return <div className="page-shell section-space">
    <PageHeading eyebrow="ORGANIZERS ONLY" title="Edit Scoreboard" description="Enter round scores (leave a round blank until it is played), pick winners, then publish. The public scoreboard picks up changes within about 10 seconds." />
    <div className="sticky top-0 z-10 mb-8 flex flex-wrap items-center gap-3 border-b border-line bg-canvas py-4">
      <button type="button" className="button-primary" onClick={save} disabled={busy || !dirty || !board}>Save &amp; publish</button>
      <button type="button" className="rounded-button border border-line px-4 py-3 text-sm font-semibold" onClick={reload} disabled={busy}>Reload latest</button>
      <button type="button" className="rounded-button border border-line px-4 py-3 text-sm font-semibold" onClick={logout}>Log out</button>
      <p role="status" className="text-sm text-muted">{status || (dirty ? 'You have unpublished changes.' : board ? updatedLabel(board.updatedAt) : 'Loading…')}</p>
    </div>
    {board && <>
      <label className="mb-8 grid max-w-xl gap-2 text-sm font-semibold">Scoreboard title<input className="input-field" value={board.title} maxLength={60} onChange={event => edit(draft => { draft.title = event.target.value; })} /></label>
      <div className="grid gap-6 xl:grid-cols-3">
        {board.slots.map((slot, s) => <fieldset key={slot.id} className="min-w-0 border border-line bg-surface p-5">
          <legend className="sr-only">{slot.title}</legend>
          <label className="mb-4 grid gap-2 text-sm font-semibold">Slot name<input className="input-field" value={slot.title} maxLength={60} onChange={event => edit(draft => { draft.slots[s].title = event.target.value; })} /></label>
          <div className="grid gap-4">
            {slot.teams.map((team, t) => <div key={team.id} className="grid gap-2 border-t border-line pt-4">
              <div className="flex items-center gap-3">
                <input className="input-field" aria-label={`Team ${t + 1} name`} value={team.name} maxLength={60} onChange={event => edit(draft => { draft.slots[s].teams[t].name = event.target.value; })} />
                <span className="shrink-0 text-sm text-muted">Total <strong className="font-display text-2xl text-ink tabular-nums">{totalScore(team)}</strong></span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {team.rounds.map((score, r) => <label key={r} className="grid gap-1 text-center text-xs font-semibold text-muted">{ROUND_LABELS[r]}
                  <input className="input-field px-1 text-center tabular-nums" type="number" inputMode="decimal" aria-label={`${team.name} round ${r + 1}`} value={score ?? ''} onChange={event => edit(draft => { draft.slots[s].teams[t].rounds[r] = event.target.value === '' ? null : Number(event.target.value); })} />
                </label>)}
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="radio" name={`${slot.id}-winner`} checked={slot.winnerId === team.id} onChange={() => edit(draft => { draft.slots[s].winnerId = team.id; })} />Winner of this slot</label>
            </div>)}
            <label className="flex items-center gap-2 border-t border-line pt-4 text-sm"><input type="radio" name={`${slot.id}-winner`} checked={slot.winnerId === null} onChange={() => edit(draft => { draft.slots[s].winnerId = null; })} />No winner yet (still live)</label>
          </div>
        </fieldset>)}
      </div>
    </>}
  </div>;
}
