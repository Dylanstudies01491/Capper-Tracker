import { gradePick } from "@capper-tracker/core";
import { prisma } from "../lib/prisma";
import { PickType } from "@prisma/client";
import { normalizePick } from "../lib/transformers";

interface GradePayload {
  homeScore: number;
  awayScore: number;
  listedSpreadOrTotal?: number | null;
  pickPrice?: number;
  stake?: number | null;
}

/**
 * Persists the result of grading a pick. The calculation itself is delegated to the shared
 * core module so the exact same logic is used in tests and production. The function stores
 * an audit log entry with the raw payload for transparency.
 */
export async function gradePickById(pickId: string, payload: GradePayload, source: "manual" | "api" | "webhook" = "manual") {
  const pick = await prisma.pick.findUnique({ where: { id: pickId } });
  if (!pick) {
    throw new Error("Pick not found");
  }

  const result = gradePick({
    homeScore: payload.homeScore,
    awayScore: payload.awayScore,
    pickType: pick.pickType as PickType,
    pickSide: pick.pickSide,
    listedSpreadOrTotal:
      payload.listedSpreadOrTotal !== undefined
        ? payload.listedSpreadOrTotal
        : pick.listedSpreadOrTotal !== null
        ? Number(pick.listedSpreadOrTotal)
        : null,
    pickPrice: payload.pickPrice ?? pick.pickPrice,
    stake:
      payload.stake !== undefined
        ? payload.stake
        : pick.stake !== null && pick.stake !== undefined
        ? Number(pick.stake)
        : 1,
    homeTeam: pick.homeTeam,
    awayTeam: pick.awayTeam
  });

  const updated = await prisma.pick.update({
    where: { id: pickId },
    data: {
      result: result.result,
      profit: result.profit,
      gradedAt: new Date(),
      source
    }
  });

  await prisma.pickGradeLog.create({
    data: {
      pickId,
      payload
    }
  });

  return normalizePick(updated);
}
