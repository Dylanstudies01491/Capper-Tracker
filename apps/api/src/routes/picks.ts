import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireOwner } from "../middleware/requireOwner";
import { gradePickById } from "../services/gradingService";
import { normalizePick } from "../lib/transformers";

const pickSchema = z.object({
  capperId: z.string().uuid(),
  sport: z.string(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  pickType: z.enum(["spread", "moneyline", "total"]),
  pickSide: z.string(),
  pickPrice: z.preprocess((val) => (val === null || val === undefined ? val : Number(val)), z.number().int()),
  listedSpreadOrTotal: z.union([z.coerce.number(), z.null()]).optional(),
  stake: z.union([z.coerce.number(), z.null()]).optional(),
  postedAt: z.coerce.date(),
  eventDate: z.coerce.date(),
  notes: z.string().optional()
});

const gradeSchema = z.object({
  homeScore: z.number(),
  awayScore: z.number(),
  listedSpreadOrTotal: z.union([z.coerce.number(), z.null()]).optional(),
  pickPrice: z.preprocess((val) => (val === null || val === undefined ? val : Number(val)), z.number()).optional(),
  stake: z.union([z.coerce.number(), z.null()]).optional(),
  source: z.enum(["manual", "api", "webhook"]).optional()
});

export const pickRouter = Router();

pickRouter.get("/", async (req, res) => {
  const { capper, from, to, type, result, limit } = req.query;
  const limitNumber = limit ? Math.min(Number(limit), 100) : undefined;

  const picks = await prisma.pick.findMany({
    where: {
      capperId: capper ? String(capper) : undefined,
      pickType: type ? (String(type) as any) : undefined,
      result: result ? (String(result) as any) : undefined,
      postedAt: {
        gte: from ? new Date(String(from)) : undefined,
        lte: to ? new Date(String(to)) : undefined
      }
    },
    orderBy: { postedAt: "desc" },
    include: { capper: true },
    take: limitNumber && !Number.isNaN(limitNumber) ? limitNumber : undefined
  });

  res.json(picks.map(normalizePick));
});

pickRouter.post("/", requireOwner, async (req, res) => {
  const parsed = pickSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const data = parsed.data;
  const pick = await prisma.pick.create({
    data: {
      capperId: data.capperId,
      sport: data.sport,
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      pickType: data.pickType,
      pickSide: data.pickSide,
      pickPrice: data.pickPrice,
      listedSpreadOrTotal: data.listedSpreadOrTotal,
      stake: data.stake,
      postedAt: data.postedAt,
      eventDate: data.eventDate,
      notes: data.notes,
      result: "pending",
      source: "manual"
    }
  });
  res.status(201).json(normalizePick(pick));
});

pickRouter.patch("/:id", requireOwner, async (req, res) => {
  const parsed = pickSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const pick = await prisma.pick.update({
    where: { id: req.params.id },
    data: parsed.data
  });
  res.json(normalizePick(pick));
});

pickRouter.post("/:id/grade", requireOwner, async (req, res) => {
  const parsed = gradeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  try {
    const { source, ...payload } = parsed.data;
    const pick = await gradePickById(req.params.id, payload, source ?? "manual");
    res.json(pick);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
