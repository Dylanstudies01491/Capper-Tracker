import jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: string;
  role: "owner";
  email: string;
}

/**
 * Issues a short-lived JWT for the owner dashboard. The API uses this token for all
 * owner-only endpoints. Because we only have a single owner account, the payload is kept simple.
 */
export function signOwnerToken(payload: JwtPayload, secret: string, expiresIn: string = "1h"): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyOwnerToken(token: string, secret: string): JwtPayload {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === "string" || !("sub" in decoded)) {
    throw new Error("Invalid token payload");
  }
  return decoded as JwtPayload;
}
