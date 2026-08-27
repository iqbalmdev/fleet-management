import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { createBus, listBusesByOrg } from "../repos/bus";

const createSchema = z.object({
  code: z.string().trim().min(1),
  plate: z.string().trim().min(3),
  capacity: z.coerce.number().int().positive(),
});

export const busesRouter = Router();

busesRouter.use(requireAuth);

busesRouter.get("/", async (req: AuthedRequest, res) => {
  const buses = await listBusesByOrg(req.auth!.orgId);
  return res.json({
    buses: buses.map((bus) => ({
      id: bus.id,
      orgId: bus.org_id,
      code: bus.code,
      plate: bus.plate,
      capacity: bus.capacity,
      createdAt: bus.created_at,
    })),
  });
});

busesRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid bus data", details: parsed.error.flatten() });
  }

  try {
    const bus = await createBus({
      orgId: req.auth!.orgId,
      ...parsed.data,
    });
    return res.status(201).json({
      bus: {
        id: bus.id,
        orgId: bus.org_id,
        code: bus.code,
        plate: bus.plate,
        capacity: bus.capacity,
        createdAt: bus.created_at,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create bus",
    });
  }
});
