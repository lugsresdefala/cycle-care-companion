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
  getEFWPercentiles,
  dueDateFromGA,
  assessGrowth,
  getGrowthData,
  isValidCRL,
  isValidBPD,
  type GrowthParameter,
} from "../lib/biometry-calculators";
import {
  evaluateUmbilicalArteryPI,
  evaluateUmbilicalArteryRI,
  evaluateUmbilicalArterySDRatio,
  evaluateMCAPI,
  evaluateUterineArteryPI,
  calculateCPR,
  evaluateDuctusVenosusPIV,
  evaluateDuctusVenosusWaveA,
} from "../lib/doppler-calculators";

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

// ── Existing server-computed risk calculators ──────────────────────────────

router.post("/calculate/trisomy-risk", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  let result;
  try {
    result = calculateTrisomyRisk(req.body as TrisomyInput);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }
  const ok = await deductToken(userId);
  if (!ok) {
    return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  }
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
  if (!ok) {
    return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  }
  return res.json(result);
});

// ── Biometry (CRL / BPD / Composite) ──────────────────────────────────────

router.post("/calculate/biometry", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { mode, crl, bpd, hc, ac, fl } = req.body ?? {};

  let result: any;
  try {
    if (mode === "crl") {
      const value = parseFloat(crl);
      if (isNaN(value)) return res.status(400).json({ error: "CCN inválido." });
      if (!isValidCRL(value)) return res.status(400).json({ error: "CCN deve estar entre 2 e 84 mm." });
      const ga = gestationalAgeFromCRL(value);
      result = { ...ga, dueDate: dueDateFromGA(ga.totalDays).toISOString() };
    } else if (mode === "bpd") {
      const value = parseFloat(bpd);
      if (isNaN(value)) return res.status(400).json({ error: "DBP inválido." });
      if (!isValidBPD(value)) return res.status(400).json({ error: "DBP deve estar entre 14 e 100 mm." });
      const ga = gestationalAgeFromBPD(value);
      result = { ...ga, dueDate: dueDateFromGA(ga.totalDays).toISOString() };
    } else if (mode === "composite") {
      const params = {
        bpd: bpd != null ? parseFloat(bpd) : undefined,
        hc: hc != null ? parseFloat(hc) : undefined,
        ac: ac != null ? parseFloat(ac) : undefined,
        fl: fl != null ? parseFloat(fl) : undefined,
      };
      const ga = gestationalAgeFromMultipleBiometry(params);
      if (ga.estimates.length === 0) return res.status(400).json({ error: "Valores fora do intervalo aceitável ou nenhuma medida fornecida." });
      result = { ...ga, dueDate: dueDateFromGA(ga.totalDays).toISOString() };
    } else {
      return res.status(400).json({ error: "Modo inválido. Use crl, bpd ou composite." });
    }
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }

  const ok = await deductToken(userId);
  if (!ok) {
    return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  }
  return res.json(result);
});

// ── Estimated Fetal Weight ─────────────────────────────────────────────────

router.post("/calculate/efw", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { hc, ac, fl, gaWeeks } = req.body ?? {};

  let result: any;
  try {
    const hcVal = parseFloat(hc);
    const acVal = parseFloat(ac);
    const flVal = parseFloat(fl);

    if (isNaN(hcVal) || isNaN(acVal) || isNaN(flVal)) return res.status(400).json({ error: "CC, CA e CF são obrigatórios." });
    if (hcVal < 50 || hcVal > 380) return res.status(400).json({ error: "CC deve estar entre 50 e 380 mm." });
    if (acVal < 40 || acVal > 400) return res.status(400).json({ error: "CA deve estar entre 40 e 400 mm." });
    if (flVal < 10 || flVal > 85) return res.status(400).json({ error: "CF deve estar entre 10 e 85 mm." });

    const efw = estimatedFetalWeight({ hc: hcVal, ac: acVal, fl: flVal });
    const gaW = gaWeeks != null ? parseFloat(gaWeeks) : null;
    const percentiles = gaW !== null && !isNaN(gaW) ? getEFWPercentiles(gaW) : null;

    let percentileRange: string;
    if (percentiles) {
      if (efw.weightG < percentiles.p10) percentileRange = "Abaixo do percentil 10 — avaliar CIUR";
      else if (efw.weightG > percentiles.p90) percentileRange = "Acima do percentil 90 — avaliar macrossomia";
      else percentileRange = "Entre percentis 10 e 90 — Adequado para IG (AIG)";
    } else if (gaW !== null && !isNaN(gaW)) {
      percentileRange = "Percentil indisponível — padrão INTERGROWTH-21st definido para IG 22–40 semanas";
    } else {
      percentileRange = "Informe a IG (22–40 semanas) para classificação por percentil";
    }

    result = { ...efw, percentileRange, percentiles };
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }

  const ok = await deductToken(userId);
  if (!ok) {
    return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  }
  return res.json(result);
});

// ── Doppler Velocimetry ────────────────────────────────────────────────────

router.post("/calculate/doppler", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { mode, ga, pi, ri, sd, mcaPi, uaPi, notch, piv, waveAReversed } = req.body ?? {};

  let result: any;
  try {
    const gaVal = parseInt(ga);

    if (mode === "umbilical") {
      if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) return res.status(400).json({ error: "IG deve estar entre 20 e 42 semanas." });
      const piVal = pi != null ? parseFloat(pi) : NaN;
      const riVal = ri != null ? parseFloat(ri) : NaN;
      const sdVal = sd != null ? parseFloat(sd) : NaN;
      if (isNaN(piVal) && isNaN(riVal) && isNaN(sdVal)) return res.status(400).json({ error: "Informe ao menos um índice: IP, IR ou S/D." });
      const piResult = !isNaN(piVal) ? evaluateUmbilicalArteryPI(piVal, gaVal) : undefined;
      result = {
        piResult: piResult ? { value: piResult.value, percentile: piResult.percentile, interpretation: piResult.interpretation, severity: piResult.severity } : undefined,
        riResult: !isNaN(riVal) ? evaluateUmbilicalArteryRI(riVal) : undefined,
        sdResult: !isNaN(sdVal) ? evaluateUmbilicalArterySDRatio(sdVal, gaVal) : undefined,
        refs: piResult?.refs ?? evaluateUmbilicalArteryPI(isNaN(piVal) ? 1 : piVal, gaVal).refs,
      };
    } else if (mode === "mca") {
      const piVal = parseFloat(pi);
      if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) return res.status(400).json({ error: "IG entre 20 e 42 semanas." });
      if (isNaN(piVal) || piVal <= 0) return res.status(400).json({ error: "Informe o IP da ACM." });
      const r = evaluateMCAPI(piVal, gaVal);
      result = { res: { value: r.value, percentile: r.percentile, interpretation: r.interpretation, severity: r.severity }, refs: r.refs };
    } else if (mode === "uterine") {
      const piVal = parseFloat(pi);
      if (isNaN(gaVal) || gaVal < 11 || gaVal > 42) return res.status(400).json({ error: "IG entre 11 e 42 semanas." });
      if (isNaN(piVal) || piVal <= 0) return res.status(400).json({ error: "Informe o IP da artéria uterina." });
      const r = evaluateUterineArteryPI(piVal, gaVal, !!notch);
      result = { res: { value: r.value, percentile: r.percentile, interpretation: r.interpretation, severity: r.severity }, refs: r.refs };
    } else if (mode === "cpr") {
      const mcaVal = parseFloat(mcaPi);
      const uaVal = parseFloat(uaPi);
      if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) return res.status(400).json({ error: "IG entre 20 e 42 semanas." });
      if (isNaN(mcaVal) || mcaVal <= 0) return res.status(400).json({ error: "Informe o IP da ACM." });
      if (isNaN(uaVal) || uaVal <= 0) return res.status(400).json({ error: "Informe o IP da AU." });
      const r = calculateCPR(mcaVal, uaVal, gaVal);
      result = { res: { cpr: r.cpr, mcaPI: r.mcaPI, uaPI: r.uaPI, percentile: r.percentile, interpretation: r.interpretation, severity: r.severity }, refs: r.refs };
    } else if (mode === "ductus") {
      if (isNaN(gaVal) || gaVal < 11 || gaVal > 42) return res.status(400).json({ error: "Informe a IG entre 11 e 42 semanas." });
      const pivVal = piv != null ? parseFloat(piv) : NaN;
      const waveAResult = evaluateDuctusVenosusWaveA(!!waveAReversed, gaVal);
      let pivResult: any = undefined;
      let refs: any = undefined;
      if (!isNaN(pivVal) && pivVal > 0) {
        const r = evaluateDuctusVenosusPIV(pivVal, gaVal);
        pivResult = { value: r.value, percentile: r.percentile, interpretation: r.interpretation, severity: r.severity };
        if (gaVal >= 20) refs = r.refs;
      }
      result = { pivResult, waveAResult, refs };
    } else {
      return res.status(400).json({ error: "Modo inválido." });
    }
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }

  const ok = await deductToken(userId);
  if (!ok) {
    return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  }
  return res.json(result);
});

// ── Growth Curve Assessment ────────────────────────────────────────────────

router.post("/calculate/growth-curve", requireAuth, async (req, res): Promise<any> => {
  const userId = (req as AuthedRequest).userId;
  const { param, measurements } = req.body ?? {};

  let result: any;
  try {
    const validParams: GrowthParameter[] = ["efw", "hc", "ac", "fl", "bpd"];
    if (!validParams.includes(param)) return res.status(400).json({ error: "Parâmetro inválido." });
    if (!Array.isArray(measurements) || measurements.length === 0) return res.status(400).json({ error: "Insira pelo menos uma medida válida." });

    const assessments = (measurements as { ga: number; value: number }[]).map((m) =>
      assessGrowth(param as GrowthParameter, m.ga, m.value),
    );
    const curveData = getGrowthData(param as GrowthParameter);
    result = { assessments, curveData };
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Calculation error" });
  }

  const ok = await deductToken(userId);
  if (!ok) {
    return res.status(402).json({ error: "Active subscription with available tokens required for premium calculators" });
  }
  return res.json(result);
});

export default router;
