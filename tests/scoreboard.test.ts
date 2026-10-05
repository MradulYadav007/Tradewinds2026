import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { defaultScoreboard, parseScoreboard, rankTeams } from '../src/lib/scoreboard';
import type { Team } from '../src/lib/scoreboard';
import { GET, PUT, databaseConfig, isAuthorized, settingsReport } from '../api/scoreboard';

const withAuth = (password: string, init: RequestInit = {}, query = '?auth=1') => new Request(`https://example.com/api/scoreboard${query}`, { ...init, headers: { ...init.headers, Authorization: `Bearer ${password}` } });

describe('scoreboard data', () => {
  it('starts with 3 slots of 6 uniquely named teams', () => {
    const board = parseScoreboard(defaultScoreboard());
    expect(board.slots.map(slot => slot.teams.length)).toEqual([6, 6, 6]);
    expect(new Set(board.slots.flatMap(slot => slot.teams.map(team => team.id))).size).toBe(18);
  });
  it('trims names and keeps a valid winner', () => {
    const board = defaultScoreboard();
    board.slots[0].teams[0].name = '  Alpha  ';
    board.slots[0].winnerId = board.slots[0].teams[0].id;
    expect(parseScoreboard(board).slots[0].teams[0].name).toBe('Alpha');
  });
  it.each([
    ['an empty team name', (b: ReturnType<typeof defaultScoreboard>) => { b.slots[0].teams[0].name = ' '; }],
    ['a non-numeric round score', (b: ReturnType<typeof defaultScoreboard>) => { (b.slots[1].teams[2].rounds as unknown[])[0] = 'ten'; }],
    ['too many rounds', (b: ReturnType<typeof defaultScoreboard>) => { b.slots[1].teams[2].rounds.push(1); }],
    ['a winner from another slot', (b: ReturnType<typeof defaultScoreboard>) => { b.slots[0].winnerId = b.slots[1].teams[0].id; }],
    ['a missing team', (b: ReturnType<typeof defaultScoreboard>) => { b.slots[2].teams.pop(); }],
  ])('rejects %s', (_, corrupt) => {
    const board = defaultScoreboard();
    corrupt(board);
    expect(() => parseScoreboard(board)).toThrow();
  });
  it('starts with the real team names', () => expect(defaultScoreboard().slots.map(slot => slot.teams[0].name)).toEqual(['Rock n Roll', 'Generally Sober', 'Trade Winds']));
  it('totals rounds, ranks highest first and shares tied ranks', () => {
    const team = (id: string, rounds: (number | null)[]): Team => ({ id, name: id, rounds });
    expect(rankTeams([team('a', [2, null]), team('b', [4, 5]), team('c', [9, null]), team('d', [1, 1])]).map(({ team, total, rank }) => [team.id, total, rank]))
      .toEqual([['b', 9, 1], ['c', 9, 1], ['a', 2, 3], ['d', 2, 3]]);
  });
  it('reads data saved with a single score as round 1', () => {
    const old = defaultScoreboard() as unknown as { slots: { teams: Record<string, unknown>[] }[] };
    for (const slot of old.slots) for (const team of slot.teams) { delete team.rounds; team.score = 4; }
    expect(parseScoreboard(old).slots[0].teams[0].rounds).toEqual([4, null, null, null, null]);
  });
});

describe('scoreboard database settings', () => {
  it('uses the standard Vercel variable names', () => expect(databaseConfig({ KV_REST_API_URL: 'https://a', KV_REST_API_TOKEN: 't' })).toEqual({ url: 'https://a', token: 't' }));
  it('finds variables added with a custom prefix', () => expect(databaseConfig({ STORAGE_KV_REST_API_URL: 'https://b', STORAGE_KV_REST_API_TOKEN: 'u' })).toEqual({ url: 'https://b', token: 'u' }));
  it('names what it found when credentials are incomplete', () => expect(() => databaseConfig({ REDIS_URL: 'redis://x' })).toThrow('Found only: REDIS_URL'));
});

describe('scoreboard API auth', () => {
  beforeEach(() => { process.env.SCOREBOARD_ADMIN_PASSWORD = 'secret'; });
  afterEach(() => { delete process.env.SCOREBOARD_ADMIN_PASSWORD; });
  it('accepts only the configured password', () => {
    expect(isAuthorized(withAuth('secret'), 'secret')).toBe(true);
    expect(isAuthorized(withAuth('wrong'), 'secret')).toBe(false);
    expect(isAuthorized(withAuth('anything'), undefined)).toBe(false);
  });
  it('refuses edits without the password before touching storage', async () => {
    const response = await PUT(withAuth('wrong', { method: 'PUT', body: JSON.stringify(defaultScoreboard()) }, ''));
    expect(response.status).toBe(401);
  });
  it('reports a failed login check', async () => expect((await GET(new Request('https://example.com/api/scoreboard?auth=1'))).status).toBe(401));
});

describe('scoreboard settings report', () => {
  it('says where it runs and what is missing, without values', () => {
    const report = settingsReport({ VERCEL: '1', VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'scores', SCOREBOARD_ADMIN_PASSWORD: 'secret' });
    expect(report).toEqual({ runningOn: 'Vercel preview deployment of branch scores', SCOREBOARD_ADMIN_PASSWORD: 'set', 'KV_REST_API_URL + KV_REST_API_TOKEN': 'missing' });
    expect(JSON.stringify(report)).not.toContain('secret');
  });
  it('explains a missing password instead of calling it wrong', async () => {
    const saved = process.env.SCOREBOARD_ADMIN_PASSWORD;
    delete process.env.SCOREBOARD_ADMIN_PASSWORD;
    const response = await GET(withAuth('anything'));
    if (saved !== undefined) process.env.SCOREBOARD_ADMIN_PASSWORD = saved;
    expect(response.status).toBe(500);
    expect((await response.json()).error).toContain('SCOREBOARD_ADMIN_PASSWORD) is not set');
  });
});
