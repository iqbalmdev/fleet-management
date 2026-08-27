import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { UserRole } from "../types";

export type JwtPayload = {
  userId: string;
  orgId: string;
  role: UserRole;
};

const EXPIRES_IN = "12h";

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
