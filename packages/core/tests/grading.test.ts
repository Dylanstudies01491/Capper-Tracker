import { describe, expect, it } from "vitest";
import { gradePick } from "../src/grading/gradePick";

describe("gradePick", () => {
  it("grades spread push correctly", () => {
    const result = gradePick({
      homeScore: 24,
      awayScore: 21,
      pickType: "spread",
      pickSide: "Rams",
      listedSpreadOrTotal: -3,
      pickPrice: -110,
      stake: 1,
      homeTeam: "Rams",
      awayTeam: "Seahawks"
    });
    expect(result).toEqual({ result: "push", profit: 0 });
  });

  it("grades moneyline win", () => {
    const result = gradePick({
      homeScore: 3,
      awayScore: 1,
      pickType: "moneyline",
      pickSide: "Rams",
      pickPrice: -150,
      stake: 2,
      homeTeam: "Rams",
      awayTeam: "Seahawks"
    });
    expect(result.result).toBe("win");
    expect(result.profit).toBeCloseTo(2 * (100 / 150), 2);
  });

  it("grades total loss", () => {
    const result = gradePick({
      homeScore: 100,
      awayScore: 99,
      pickType: "total",
      pickSide: "Under",
      listedSpreadOrTotal: 198.5,
      pickPrice: -110,
      stake: 1,
      homeTeam: "Lakers",
      awayTeam: "Celtics"
    });
    expect(result.result).toBe("loss");
    expect(result.profit).toBe(-1);
  });

  it("grades away spread win with plus points", () => {
    const result = gradePick({
      homeScore: 92,
      awayScore: 94,
      pickType: "spread",
      pickSide: "Aces",
      listedSpreadOrTotal: 4.5,
      pickPrice: -108,
      stake: 1,
      homeTeam: "Liberty",
      awayTeam: "Aces"
    });
    expect(result.result).toBe("win");
  });

  it("rounds profit to two decimals", () => {
    const result = gradePick({
      homeScore: 5,
      awayScore: 4,
      pickType: "moneyline",
      pickSide: "Reds",
      pickPrice: +123,
      stake: 1.75,
      homeTeam: "Reds",
      awayTeam: "Cubs"
    });
    expect(result.profit).toBeCloseTo(2.15, 2);
  });
});
