import { Router, type IRouter } from "express";
import { db, patients } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireBootstrap, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/patients", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const rows = await db
    .select()
    .from(patients)
    .where(eq(patients.doctorId, userId))
    .orderBy(desc(patients.createdAt));
  res.json(rows);
});

router.post("/patients", requireBootstrap, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { name, age, medicalRecordId, notes } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });
  const [row] = await db
    .insert(patients)
    .values({
      doctorId: userId,
      name,
      age: age ?? null,
      medicalRecordId: medicalRecordId ?? "",
      notes: notes ?? "",
    })
    .returning();
  res.json(row);
});

router.get("/patients/:id", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const rows = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, String(req.params.id)), eq(patients.doctorId, userId)))
    .limit(1);
  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

router.patch("/patients/:id", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const update: any = { updatedAt: new Date() };
  for (const k of ["name", "age", "medicalRecordId", "notes"]) {
    if (req.body?.[k] !== undefined) update[k] = req.body[k];
  }
  await db
    .update(patients)
    .set(update)
    .where(and(eq(patients.id, String(req.params.id)), eq(patients.doctorId, userId)));
  const rows = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, String(req.params.id)), eq(patients.doctorId, userId)))
    .limit(1);
  res.json(rows[0]);
});

router.delete("/patients/:id", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  await db
    .delete(patients)
    .where(and(eq(patients.id, String(req.params.id)), eq(patients.doctorId, userId)));
  res.json({ ok: true });
});

export default router;
