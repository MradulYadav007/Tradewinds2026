import { describe, expect, it } from 'vitest';
import { defaultScoreboard, parseScoreboard, rankTeams } from '../src/lib/scoreboard';
import { GET, PUT, isAuthorized } from '../api/scoreboard';

const withAuth = (password: string, init: RequestInit = {}) => new Request('https://example.com/api/scoreboard', { ...init, headers: { ...init.headers, Authorization: `Bearer ${password}` } });

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
    ['a non-numeric score', (b: ReturnType<typeof defaultScoreboard>) => { (b.slots[1].teams[2] as { score: unknown }).score = 'ten'; }],
    ['a winner from another slot', (b: ReturnType<typeof defaultScoreboard>) => { b.slots[0].winnerId = b.slots[1].teams[0].id; }],
    ['a missing team', (b: ReturnType<typeof defaultScoreboard>) => { b.slots[2].teams.pop(); }],
  ])('rejects %s', (_, corrupt) => {
    const board = defaultScoreboard();
    corrupt(board);
    expect(() => parseScoreboard(board)).toThrow();
  });
  it('ranks by score, highest first', () => expect(rankTeams([{ id: 'a', name: 'A', score: 2 }, { id: 'b', name: 'B', score: 9 }]).map(team => team.id)).toEqual(['b', 'a']));
});

describe('scoreboard API auth', () => {
  it('accepts only the configured password', () => {
    expect(isAuthorized(withAuth('secret'), 'secret')).toBe(true);
    expect(isAuthorized(withAuth('wrong'), 'secret')).toBe(false);
    expect(isAuthorized(withAuth('anything'), undefined)).toBe(false);
  });
  it('refuses edits without the password before touching storage', async () => {
    const response = await PUT(withAuth('wrong', { method: 'PUT', body: JSON.stringify(defaultScoreboard()) }));
    expect(response.status).toBe(401);
  });
  it('reports a failed login check', async () => expect((await GET(new Request('https://example.com/api/scoreboard?auth=1'))).status).toBe(401));
});
