interface SummaryProps {
  totalProfit7d: number;
  totalProfit30d: number;
  bestCapper7d: string;
  worstCapper7d: string;
  picksToday: number;
}

export function SummaryCards(summary: SummaryProps) {
  const cards = [
    { label: "Total Profit (7d)", value: `${summary.totalProfit7d.toFixed(2)}u` },
    { label: "Total Profit (30d)", value: `${summary.totalProfit30d.toFixed(2)}u` },
    { label: "Best Capper (7d)", value: summary.bestCapper7d },
    { label: "Picks Today", value: summary.picksToday.toString() }
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
          <p className="text-sm text-slate-300">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
