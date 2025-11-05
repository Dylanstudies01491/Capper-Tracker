import { describe, expect, it, vi, beforeEach } from "vitest";
import { getDashboardData } from "@/lib/api";

const originalFetch = global.fetch;

describe("getDashboardData", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false })) as any;
  });

  it("falls back to sample data when API is unavailable", async () => {
    const data = await getDashboardData();
    expect(data.cappers.length).toBeGreaterThan(0);
    expect(data.leaderboard.length).toBeGreaterThan(0);
    expect(data.summary.totalProfit7d).toBeGreaterThan(0);
  });
});

afterAll(() => {
  global.fetch = originalFetch;
});
