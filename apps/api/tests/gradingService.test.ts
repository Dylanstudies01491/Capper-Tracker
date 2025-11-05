import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../lib/prisma", () => {
  const pickStore = {
    id: "pick-1",
    capperId: "capper-1",
    sport: "NFL",
    homeTeam: "Rams",
    awayTeam: "Seahawks",
    pickType: "spread",
    pickSide: "Rams",
    pickPrice: -110,
    listedSpreadOrTotal: -3.5,
    stake: 1,
    postedAt: new Date(),
    eventDate: new Date()
  } as any;
  return {
    prisma: {
      pick: {
        findUnique: vi.fn(async ({ where }: any) => (where.id === pickStore.id ? pickStore : null)),
        update: vi.fn(async ({ data }: any) => ({ ...pickStore, ...data }))
      },
      pickGradeLog: {
        create: vi.fn()
      }
    }
  };
});

import { prisma } from "../lib/prisma";
import { gradePickById } from "../src/services/gradingService";

const mockedPrisma = prisma as unknown as {
  pick: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  pickGradeLog: { create: ReturnType<typeof vi.fn> };
};

describe("gradePickById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("grades and persists a spread pick", async () => {
    const result = await gradePickById(
      "pick-1",
      { homeScore: 28, awayScore: 20, listedSpreadOrTotal: -3.5 },
      "manual"
    );
    expect(result.result).toBe("win");
    expect(result.profit).toBeGreaterThan(0);
    expect(mockedPrisma.pick.update).toHaveBeenCalled();
    expect(mockedPrisma.pickGradeLog.create).toHaveBeenCalled();
  });
});
