import { Router } from "express";
import { z } from "zod";
import { gradePickById } from "../services/gradingService";

const payloadSchema = z.object({
  grades: z.array(
    z.object({
      pickId: z.string().uuid(),
      homeScore: z.number(),
      awayScore: z.number(),
      listedSpreadOrTotal: z.number().nullable().optional(),
      pickPrice: z.number().optional(),
      stake: z.number().nullable().optional()
    })
  )
});

export const webhookRouter = Router();

webhookRouter.post("/grade", async (req, res) => {
  const secret = req.headers["x-webhook-secret"];
  if ((process.env.WEBHOOK_SECRET ?? "") !== String(secret ?? "")) {
    return res.status(401).json({ error: "Invalid webhook secret" });
  }
  const parsed = payloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const results = [];
  for (const grade of parsed.data.grades) {
    const updated = await gradePickById(grade.pickId, grade, "webhook");
    results.push(updated);
  }
  res.json({ updated: results.length });
});
