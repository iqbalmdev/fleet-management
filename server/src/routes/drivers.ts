import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { createDriver, listDriversByOrg } from "../repos/driver";
import { createUser, findUserByEmail } from "../repos/user";
import { hashPassword } from "../utils/password";

const createSchema = z.object({
  name: z.string().trim().min(2),
  license: z.string().trim().min(3),
  phone: z.string().trim().min(8),
});

const createAccountSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(8),
  license: z.string().trim().min(3),
  password: z.string().min(6),
});

export const driversRouter = Router();

driversRouter.use(requireAuth);

driversRouter.get("/", async (req: AuthedRequest, res) => {
  const drivers = await listDriversByOrg(req.auth!.orgId);
  return res.json({
    drivers: drivers.map((driver) => ({
      id: driver.id,
      orgId: driver.org_id,
      name: driver.name,
      license: driver.license,
      phone: driver.phone,
      createdAt: driver.created_at,
    })),
  });
});

driversRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid driver data", details: parsed.error.flatten() });
  }

  try {
    const driver = await createDriver({
      orgId: req.auth!.orgId,
      ...parsed.data,
    });
    return res.status(201).json({
      driver: {
        id: driver.id,
        orgId: driver.org_id,
        name: driver.name,
        license: driver.license,
        phone: driver.phone,
        createdAt: driver.created_at,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create driver",
    });
  }
});

/** Create driver profile + login account so they can use Driver sign-in. */
driversRouter.post("/accounts", async (req: AuthedRequest, res) => {
  if (req.auth!.role !== "admin") {
    return res.status(403).json({ error: "Only admins can create driver logins" });
  }

  const parsed = createAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid driver account data", details: parsed.error.flatten() });
  }

  const body = parsed.data;
  const existing = await findUserByEmail(body.email);
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const mobile = body.phone.startsWith("+") ? body.phone : `+91${body.phone.replace(/\D/g, "")}`;
  const passwordHash = await hashPassword(body.password);

  try {
    const driver = await createDriver({
      orgId: req.auth!.orgId,
      name: body.name,
      license: body.license,
      phone: mobile,
    });

    const user = await createUser({
      orgId: req.auth!.orgId,
      fullName: body.name,
      email: body.email,
      mobile,
      designation: "driver",
      passwordHash,
      role: "driver",
      emailVerified: true,
    });

    return res.status(201).json({
      driver: {
        id: driver.id,
        orgId: driver.org_id,
        name: driver.name,
        license: driver.license,
        phone: driver.phone,
        createdAt: driver.created_at,
      },
      login: {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create driver account",
    });
  }
});
