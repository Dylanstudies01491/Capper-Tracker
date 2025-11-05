import { Router } from "express";
import { z } from "zod";
import { getLeaderboard } from "../services/leaderboardService";

const querySchema = z.object({
  window: z.enum(["yesterday", "7d", "30d", "365d", "all", "ytd"]).default("7d")
});

export const leaderboardRouter = Router();

leaderboardRouter.get("/", async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const leaderboard = await getLeaderboard(parsed.data.window);
  res.json(leaderboard);
});
