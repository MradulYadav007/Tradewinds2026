/** Shared by the public scoreboard, the organizer editor, and the /api/scoreboard function. */
/** `rounds[i]` is the score for round i + 1, or null while that round has not been scored. */
export type Team = { id: string; name: string; rounds: (number | null)[] };
export type Slot = { id: string; title: string; teams: Team[]; winnerId: string | null };
export type Scoreboard = { title: string; slots: Slot[]; updatedAt: string | null };

export const SLOT_COUNT = 3;
export const TEAMS_PER_SLOT = 6;
export const ROUND_COUNT = 5;
const MAX_NAME = 60;
const MAX_SCORE = 1_000_000;

const DEFAULT_TEAMS = [
  ['Rock n Roll', 'Silver Six', 'Who Cares', 'Wabi Sabi', 'Wind Surfers', 'Vikram Betal'],
  ['Generally Sober', 'Vasco da Mama', 'Team Velocity', 'Snowflakes', 'Notzees', 'Banjare'],
  ['Trade Winds', 'Fun Panrom', 'Liability Lover', '4th Team', 'Kala Jamun', 'Unfiltered'],
];

export function emptyRounds(): (number | null)[] {
  return Array.from({ length: ROUND_COUNT }, () => null);
}

export function defaultScoreboard(): Scoreboard {
  return {
    title: 'The Trade Times',
    updatedAt: null,
    slots: DEFAULT_TEAMS.map((names, s) => ({
      id: `slot-${s + 1}`,
      title: `Slot ${s + 1}`,
      winnerId: null,
      teams: names.map((name, t) => ({ id: `team-${s * TEAMS_PER_SLOT + t + 1}`, name, rounds: emptyRounds() })),
    })),
  };
}

function text(value: unknown, field: string): string {
  if (typeof value !== 'string') throw new Error(`${field} must be text`);
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_NAME) throw new Error(`${field} must be 1–${MAX_NAME} characters`);
  return trimmed;
}

function roundScore(value: unknown, field: string): number | null {
  if (value === null || value === undefined || value === '') return null;
  const score = Number(value);
  if (!Number.isFinite(score) || Math.abs(score) > MAX_SCORE) throw new Error(`${field} must be a number`);
  return score;
}

/** Validates untrusted input (request bodies, stored JSON) and returns a clean copy. Throws on anything malformed. */
export function parseScoreboard(input: unknown): Scoreboard {
  const data = input as Partial<Scoreboard> | null;
  if (!data || typeof data !== 'object' || !Array.isArray(data.slots)) throw new Error('Scoreboard must contain slots');
  if (data.slots.length !== SLOT_COUNT) throw new Error(`Scoreboard must have ${SLOT_COUNT} slots`);
  const ids = new Set<string>();
  const slots = data.slots.map((raw, s) => {
    const slot = raw as Partial<Slot>;
    if (!slot || !Array.isArray(slot.teams) || slot.teams.length !== TEAMS_PER_SLOT) throw new Error(`Slot ${s + 1} must have ${TEAMS_PER_SLOT} teams`);
    const teams = slot.teams.map((rawTeam, t) => {
      const team = rawTeam as Partial<Team> & { score?: unknown };
      const id = text(team?.id, `Slot ${s + 1} team ${t + 1} id`);
      if (ids.has(id)) throw new Error(`Duplicate team id ${id}`);
      ids.add(id);
      const name = text(team.name, `Slot ${s + 1} team ${t + 1} name`);
      // Data saved before rounds existed had a single `score`; treat it as round 1.
      const rawRounds = Array.isArray(team.rounds) ? team.rounds : [team.score];
      if (rawRounds.length > ROUND_COUNT) throw new Error(`${name} can have at most ${ROUND_COUNT} rounds`);
      const rounds = emptyRounds().map((_, r) => roundScore(rawRounds[r], `${name} round ${r + 1}`));
      return { id, name, rounds };
    });
    const winnerId = slot.winnerId ?? null;
    if (winnerId !== null && !teams.some(team => team.id === winnerId)) throw new Error(`Slot ${s + 1} winner must be one of its teams`);
    return { id: text(slot.id, `Slot ${s + 1} id`), title: text(slot.title, `Slot ${s + 1} title`), teams, winnerId };
  });
  return { title: text(data.title ?? 'The Trade Times', 'Title'), slots, updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : null };
}

export function totalScore(team: Team): number {
  return team.rounds.reduce<number>((sum, score) => sum + (score ?? 0), 0);
}

/** Highest total first, ties keep their entry order and share a rank (1, 1, 3, …). */
export function rankTeams(teams: Team[]): { team: Team; total: number; rank: number }[] {
  const sorted = teams.map(team => ({ team, total: totalScore(team) })).sort((a, b) => b.total - a.total);
  return sorted.map((entry, index) => ({ ...entry, rank: sorted.findIndex(other => other.total === entry.total) + 1 }));
}
