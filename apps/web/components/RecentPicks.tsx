import { format } from "date-fns";

interface PickRow {
  id: string;
  capperName: string;
  sport: string;
  matchup: string;
  pick: string;
  postedAt: string;
  result: string;
  profit: number;
  stake: number;
}

export function RecentPicks({ picks }: { picks: PickRow[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recent Picks</h2>
        <a className="text-xs text-emerald-300" href="#">Export CSV</a>
      </div>
      <div className="space-y-3">
        {picks.map((pick) => (
          <div key={pick.id} className="flex items-center justify-between rounded-lg bg-black/20 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">{pick.capperName}</p>
              <p className="text-xs text-slate-300">{pick.matchup}</p>
              <p className="text-xs text-slate-400">{format(new Date(pick.postedAt), "MMM d, h:mm a")}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-200">{pick.pick}</p>
              <p className="text-xs text-slate-300">Stake: {pick.stake}u</p>
              <p className={`text-sm font-semibold ${pick.result === "win" ? "text-emerald-400" : pick.result === "loss" ? "text-rose-400" : "text-slate-200"}`}>
                {pick.result.toUpperCase()} ({pick.profit >= 0 ? "+" : ""}{pick.profit.toFixed(2)}u)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
