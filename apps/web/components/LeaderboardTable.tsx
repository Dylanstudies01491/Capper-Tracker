interface LeaderboardRow {
  capperId: string;
  profit: number;
  roi: number;
  wins: number;
  losses: number;
  pushes: number;
  averageOdds: number | null;
  averageStake: number | null;
  picks: number;
  capper?: { displayName?: string; name?: string };
}

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Leaderboard (Last 7 days)</h2>
        <p className="text-xs text-slate-300">Sort by profit, ROI, or win rate directly via the API.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-300">
            <tr>
              <th className="py-2 pr-4">Capper</th>
              <th className="py-2 pr-4">Profit</th>
              <th className="py-2 pr-4">ROI</th>
              <th className="py-2 pr-4">Record</th>
              <th className="py-2 pr-4">Avg Odds</th>
              <th className="py-2">Avg Stake</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.capperId} className="border-t border-white/5">
                <td className="py-2 pr-4 font-medium text-white">{row.capper?.displayName ?? row.capper?.name ?? row.capperId}</td>
                <td className="py-2 pr-4 text-emerald-400">{row.profit.toFixed(2)}u</td>
                <td className="py-2 pr-4">{(row.roi * 100).toFixed(1)}%</td>
                <td className="py-2 pr-4">{row.wins}-{row.losses}-{row.pushes}</td>
                <td className="py-2 pr-4">{row.averageOdds ? row.averageOdds.toFixed(0) : "—"}</td>
                <td className="py-2">{row.averageStake ? row.averageStake.toFixed(2) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
