import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { authRouter } from "./routes/auth";
import { capperRouter } from "./routes/cappers";
import { pickRouter } from "./routes/picks";
import { leaderboardRouter } from "./routes/leaderboard";
import { webhookRouter } from "./routes/webhooks";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan("combined"));

  // Basic rate limiting primarily to protect webhook endpoints from abuse.
  app.use(
    "/api",
    rateLimit({
      windowMs: 60_000,
      max: 120
    })
  );

  app.use("/api/auth", authRouter);
  app.use("/api/cappers", capperRouter);
  app.use("/api/picks", pickRouter);
  app.use("/api/leaderboards", leaderboardRouter);
  app.use("/api/webhooks", webhookRouter);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
