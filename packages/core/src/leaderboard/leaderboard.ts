import { addDays, isAfter, isBefore, startOfDay, subDays } from "date-fns";
import { PickResult } from "../grading/types";

export interface LeaderboardPick {
  id: string;
  capperId: string;
  result: PickResult;
  profit: number;
  stake: number;
  odds: number;
  postedAt: Date;
}

export interface LeaderboardSummary {
  capperId: string;
  profit: number;
  roi: number;
  wins: number;
  losses: number;
  pushes: number;
  averageOdds: number | null;
  averageStake: number | null;
  picks: number;
}

export type LeaderboardWindow = "yesterday" | "7d" | "30d" | "365d" | "all" | "ytd";

export interface LeaderboardOptions {
  window: LeaderboardWindow;
  now?: Date;
}

function getWindowBounds(window: LeaderboardWindow, now: Date): { from: Date | null; to: Date | null } {
  switch (window) {
    case "yesterday": {
      const end = startOfDay(now);
      const start = subDays(end, 1);
      return { from: start, to: end };
    }
    case "7d": {
      return { from: subDays(now, 7), to: now };
    }
    case "30d": {
      return { from: subDays(now, 30), to: now };
    }
    case "365d": {
      return { from: subDays(now, 365), to: now };
    }
    case "ytd": {
      const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      return { from: start, to: now };
    }
    case "all":
    default:
      return { from: null, to: null };
  }
}

/**
 * Aggregates picks into leaderboard statistics. The function accepts raw pick data so
 * it can be used both inside API handlers and in unit tests without hitting the database.
 */
export function computeLeaderboard(
  picks: LeaderboardPick[],
  options: LeaderboardOptions
): LeaderboardSummary[] {
  const now = options.now ?? new Date();
  const { from, to } = getWindowBounds(options.window, now);

  const filtered = picks.filter((pick) => {
    if (from && !isAfter(pick.postedAt, from) && pick.postedAt.getTime() !== from.getTime()) {
      return false;
    }
    if (to && !isBefore(pick.postedAt, to) && pick.postedAt.getTime() !== to.getTime()) {
      return false;
    }
    return true;
  });

  const byCapper = new Map<string, LeaderboardSummary & { oddsSum: number; stakeSum: number }>();

  for (const pick of filtered) {
    const existing = byCapper.get(pick.capperId) ?? {
      capperId: pick.capperId,
      profit: 0,
      roi: 0,
      wins: 0,
      losses: 0,
      pushes: 0,
      averageOdds: null,
      averageStake: null,
      picks: 0,
      oddsSum: 0,
      stakeSum: 0
    };

    existing.picks += 1;
    existing.profit += pick.profit;
    existing.stakeSum += pick.stake;
    existing.oddsSum += pick.odds;

    if (pick.result === "win") existing.wins += 1;
    if (pick.result === "loss") existing.losses += 1;
    if (pick.result === "push") existing.pushes += 1;

    byCapper.set(pick.capperId, existing);
  }

  return Array.from(byCapper.values()).map((summary) => {
    const roi = summary.stakeSum > 0 ? summary.profit / summary.stakeSum : 0;
    return {
      capperId: summary.capperId,
      profit: Math.round(summary.profit * 100) / 100,
      roi,
      wins: summary.wins,
      losses: summary.losses,
      pushes: summary.pushes,
      averageOdds: summary.picks > 0 ? summary.oddsSum / summary.picks : null,
      averageStake: summary.picks > 0 ? summary.stakeSum / summary.picks : null,
      picks: summary.picks
    };
  });
}
