import { Router, type IRouter } from "express";
import { db, examHistory, patients } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireBootstrap, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/exams", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const patientId = req.query.patientId as string | undefined;
  const where = patientId
    ? and(eq(examHistory.doctorId, userId), eq(examHistory.patientId, patientId))
    : eq(examHistory.doctorId, userId);
  const rows = await db
    .select()
    .from(examHistory)
    // @ts-ignore
    .where(where)
    .orderBy(desc(examHistory.createdAt));
  res.json(rows);
});

router.post("/exams", requireBootstrap, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const {
    patientId,
    calcType,
    inputData,
    resultData,
    gestationalAgeWeeks,
    gestationalAgeDays,
    notes,
  } = req.body || {};
  if (!calcType) return res.status(400).json({ error: "calcType required" });

  if (patientId) {
    const [patient] = await db
      .select({ id: patients.id })
      .from(patients)
      .where(and(eq(patients.id, String(patientId)), eq(patients.doctorId, userId)))
      .limit(1);
    if (!patient) {
      return res.status(403).json({ error: "Patient not found or access denied" });
    }
  }

  // Token charging for premium calculators happens at POST /calculate/*, which is
  // the single source of truth. /exams is pure persistence — do not deduct here,
  // or premium calculations would be billed twice (once on calculate, once on save).

  const [examRow] = await db
    .insert(examHistory)
    .values({
      doctorId: userId,
      patientId: patientId ?? null,
      calcType,
      inputData: inputData ?? {},
      resultData: resultData ?? {},
      gestationalAgeWeeks: gestationalAgeWeeks ?? null,
      gestationalAgeDays: gestationalAgeDays ?? null,
      notes: notes ?? "",
    })
    .returning();
  res.json(examRow);
});

router.delete("/exams/:id", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  await db
    .delete(examHistory)
    .where(and(eq(examHistory.id, String(req.params.id)), eq(examHistory.doctorId, userId)));
  res.json({ ok: true });
});

export default router;
