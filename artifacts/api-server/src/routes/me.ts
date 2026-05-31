import { Router, type IRouter } from "express";
import { db, profiles } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireBootstrap, isAdmin, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const rows = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  const p = rows[0];
  if (!p) return res.status(404).json({ error: "Profile not found" });
  res.json({
    id: p.id,
    fullName: p.fullName,
    specialty: p.specialty,
    crmNumber: p.crmNumber,
    phone: p.phone,
    email: p.email,
  });
});

router.patch("/me", requireBootstrap, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { fullName, specialty, crmNumber, phone } = req.body || {};
  const update: any = {};
  if (fullName !== undefined) update.fullName = fullName;
  if (specialty !== undefined) update.specialty = specialty;
  if (crmNumber !== undefined) update.crmNumber = crmNumber;
  if (phone !== undefined) update.phone = phone;
  update.updatedAt = new Date();
  await db.update(profiles).set(update).where(eq(profiles.id, userId));
  const rows = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  const p = rows[0]!;
  res.json({
    id: p.id,
    fullName: p.fullName,
    specialty: p.specialty,
    crmNumber: p.crmNumber,
    phone: p.phone,
    email: p.email,
  });
});

router.get("/me/is-admin", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  res.json({ isAdmin: await isAdmin(userId) });
});

export default router;
