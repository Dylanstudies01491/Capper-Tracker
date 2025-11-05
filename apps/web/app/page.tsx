import { SummaryCards } from "@/components/SummaryCards";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { RecentPicks } from "@/components/RecentPicks";
import { CapperHighlights } from "@/components/CapperHighlights";
import { getDashboardData } from "@/lib/api";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-3xl font-bold text-white">CapperTracker</h1>
        <p className="mt-2 text-sm text-slate-300">
          Production-ready scaffold for tracking cappers, auto-grading picks, and broadcasting leaderboards.
        </p>
      </header>
      <SummaryCards {...data.summary} />
      <CapperHighlights cappers={data.cappers} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeaderboardTable rows={data.leaderboard} />
        </div>
        <RecentPicks picks={data.picks} />
      </div>
    </main>
  );
}
