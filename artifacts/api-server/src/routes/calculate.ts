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
import {
  gestationalAgeFromCRL,
  gestationalAgeFromBPD,
  gestationalAgeFromMultipleBiometry,
  estimatedFetalWeight,
  evaluateUmbilicalArteryPI,
  evaluateUmbilicalArteryRI,
  evaluateUmbilicalArterySDRatio,
  evaluateMCAPI,
  evaluateUterineArteryPI,
  calculateCPR,
  evaluateDuctusVenosusPIV,
  evaluateDuctusVenosusWaveA,
  getUAPiRefsForGA,
  getMCAPiRefsForGA,
  getUtAPiRefsForGA,
  getCPRRefsForGA,
  getDVPivRefsForGA,
  assessGrowthBatch,
  type GrowthParameter,
} from "../lib/premium-calculators";

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

// ── Trisomy Risk ──────────────────────────────────────────────────────────────

router.post("/calculate/trisomy-risk", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  let result;
  try {
    result = calculateTrisomyRisk(req.body as TrisomyInput);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }
  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  return res.json(result);
});

// ── Preeclampsia Risk ─────────────────────────────────────────────────────────

router.post("/calculate/preeclampsia-risk", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  let result;
  try {
    result = calculatePreeclampsiaRisk(req.body as PreeclampsiaInput);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }
  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  return res.json(result);
});

// ── Biometry: CRL ─────────────────────────────────────────────────────────────

router.post("/calculate/biometry/crl", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { crl } = req.body ?? {};
  if (typeof crl !== "number" || isNaN(crl)) return res.status(400).json({ error: "crl must be a number" });
  let result;
  try {
    result = gestationalAgeFromCRL(crl);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }
  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  return res.json(result);
});

// ── Biometry: BPD ─────────────────────────────────────────────────────────────

router.post("/calculate/biometry/bpd", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { bpd } = req.body ?? {};
  if (typeof bpd !== "number" || isNaN(bpd)) return res.status(400).json({ error: "bpd must be a number" });
  let result;
  try {
    result = gestationalAgeFromBPD(bpd);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }
  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  return res.json(result);
});

// ── Biometry: Composite ───────────────────────────────────────────────────────

router.post("/calculate/biometry/composite", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { bpd, hc, ac, fl } = req.body ?? {};
  if (bpd == null && hc == null && ac == null && fl == null) {
    return res.status(400).json({ error: "At least one biometry measurement is required" });
  }
  let result;
  try {
    result = gestationalAgeFromMultipleBiometry({ bpd, hc, ac, fl });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }
  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  return res.json(result);
});

// ── EFW ───────────────────────────────────────────────────────────────────────

router.post("/calculate/efw", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { hc, ac, fl, gaWeeks } = req.body ?? {};
  if (typeof hc !== "number" || typeof ac !== "number" || typeof fl !== "number") {
    return res.status(400).json({ error: "hc, ac, and fl must be numbers" });
  }
  let result;
  try {
    result = estimatedFetalWeight({ hc, ac, fl, gaWeeks: gaWeeks ?? undefined });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }
  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  return res.json(result);
});

// ── Doppler: Umbilical Artery ─────────────────────────────────────────────────

router.post("/calculate/doppler/ua", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { ga, pi, ri, sd } = req.body ?? {};
  if (typeof ga !== "number" || isNaN(ga) || ga < 20 || ga > 42) {
    return res.status(400).json({ error: "ga must be a number between 20 and 42" });
  }
  if (pi == null && ri == null && sd == null) {
    return res.status(400).json({ error: "At least one of pi, ri, or sd is required" });
  }
  let result;
  try {
    result = {
      piResult: pi != null && !isNaN(pi) ? evaluateUmbilicalArteryPI(pi, ga) : undefined,
      riResult: ri != null && !isNaN(ri) ? evaluateUmbilicalArteryRI(ri) : undefined,
      sdResult: sd != null && !isNaN(sd) ? evaluateUmbilicalArterySDRatio(sd, ga) : undefined,
      refs: getUAPiRefsForGA(ga),
    };
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }
  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  return res.json(result);
});

// ── Doppler: MCA ──────────────────────────────────────────────────────────────

router.post("/calculate/doppler/mca", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { ga, pi } = req.body ?? {};
  if (typeof ga !== "number" || isNaN(ga) || ga < 20 || ga > 42) {
    return res.status(400).json({ error: "ga must be a number between 20 and 42" });
  }
  if (typeof pi !== "number" || isNaN(pi) || pi <= 0) {
    return res.status(400).json({ error: "pi must be a positive number" });
  }
  let result;
  try {
    result = { res: evaluateMCAPI(pi, ga), refs: getMCAPiRefsForGA(ga) };
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }
  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  return res.json(result);
});

// ── Doppler: Uterine Artery ───────────────────────────────────────────────────

router.post("/calculate/doppler/uta", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { ga, pi, notch } = req.body ?? {};
  if (typeof ga !== "number" || isNaN(ga) || ga < 11 || ga > 42) {
    return res.status(400).json({ error: "ga must be a number between 11 and 42" });
  }
  if (typeof pi !== "number" || isNaN(pi) || pi <= 0) {
    return res.status(400).json({ error: "pi must be a positive number" });
  }
  let result;
  try {
    result = { res: evaluateUterineArteryPI(pi, ga, !!notch), refs: getUtAPiRefsForGA(ga) };
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }
  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  return res.json(result);
});

// ── Doppler: CPR ──────────────────────────────────────────────────────────────

router.post("/calculate/doppler/cpr", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { ga, mcaPi, uaPi } = req.body ?? {};
  if (typeof ga !== "number" || isNaN(ga) || ga < 20 || ga > 42) {
    return res.status(400).json({ error: "ga must be a number between 20 and 42" });
  }
  if (typeof mcaPi !== "number" || isNaN(mcaPi) || mcaPi <= 0) {
    return res.status(400).json({ error: "mcaPi must be a positive number" });
  }
  if (typeof uaPi !== "number" || isNaN(uaPi) || uaPi <= 0) {
    return res.status(400).json({ error: "uaPi must be a positive number" });
  }
  let result;
  try {
    result = { res: calculateCPR(mcaPi, uaPi, ga), refs: getCPRRefsForGA(ga) };
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }
  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  return res.json(result);
});

// ── Doppler: Ductus Venosus ───────────────────────────────────────────────────

router.post("/calculate/doppler/dv", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { ga, piv, waveAReversed } = req.body ?? {};
  if (typeof ga !== "number" || isNaN(ga) || ga < 11 || ga > 42) {
    return res.status(400).json({ error: "ga must be a number between 11 and 42" });
  }
  let result;
  try {
    const waveAResult = evaluateDuctusVenosusWaveA(!!waveAReversed, ga);
    const pivResult = piv != null && !isNaN(piv) && piv > 0 ? evaluateDuctusVenosusPIV(piv, ga) : undefined;
    const refs = ga >= 20 ? getDVPivRefsForGA(ga) : undefined;
    result = { pivResult, waveAResult, refs };
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }
  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  return res.json(result);
});

// ── Growth Curve ──────────────────────────────────────────────────────────────

router.post("/calculate/growth-curve", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { parameter, measurements } = req.body ?? {};
  if (!parameter || !Array.isArray(measurements) || measurements.length === 0) {
    return res.status(400).json({ error: "parameter and measurements array are required" });
  }
  let result;
  try {
    const assessments = assessGrowthBatch(parameter as GrowthParameter, measurements);
    result = { assessments };
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }
  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  return res.json(result);
});

export default router;
