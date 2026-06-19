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
  dueDateFromGA,
  isValidCRL,
  isValidBPD,
} from "../lib/biometry";
import {
  evaluateUmbilicalArtery,
  evaluateMCA,
  evaluateUterineArtery,
  evaluateCPR,
  evaluateDuctusVenosus,
} from "../lib/doppler";
import { assessGrowth, isValidGrowthParam } from "../lib/intergrowth";

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

// ── Trisomy Risk (existing) ──────────────────────────────────────────────────

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

router.post("/calculate/biometry/crl", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { crl } = req.body ?? {};
  const crlVal = parseFloat(crl);
  if (isNaN(crlVal)) return res.status(400).json({ error: "crl must be a number" });
  if (!isValidCRL(crlVal)) return res.status(400).json({ error: "CCN deve estar entre 2 e 84 mm" });

  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });

  const ga = gestationalAgeFromCRL(crlVal);
  return res.json({ ...ga, dueDate: dueDateFromGA(ga.totalDays).toISOString() });
});

// ── Biometry: BPD ────────────────────────────────────────────────────────────

router.post("/calculate/biometry/bpd", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { bpd } = req.body ?? {};
  const bpdVal = parseFloat(bpd);
  if (isNaN(bpdVal)) return res.status(400).json({ error: "bpd must be a number" });
  if (!isValidBPD(bpdVal)) return res.status(400).json({ error: "DBP deve estar entre 14 e 100 mm" });

  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });

  const ga = gestationalAgeFromBPD(bpdVal);
  return res.json({ ...ga, dueDate: dueDateFromGA(ga.totalDays).toISOString() });
});

// ── Biometry: Composite ──────────────────────────────────────────────────────

router.post("/calculate/biometry/composite", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { bpd, hc, ac, fl } = req.body ?? {};
  const params = {
    bpd: bpd !== undefined ? parseFloat(bpd) : undefined,
    hc: hc !== undefined ? parseFloat(hc) : undefined,
    ac: ac !== undefined ? parseFloat(ac) : undefined,
    fl: fl !== undefined ? parseFloat(fl) : undefined,
  };
  if (!params.bpd && !params.hc && !params.ac && !params.fl) {
    return res.status(400).json({ error: "Informe ao menos uma medida biométrica" });
  }

  const result = gestationalAgeFromMultipleBiometry(params);
  if (result.estimates.length === 0) {
    return res.status(400).json({ error: "Valores fora do intervalo aceitável" });
  }

  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });

  return res.json({ ...result, dueDate: dueDateFromGA(result.totalDays).toISOString() });
});

// ── Biometry: EFW ────────────────────────────────────────────────────────────

router.post("/calculate/biometry/efw", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { hc, ac, fl, gaWeeks } = req.body ?? {};
  const hcVal = parseFloat(hc);
  const acVal = parseFloat(ac);
  const flVal = parseFloat(fl);
  if (isNaN(hcVal) || isNaN(acVal) || isNaN(flVal)) {
    return res.status(400).json({ error: "CC, CA e CF são obrigatórios" });
  }
  if (hcVal < 50 || hcVal > 380) return res.status(400).json({ error: "CC deve estar entre 50 e 380 mm" });
  if (acVal < 40 || acVal > 400) return res.status(400).json({ error: "CA deve estar entre 40 e 400 mm" });
  if (flVal < 10 || flVal > 85) return res.status(400).json({ error: "CF deve estar entre 10 e 85 mm" });

  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });

  const gaW = gaWeeks !== undefined ? parseFloat(gaWeeks) : null;
  return res.json(estimatedFetalWeight({ hc: hcVal, ac: acVal, fl: flVal }, gaW));
});

// ── Doppler: Umbilical Artery ────────────────────────────────────────────────

router.post("/calculate/doppler/umbilical", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { ga, pi, ri, sd } = req.body ?? {};
  const gaVal = parseInt(ga);
  if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) {
    return res.status(400).json({ error: "IG deve estar entre 20 e 42 semanas" });
  }
  const piVal = pi !== undefined ? parseFloat(pi) : undefined;
  const riVal = ri !== undefined ? parseFloat(ri) : undefined;
  const sdVal = sd !== undefined ? parseFloat(sd) : undefined;
  if ((piVal === undefined || isNaN(piVal)) && (riVal === undefined || isNaN(riVal)) && (sdVal === undefined || isNaN(sdVal))) {
    return res.status(400).json({ error: "Informe ao menos um índice: IP, IR ou S/D" });
  }

  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });

  return res.json(evaluateUmbilicalArtery({ ga: gaVal, pi: piVal, ri: riVal, sd: sdVal }));
});

// ── Doppler: MCA ─────────────────────────────────────────────────────────────

router.post("/calculate/doppler/mca", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { ga, pi } = req.body ?? {};
  const gaVal = parseInt(ga);
  const piVal = parseFloat(pi);
  if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) return res.status(400).json({ error: "IG deve estar entre 20 e 42 semanas" });
  if (isNaN(piVal) || piVal <= 0) return res.status(400).json({ error: "Informe o IP da ACM" });

  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });

  return res.json(evaluateMCA({ ga: gaVal, pi: piVal }));
});

// ── Doppler: Uterine Artery ──────────────────────────────────────────────────

router.post("/calculate/doppler/uterine", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { ga, pi, bilateralNotch } = req.body ?? {};
  const gaVal = parseInt(ga);
  const piVal = parseFloat(pi);
  if (isNaN(gaVal) || gaVal < 11 || gaVal > 42) return res.status(400).json({ error: "IG deve estar entre 11 e 42 semanas" });
  if (isNaN(piVal) || piVal <= 0) return res.status(400).json({ error: "Informe o IP da artéria uterina" });

  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });

  return res.json(evaluateUterineArtery({ ga: gaVal, pi: piVal, bilateralNotch: !!bilateralNotch }));
});

// ── Doppler: CPR ─────────────────────────────────────────────────────────────

router.post("/calculate/doppler/cpr", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { ga, mcaPI, uaPI } = req.body ?? {};
  const gaVal = parseInt(ga);
  const mcaVal = parseFloat(mcaPI);
  const uaVal = parseFloat(uaPI);
  if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) return res.status(400).json({ error: "IG deve estar entre 20 e 42 semanas" });
  if (isNaN(mcaVal) || mcaVal <= 0) return res.status(400).json({ error: "Informe o IP da ACM" });
  if (isNaN(uaVal) || uaVal <= 0) return res.status(400).json({ error: "Informe o IP da AU" });

  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });

  return res.json(evaluateCPR({ ga: gaVal, mcaPI: mcaVal, uaPI: uaVal }));
});

// ── Doppler: Ductus Venosus ──────────────────────────────────────────────────

router.post("/calculate/doppler/ductus", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { ga, piv, waveAReversed } = req.body ?? {};
  const gaVal = parseInt(ga);
  if (isNaN(gaVal) || gaVal < 11 || gaVal > 42) {
    return res.status(400).json({ error: "IG deve estar entre 11 e 42 semanas" });
  }
  const pivVal = piv !== undefined ? parseFloat(piv) : undefined;

  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });

  return res.json(evaluateDuctusVenosus({
    ga: gaVal,
    piv: pivVal,
    waveAReversed: !!waveAReversed,
  }));
});

// ── Growth Curve ─────────────────────────────────────────────────────────────

router.post("/calculate/growth-curve", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { param, measurements } = req.body ?? {};
  if (!isValidGrowthParam(param)) {
    return res.status(400).json({ error: "Parâmetro inválido. Use: efw, hc, ac, fl ou bpd" });
  }
  if (!Array.isArray(measurements) || measurements.length === 0) {
    return res.status(400).json({ error: "Informe pelo menos uma medida" });
  }
  for (const m of measurements) {
    const ga = parseFloat(m.ga);
    const value = parseFloat(m.value);
    if (isNaN(ga) || isNaN(value)) {
      return res.status(400).json({ error: "Cada medida deve ter ga e value numéricos" });
    }
  }

  const ok = await deductToken(userId);
  if (!ok) return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });

  const results = (measurements as { ga: number; value: number }[]).map((m) =>
    assessGrowth(param, parseFloat(String(m.ga)), parseFloat(String(m.value)))
  );
  return res.json({ assessments: results });
});

export default router;
