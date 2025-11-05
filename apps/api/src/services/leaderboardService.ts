import { computeLeaderboard, LeaderboardWindow } from "@capper-tracker/core";
import { prisma } from "../lib/prisma";

/**
 * Executes the leaderboard query in two phases: first fetch the raw pick metrics from the
 * database, then hand them off to the shared computeLeaderboard helper. Keeping the heavy
 * math out of SQL makes it trivial to unit test and evolve the formulas.
 */
export async function getLeaderboard(window: LeaderboardWindow) {
  const picks = await prisma.pick.findMany({
    where: {
      result: { in: ["win", "loss", "push"] }
    },
    select: {
      id: true,
      capperId: true,
      result: true,
      profit: true,
      stake: true,
      pickPrice: true,
      postedAt: true
    }
  });

  const normalized = picks.map((pick) => ({
    id: pick.id,
    capperId: pick.capperId,
    result: pick.result,
    profit: Number(pick.profit ?? 0),
    stake: Number(pick.stake ?? 0) || 1,
    odds: pick.pickPrice,
    postedAt: pick.postedAt
  }));

  return computeLeaderboard(normalized, { window });
}
