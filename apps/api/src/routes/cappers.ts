import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireOwner } from "../middleware/requireOwner";

const capperSchema = z.object({
  name: z.string().min(2),
  displayName: z.string().min(2),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  joinDate: z.coerce.date().optional(),
  active: z.boolean().optional()
});

export const capperRouter = Router();

capperRouter.get("/", async (_req, res) => {
  const cappers = await prisma.capper.findMany({
    orderBy: { displayName: "asc" }
  });
  res.json(cappers);
});

capperRouter.get("/:id", async (req, res) => {
  const capper = await prisma.capper.findUnique({ where: { id: req.params.id } });
  if (!capper) {
    return res.status(404).json({ error: "Capper not found" });
  }
  res.json(capper);
});

capperRouter.post("/", requireOwner, async (req, res) => {
  const parsed = capperSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const capper = await prisma.capper.create({ data: parsed.data });
  res.status(201).json(capper);
});

capperRouter.patch("/:id", requireOwner, async (req, res) => {
  const parsed = capperSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const capper = await prisma.capper.update({
    where: { id: req.params.id },
    data: parsed.data
  });
  res.json(capper);
});

capperRouter.delete("/:id", requireOwner, async (req, res) => {
  await prisma.capper.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
