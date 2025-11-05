import { calculateProfit } from "./profit";
import { GradeRequest, GradeResult } from "./types";

/**
 * Determines the result of a pick given the final score. The function is pure and deterministic
 * so it can be re-used both in API handlers and background jobs. All values should be
 * provided in neutral units (scores as raw integers, spreads/totals as the same units used when posting).
 */
export function gradePick(request: GradeRequest): GradeResult {
  const {
    homeScore,
    awayScore,
    pickType,
    pickSide,
    listedSpreadOrTotal,
    pickPrice,
    stake,
    homeTeam,
    awayTeam
  } = request;

  const normalizedStake = stake ?? 1;
  const normalizedOdds = pickPrice ?? -110; // Default vig when data missing.

  const determineResult = (): GradeResult => {
    switch (pickType) {
      case "moneyline": {
        const winner = homeScore > awayScore ? homeTeam : awayScore > homeScore ? awayTeam : null;
        if (!winner) {
          // Moneyline bets are graded as push on ties for North American sports.
          return { result: "push", profit: 0 };
        }
        const isWin = winner.toLowerCase() === pickSide.toLowerCase();
        return { result: isWin ? "win" : "loss", profit: isWin ? calculateProfit(normalizedOdds, normalizedStake) : -normalizedStake };
      }
      case "spread": {
        if (typeof listedSpreadOrTotal !== "number") {
          throw new Error("Spread picks require the listed spread value");
        }
        const backingHome = pickSide.toLowerCase() === homeTeam.toLowerCase();
        const backingAway = pickSide.toLowerCase() === awayTeam.toLowerCase();
        const spread = listedSpreadOrTotal;

        if (!backingHome && !backingAway) {
          throw new Error("Spread pick side must match one of the teams");
        }

        const adjustedMargin = backingHome
          ? homeScore + spread - awayScore
          : awayScore + spread - homeScore;

        if (Math.abs(adjustedMargin) < 1e-9) {
          return { result: "push", profit: 0 };
        }

        const isWin = adjustedMargin > 0;
        return {
          result: isWin ? "win" : "loss",
          profit: isWin ? calculateProfit(normalizedOdds, normalizedStake) : -normalizedStake
        };
      }
      case "total": {
        if (typeof listedSpreadOrTotal !== "number") {
          throw new Error("Total picks require the listed total value");
        }
        const total = homeScore + awayScore;
        if (total === listedSpreadOrTotal) {
          return { result: "push", profit: 0 };
        }
        const wantsOver = pickSide.toLowerCase().includes("over");
        const wantsUnder = pickSide.toLowerCase().includes("under");

        if (!wantsOver && !wantsUnder) {
          throw new Error("Total pick side must specify Over or Under");
        }

        const isWin = wantsOver ? total > listedSpreadOrTotal : total < listedSpreadOrTotal;
        return {
          result: isWin ? "win" : "loss",
          profit: isWin ? calculateProfit(normalizedOdds, normalizedStake) : -normalizedStake
        };
      }
      default: {
        throw new Error(`Unsupported pick type: ${pickType satisfies never}`);
      }
    }
  };

  const grade = determineResult();
  // Round to two decimals for reporting while preserving sign; DB should store higher precision if needed.
  return {
    result: grade.result,
    profit: Math.round(grade.profit * 100) / 100
  };
}
