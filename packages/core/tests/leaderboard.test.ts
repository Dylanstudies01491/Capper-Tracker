import { describe, expect, it } from "vitest";
import { computeLeaderboard } from "../src/leaderboard/leaderboard";

describe("computeLeaderboard", () => {
  const baseDate = new Date("2024-01-10T12:00:00Z");
  const picks = [
    {
      id: "1",
      capperId: "capper-a",
      result: "win" as const,
      profit: 1.1,
      stake: 1,
      odds: -110,
      postedAt: new Date("2024-01-09T12:00:00Z")
    },
    {
      id: "2",
      capperId: "capper-a",
      result: "loss" as const,
      profit: -1,
      stake: 1,
      odds: -110,
      postedAt: new Date("2023-12-15T12:00:00Z")
    },
    {
      id: "3",
      capperId: "capper-b",
      result: "win" as const,
      profit: 2.5,
      stake: 2,
      odds: +125,
      postedAt: new Date("2024-01-08T12:00:00Z")
    }
  ];

  it("filters by window", () => {
    const leaderboard = computeLeaderboard(picks, { window: "7d", now: baseDate });
    expect(leaderboard).toHaveLength(2);
    const capperA = leaderboard.find((l) => l.capperId === "capper-a");
    expect(capperA?.profit).toBeCloseTo(1.1, 2);
  });

  it("computes ROI", () => {
    const leaderboard = computeLeaderboard(picks, { window: "all", now: baseDate });
    const capperA = leaderboard.find((l) => l.capperId === "capper-a");
    expect(capperA?.roi).toBeCloseTo(0.05, 2);
  });
});
