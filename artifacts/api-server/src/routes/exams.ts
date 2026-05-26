import { Router, type IRouter } from "express";
import { db, examHistory } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../lib/auth";

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

router.post("/exams", requireAuth, async (req, res): Promise<any> => {
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
  const [row] = await db
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
  res.json(row);
});

router.delete("/exams/:id", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  await db
    .delete(examHistory)
    .where(and(eq(examHistory.id, String(req.params.id)), eq(examHistory.doctorId, userId)));
  res.json({ ok: true });
});

export default router;
