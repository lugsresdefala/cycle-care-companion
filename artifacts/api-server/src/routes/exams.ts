import { Router, type IRouter } from "express";
import { db, examHistory, patients } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth, requireBootstrap, type AuthedRequest } from "../lib/auth";

const PREMIUM_CALC_TYPES = new Set(["trisomy_risk", "preeclampsia_risk"]);

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

  // Premium calc types require an active subscription with tokens; deduct one atomically
  if (PREMIUM_CALC_TYPES.has(calcType)) {
    const now = new Date();
    const updated = await db.execute(sql`
      UPDATE user_subscriptions
      SET tokens_remaining = tokens_remaining - 1,
          tokens_used = tokens_used + 1,
          updated_at = now()
      WHERE id = (
        SELECT id FROM user_subscriptions
        WHERE doctor_id = ${userId}
          AND (status = 'active' OR status = 'trial')
          AND end_date > ${now}
          AND tokens_remaining > 0
        ORDER BY created_at DESC
        LIMIT 1
        FOR UPDATE
      )
      RETURNING tokens_remaining
    `);
    // @ts-ignore
    const tokenRow = (updated.rows ?? updated)[0];
    if (!tokenRow) {
      return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
    }
  }

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
