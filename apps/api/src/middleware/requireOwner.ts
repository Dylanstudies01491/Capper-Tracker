import { NextFunction, Request, Response } from "express";
import { verifyOwnerToken } from "@capper-tracker/core";

/**
 * Owner auth middleware that validates the bearer token. The logic is intentionally short so it can
 * be audited quickly — every owner-only endpoint passes through here to prevent privilege escalation.
 */
export function requireOwner(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization header" });
  }
  const token = header.replace("Bearer ", "").trim();
  try {
    const payload = verifyOwnerToken(token, process.env.JWT_SECRET ?? "dev-secret");
    (req as Request & { ownerId: string }).ownerId = payload.sub;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
