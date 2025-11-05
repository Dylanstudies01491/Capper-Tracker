import { sampleCappers, sampleLeaderboard, samplePicks, sampleProfitSeries } from "./sampleData";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

async function safeFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    return null;
  }
}

export async function getDashboardData() {
  const [cappers, leaderboard, picks] = await Promise.all([
    safeFetch<any[]>("/api/cappers"),
    safeFetch<any[]>("/api/leaderboards?window=7d"),
    safeFetch<any[]>("/api/picks?limit=10")
  ]);

  const capperMap = (cappers ?? sampleCappers).reduce<Record<string, any>>((acc, capper) => {
    acc[capper.id] = capper;
    return acc;
  }, {});

  const enrichedLeaderboard = (leaderboard ?? sampleLeaderboard).map((row) => ({
    ...row,
    profit: Number(row.profit ?? 0),
    roi: Number(row.roi ?? 0),
    wins: Number(row.wins ?? 0),
    losses: Number(row.losses ?? 0),
    pushes: Number(row.pushes ?? 0),
    averageOdds: row.averageOdds !== null && row.averageOdds !== undefined ? Number(row.averageOdds) : null,
    averageStake: row.averageStake !== null && row.averageStake !== undefined ? Number(row.averageStake) : null,
    picks: Number(row.picks ?? 0),
    capper: capperMap[row.capperId] ?? sampleCappers.find((c) => c.id === row.capperId)
  }));

  const toPickRow = (pick: any) => ({
    id: pick.id,
    capperId: pick.capperId,
    capperName:
      pick.capper?.displayName ??
      pick.capper?.name ??
      pick.capperName ??
      capperMap[pick.capperId]?.displayName ??
      capperMap[pick.capperId]?.name ??
      "Unknown",
    sport: pick.sport ?? "",
    matchup: pick.matchup ?? `${pick.awayTeam} @ ${pick.homeTeam}`,
    pick:
      pick.pick ??
      (pick.pickType === "total"
        ? `${pick.pickSide} ${pick.listedSpreadOrTotal}`
        : `${pick.pickSide} ${pick.pickPrice > 0 ? "+" : ""}${pick.pickPrice}`),
    postedAt: pick.postedAt,
    result: pick.result ?? "pending",
    profit: typeof pick.profit === "number" ? pick.profit : Number(pick.profit ?? 0),
    stake: typeof pick.stake === "number" ? pick.stake : Number(pick.stake ?? 1)
  });

  const recentPicks = (picks ?? samplePicks).slice(0, 10).map(toPickRow);

  const leaderboard30d = await safeFetch<any[]>("/api/leaderboards?window=30d");
  const totalProfit30d = (leaderboard30d ?? sampleLeaderboard).reduce(
    (acc, row) => acc + Number(row.profit ?? 0),
    0
  );

  const summary = {
    totalProfit7d: enrichedLeaderboard.reduce((acc, row) => acc + (row.profit ?? 0), 0),
    totalProfit30d,
    bestCapper7d: enrichedLeaderboard[0]?.capper?.displayName || sampleCappers[1].name,
    worstCapper7d: enrichedLeaderboard.slice().reverse()[0]?.capper?.displayName || sampleCappers[2].name,
    picksToday: recentPicks.filter((pick) => new Date(pick.postedAt).toDateString() === new Date().toDateString()).length
  };

  return {
    cappers: Object.values(capperMap).filter(Boolean),
    leaderboard: enrichedLeaderboard,
    picks: recentPicks,
    summary
  };
}

export async function getCapperDetail(id: string) {
  const capper = (await safeFetch<any>(`/api/cappers/${id}`)) ?? sampleCappers.find((c) => c.id === id);
  if (!capper) {
    return null;
  }
  const picks = (await safeFetch<any[]>(`/api/picks?capper=${id}`)) ?? samplePicks.filter((pick) => pick.capperId === id);
  const sortedPicks = picks.slice().sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime());
  let running = 0;
  const series = sortedPicks.map((pick) => {
    const profit = typeof pick.profit === "number" ? pick.profit : Number(pick.profit ?? 0);
    running += profit;
    return { date: new Date(pick.postedAt).toISOString(), profit: Number(running.toFixed(2)) };
  });
  return { capper, picks: sortedPicks, series: series.length ? series : sampleProfitSeries[id] ?? [] };
}
