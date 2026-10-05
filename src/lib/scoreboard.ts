/** Shared by the public scoreboard, the organizer editor, and the /api/scoreboard function. */
export type Team = { id: string; name: string; score: number };
export type Slot = { id: string; title: string; teams: Team[]; winnerId: string | null };
export type Scoreboard = { title: string; slots: Slot[]; updatedAt: string | null };

export const SLOT_COUNT = 3;
export const TEAMS_PER_SLOT = 6;
const MAX_NAME = 60;
const MAX_SCORE = 1_000_000;

export function defaultScoreboard(): Scoreboard {
  return {
    title: 'Live Scoreboard',
    updatedAt: null,
    slots: Array.from({ length: SLOT_COUNT }, (_, s) => ({
      id: `slot-${s + 1}`,
      title: `Slot ${s + 1}`,
      winnerId: null,
      teams: Array.from({ length: TEAMS_PER_SLOT }, (_, t) => ({ id: `team-${s * TEAMS_PER_SLOT + t + 1}`, name: `Team ${s * TEAMS_PER_SLOT + t + 1}`, score: 0 })),
    })),
  };
}

function text(value: unknown, field: string): string {
  if (typeof value !== 'string') throw new Error(`${field} must be text`);
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_NAME) throw new Error(`${field} must be 1–${MAX_NAME} characters`);
  return trimmed;
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
      const team = rawTeam as Partial<Team>;
      const id = text(team?.id, `Slot ${s + 1} team ${t + 1} id`);
      if (ids.has(id)) throw new Error(`Duplicate team id ${id}`);
      ids.add(id);
      const score = Number(team.score);
      if (!Number.isFinite(score) || Math.abs(score) > MAX_SCORE) throw new Error(`Score for ${id} must be a number`);
      return { id, name: text(team.name, `Slot ${s + 1} team ${t + 1} name`), score };
    });
    const winnerId = slot.winnerId ?? null;
    if (winnerId !== null && !teams.some(team => team.id === winnerId)) throw new Error(`Slot ${s + 1} winner must be one of its teams`);
    return { id: text(slot.id, `Slot ${s + 1} id`), title: text(slot.title, `Slot ${s + 1} title`), teams, winnerId };
  });
  return { title: text(data.title ?? 'Live Scoreboard', 'Title'), slots, updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : null };
}

/** Highest score first; ties keep their entry order. */
export function rankTeams(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => b.score - a.score);
}
