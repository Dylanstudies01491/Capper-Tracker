import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { CapperProfitChart } from "@/components/CapperProfitChart";
import { getCapperDetail } from "@/lib/api";

interface PageProps {
  params: { id: string };
}

export default async function CapperPage({ params }: PageProps) {
  const data = await getCapperDetail(params.id);
  if (!data) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/" className="text-sm text-emerald-300">← Back to dashboard</Link>
      <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={data.capper.avatarUrl ?? `https://avatars.dicebear.com/api/identicon/${data.capper.id}.svg`}
              alt={data.capper.displayName ?? data.capper.name}
              className="h-20 w-20 rounded-full border border-white/10"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">{data.capper.displayName ?? data.capper.name}</h1>
              <p className="text-sm text-slate-300">{data.capper.bio}</p>
              <p className="text-xs text-slate-400">Joined {format(new Date(data.capper.joinDate), "PPP")}</p>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-right">
            <p className="text-xs text-emerald-200">Last 30d Profit</p>
            <p className="text-2xl font-semibold text-emerald-300">
              {data.series.length ? `${data.series.at(-1)?.profit.toFixed(2)}u` : "n/a"}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <CapperProfitChart data={data.series} />
        </div>
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white">Picks</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-black/40 text-left text-slate-300">
                <tr>
                  <th className="px-4 py-3">Posted</th>
                  <th className="px-4 py-3">Matchup</th>
                  <th className="px-4 py-3">Pick</th>
                  <th className="px-4 py-3">Stake</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Profit</th>
                </tr>
              </thead>
              <tbody>
                {data.picks.map((pick: any) => (
                  <tr key={pick.id} className="border-t border-white/10">
                    <td className="px-4 py-3">{format(new Date(pick.postedAt), "MMM d, yyyy")}</td>
                    <td className="px-4 py-3">{pick.homeTeam ?? pick.matchup}</td>
                    <td className="px-4 py-3">{pick.pick ?? `${pick.pickSide} ${pick.pickPrice}`}</td>
                    <td className="px-4 py-3">{pick.stake ?? 1}u</td>
                    <td className="px-4 py-3 uppercase">{pick.result ?? "PENDING"}</td>
                    <td className="px-4 py-3 text-emerald-300">{pick.profit?.toFixed ? `${pick.profit.toFixed(2)}u` : pick.profit ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
