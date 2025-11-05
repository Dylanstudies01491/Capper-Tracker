import Link from "next/link";
import { ProfitSparkline } from "./ProfitSparkline";
import { sampleProfitSeries } from "@/lib/sampleData";

interface CapperHighlightProps {
  id: string;
  name?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

export function CapperHighlights({ cappers }: { cappers: CapperHighlightProps[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Featured Cappers</h2>
        <p className="text-xs text-slate-300">Tap a card to view full history.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cappers.map((capper) => (
          <Link
            key={capper.id}
            href={`/cappers/${capper.id}`}
            className="rounded-xl border border-white/10 bg-black/30 p-4 transition hover:border-emerald-400/60"
          >
            <div className="flex items-center gap-3">
              <img
                alt={capper.displayName ?? capper.name ?? "Capper"}
                src={capper.avatarUrl ?? `https://avatars.dicebear.com/api/identicon/${capper.id}.svg`}
                className="h-12 w-12 rounded-full border border-white/10"
              />
              <div>
                <p className="text-sm font-semibold text-white">{capper.displayName ?? capper.name}</p>
                <p className="text-xs text-slate-300 overflow-hidden text-ellipsis">{capper.bio}</p>
              </div>
            </div>
            <div className="mt-4 h-16">
              <ProfitSparkline data={sampleProfitSeries[capper.id] ?? []} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
