import { useEffect, useState, type FormEvent } from 'react';
import { PageHeading } from '../components/Layout';
import { parseScoreboard, rankTeams, type Scoreboard, type Slot } from '../lib/scoreboard';

const API = '/api/scoreboard';
const REFRESH_MS = 10_000;
const PASSWORD_KEY = 'scoreboard-admin-password';

async function fetchScoreboard(): Promise<Scoreboard> {
  const response = await fetch(API, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return parseScoreboard(await response.json());
}

function updatedLabel(updatedAt: string | null) {
  return updatedAt ? `Last updated ${new Date(updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}` : 'No scores published yet';
}

function SlotCard({ slot }: { slot: Slot }) {
  const ranked = rankTeams(slot.teams);
  const winner = slot.teams.find(team => team.id === slot.winnerId);
  return <section aria-labelledby={`${slot.id}-title`} className="flex flex-col border border-line bg-surface">
    <div className="flex items-center justify-between gap-4 border-b border-line p-5">
      <h2 id={`${slot.id}-title`} className="font-display text-3xl font-black uppercase">{slot.title}</h2>
      <span className={`rounded-button px-2 py-1 text-xs font-semibold tracking-widest uppercase ${winner ? 'bg-brand text-on-brand' : 'border border-brand text-brand'}`}>{winner ? 'Final' : 'Live'}</span>
    </div>
    {winner && <p className="border-b border-line bg-ink p-5 text-on-brand"><span className="eyebrow block">Winner</span><span className="mt-2 block font-display text-4xl font-black uppercase">🏆 {winner.name}</span></p>}
    <ol className="divide-y divide-line">
      {ranked.map((team, index) => <li key={team.id} className={`flex items-center gap-4 px-5 py-4 ${team.id === slot.winnerId ? 'bg-brand/15' : ''}`}>
        <span className="w-6 font-display text-2xl font-black text-muted">{index + 1}</span>
        <span className="flex-1 text-base font-semibold break-words">{team.name}</span>
        <span className="font-display text-3xl font-black tabular-nums">{team.score}</span>
      </li>)}
    </ol>
  </section>;
}

export function ScoreboardPage() {
  const [board, setBoard] = useState<Scoreboard | null>(null);
  const [error, setError] = useState('');

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
    <PageHeading eyebrow="LIVE RESULTS" title={board?.title || 'Live Scoreboard'} description="18 teams, three slots of six. The top team in each slot takes the win. Scores refresh automatically." />
    <p role="status" className="mb-6 text-sm text-muted">{error || (board ? updatedLabel(board.updatedAt) : 'Loading scores…')}</p>
    {board && <div className="grid gap-6 lg:grid-cols-3">{board.slots.map(slot => <SlotCard key={slot.id} slot={slot} />)}</div>}
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
    <PageHeading eyebrow="ORGANIZERS ONLY" title="Edit Scoreboard" description="Change names, scores, and winners, then publish. The public scoreboard picks up changes within about 10 seconds." />
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
              <input className="input-field" aria-label={`Team ${t + 1} name`} value={team.name} maxLength={60} onChange={event => edit(draft => { draft.slots[s].teams[t].name = event.target.value; })} />
              <div className="flex items-center gap-2">
                <button type="button" className="size-12 shrink-0 rounded-button border border-line text-xl font-bold" aria-label={`Decrease ${team.name} score`} onClick={() => edit(draft => { draft.slots[s].teams[t].score -= 1; })}>−</button>
                <input className="input-field text-center tabular-nums" type="number" inputMode="numeric" aria-label={`${team.name} score`} value={team.score} onChange={event => edit(draft => { draft.slots[s].teams[t].score = Number(event.target.value) || 0; })} />
                <button type="button" className="size-12 shrink-0 rounded-button border border-line text-xl font-bold" aria-label={`Increase ${team.name} score`} onClick={() => edit(draft => { draft.slots[s].teams[t].score += 1; })}>+</button>
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
