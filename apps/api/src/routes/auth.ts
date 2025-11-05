import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signOwnerToken, verifyPassword } from "@capper-tracker/core";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const owner = await prisma.owner.findUnique({ where: { email } });
  if (!owner) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await verifyPassword(password, owner.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Token contains just enough context for the UI to know the owner identity without leaking secrets.
  const token = signOwnerToken({ sub: owner.id, role: "owner", email: owner.email }, process.env.JWT_SECRET ?? "dev-secret");
  res.json({ token });
});
