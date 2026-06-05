import { Router, type IRouter } from "express";
import { db, userSubscriptions } from "@workspace/db";
import { sql } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../lib/auth";
import {
  calculateTrisomyRisk,
  calculatePreeclampsiaRisk,
  type TrisomyInput,
  type PreeclampsiaInput,
} from "../lib/risk-calculators";

const router: IRouter = Router();

async function deductToken(userId: string): Promise<boolean> {
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
  const row = (updated.rows ?? updated)[0];
  return !!row;
}

router.post("/calculate/trisomy-risk", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;

  const ok = await deductToken(userId);
  if (!ok) {
    return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  }

  try {
    const input = req.body as TrisomyInput;
    const result = calculateTrisomyRisk(input);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }
});

router.post("/calculate/preeclampsia-risk", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;

  const ok = await deductToken(userId);
  if (!ok) {
    return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  }

  try {
    const input = req.body as PreeclampsiaInput;
    const result = calculatePreeclampsiaRisk(input);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }
});

export default router;
