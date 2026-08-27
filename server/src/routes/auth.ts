import { Router } from "express";
import { z } from "zod";
import { createOrganization, findOrganizationById } from "../repos/org";
import {
  createUser,
  findAdminByOrgId,
  findUserByEmail,
  findUserById,
  findUserByOrgAndId,
  findUserByVerificationToken,
  markEmailVerified,
} from "../repos/user";
import { hashPassword, verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import type { User } from "../types";

const signupSchema = z
  .object({
    role: z.enum(["admin", "driver"]).default("admin"),
    adminName: z.string().trim().min(2),
    organizationName: z.string().trim().min(2).optional(),
    organizationType: z.enum(["school", "travel", "fleet", "other"]).optional(),
    orgId: z.string().trim().min(1).optional(),
    mobile: z.string().trim().min(10),
    email: z.string().trim().email(),
    designation: z
      .enum(["transport_admin", "fleet_manager", "owner", "driver"])
      .optional(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    agreeToTerms: z.literal(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) =>
      data.role === "driver"
        ? Boolean(data.orgId)
        : Boolean(data.organizationName && data.organizationType),
    {
      message: "Admin needs organization details; driver needs existing Org ID",
      path: ["organizationName"],
    },
  );

const signinSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
  expectedRole: z.enum(["admin", "driver"]).optional(),
});

export const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid signup data", details: parsed.error.flatten() });
  }

  const body = parsed.data;
  const existing = await findUserByEmail(body.email);
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const mobile = body.mobile.startsWith("+") ? body.mobile : `+91${body.mobile.replace(/\D/g, "")}`;
  const passwordHash = await hashPassword(body.password);

  let orgId: string;
  let orgName: string;

  if (body.role === "admin") {
    try {
      const org = await createOrganization({
        name: body.organizationName!,
        type: body.organizationType!,
      });
      orgId = org.id;
      orgName = org.name;
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to create organization",
      });
    }
  } else {
    const org = await findOrganizationById(body.orgId!.trim().toUpperCase());
    if (!org) {
      return res.status(404).json({ error: "Organization not found. Ask your admin for the Org ID." });
    }
    orgId = org.id;
    orgName = org.name;
  }

  let user: User;
  try {
    user = await createUser({
      orgId,
      fullName: body.adminName,
      email: body.email,
      mobile,
      designation:
        body.role === "driver"
          ? "driver"
          : (body.designation as "transport_admin" | "fleet_manager" | "owner") ??
            "transport_admin",
      passwordHash,
      role: body.role,
      emailVerified: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create user",
    });
  }

  const token = signToken({
    userId: user.id,
    orgId: user.org_id,
    role: user.role,
  });

  return res.status(201).json({
    message: "Account created. You can use the dashboard now.",
    token,
    user: {
      id: user.id,
      orgId: user.org_id,
      orgName,
      fullName: user.full_name,
      email: user.email,
      designation: user.designation,
      role: user.role,
    },
  });
});

authRouter.get("/verify", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!token) {
    return res.status(400).json({ error: "Missing verification token" });
  }

  const user = await findUserByVerificationToken(token);
  if (!user) {
    return res.status(400).json({ error: "Invalid verification link" });
  }

  if (user.email_verified) {
    return res.json({ message: "Email already verified", orgId: user.org_id, userId: user.id });
  }

  await markEmailVerified(user.id);
  return res.json({
    message: "Email verified successfully. You can sign in now.",
    orgId: user.org_id,
    userId: user.id,
  });
});

authRouter.post("/signin", async (req, res) => {
  const parsed = signinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid sign-in data" });
  }

  const { identifier, password, expectedRole } = parsed.data;
  const trimmed = identifier.trim();
  let user: User | null = null;
  let orgName = "";

  if (trimmed.includes("@")) {
    user = await findUserByEmail(trimmed);
    if (user) {
      const org = await findOrganizationById(user.org_id);
      orgName = org?.name ?? "";
    }
  } else {
    const orgId = trimmed.toUpperCase();
    const org = await findOrganizationById(orgId);
    if (org) {
      orgName = org.name;
      // Org ID login is for admins of that organization.
      user = await findAdminByOrgId(org.id);
      if (!user) {
        user = await findUserByOrgAndId(org.id, orgId);
      }
    } else {
      user = await findUserById(orgId);
      if (user) {
        const foundOrg = await findOrganizationById(user.org_id);
        orgName = foundOrg?.name ?? "";
      }
    }
  }

  if (!user) {
    return res.status(401).json({ error: "Invalid Organization ID / Email or password" });
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid Organization ID / Email or password" });
  }

  if (expectedRole && user.role !== expectedRole) {
    return res.status(403).json({
      error:
        expectedRole === "driver"
          ? "This account is not a driver. Use Admin sign in."
          : "This account is not an admin. Use Driver sign in.",
      code: "ROLE_MISMATCH",
    });
  }

  const token = signToken({
    userId: user.id,
    orgId: user.org_id,
    role: user.role,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      orgId: user.org_id,
      orgName,
      fullName: user.full_name,
      email: user.email,
      designation: user.designation,
      role: user.role,
    },
  });
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const auth = req.auth!;
  const user = await findUserById(auth.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const org = await findOrganizationById(user.org_id);
  return res.json({
    user: {
      id: user.id,
      orgId: user.org_id,
      orgName: org?.name ?? "",
      fullName: user.full_name,
      email: user.email,
      designation: user.designation,
      role: user.role,
      emailVerified: user.email_verified,
    },
  });
});
