import { describe, expect, it } from "vitest";
import {
  CALCULATOR_REQUEST_FIXTURES,
  createCalculatorResponseFixtures,
} from "./fixtures/calculatorResponses";
import {
  postCalculate,
} from "./helpers/calculateRouterHarness";

describe("calculate.ts calculator contracts", () => {
  it("rejects an unauthenticated calculator request at the auth boundary", async () => {
    const fixture = CALCULATOR_REQUEST_FIXTURES.cpr;
    const response = await postCalculate(fixture.path, fixture.body);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });

  it("returns 402 when the clinical subscription token gate rejects the user", async () => {
    const fixture = CALCULATOR_REQUEST_FIXTURES.cpr;
    const response = await postCalculate(fixture.path, fixture.body, {
      userId: "doctor-without-clinical-plan",
    });

    expect(response.status).toBe(402);
    expect(response.body.error).toMatch(/professional or premium subscription/i);
  });

  it("returns numeric CPR and its reference range from the real calculator", async () => {
    const fixture = CALCULATOR_REQUEST_FIXTURES.cpr;
    const expected = createCalculatorResponseFixtures().cpr;
    const response = await postCalculate(fixture.path, fixture.body, {
      userId: "doctor-cpr",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expected);
    expect(response.body.res.cpr).toBe(1.5);
    expect(response.body.refs).toEqual({ p5: 1.52, p50: 1.9, p95: 2.32 });
  });

  it("returns growth assessments and complete INTERGROWTH reference curves", async () => {
    const fixture = CALCULATOR_REQUEST_FIXTURES.growth;
    const response = await postCalculate(fixture.path, fixture.body, {
      userId: "doctor-growth",
    });

    expect(response.status).toBe(200);
    expect(response.body.assessments).toHaveLength(2);
    expect(response.body.assessments.map((item: any) => item.percentileLabel)).toEqual([
      "P10–P90",
      "P10–P90",
    ]);
    expect(response.body.curveData.find((row: any) => row.ga === 32)?.p50).toBe(1755);
    expect(response.body.curveData.find((row: any) => row.ga === 40)?.p50).toBe(3338);
    expect(response.body).toEqual(createCalculatorResponseFixtures().growth);
  });

  it.each([
    ["positive", 1, "Onda A positiva", "normal"],
    ["zero", 0, "Onda A ausente", "critical"],
    ["reversed", -1, "Onda A reversa", "critical"],
  ] as const)("returns the real DV result for wave A %s", async (waveA, value, percentile, severity) => {
    const fixture = CALCULATOR_REQUEST_FIXTURES.dv;
    const response = await postCalculate(fixture.path, fixture.states[waveA], {
      userId: "doctor-dv",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(createCalculatorResponseFixtures().dvByWaveA[waveA]);
    expect(response.body.pivResult).toMatchObject({ value: 0.7, severity: "critical" });
    expect(response.body.waveAResult).toMatchObject({
      value,
      percentile,
      severity,
    });
    expect(response.body.refs).toEqual({ p5: 0.24, p50: 0.4, p95: 0.64 });
  });

  it.each([
    { ga: 32, piv: 0.7, waveAReversed: true },
    { ga: 32, piv: 0.7, waveAReversed: false },
    { ga: 32, piv: 0.7, waveA: "zero", waveAReversed: false },
  ])("rejects the legacy DV waveAReversed contract", async (body) => {
    const response = await postCalculate(CALCULATOR_REQUEST_FIXTURES.dv.path, body, {
      userId: "doctor-dv-legacy",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Send waveA as positive, zero or reversed; waveAReversed is no longer accepted",
    });
  });

  it.each([
    ["/calculate/doppler/cpr", { ga: 19, mcaPi: 1.5, uaPi: 1 }, "ga must be a number between 20 and 42"],
    ["/calculate/doppler/cpr", { ga: 32, mcaPi: 1.5, uaPi: 0 }, "uaPi must be a positive number"],
    ["/calculate/growth-curve", { parameter: "efw", measurements: [] }, "parameter and measurements array are required"],
    ["/calculate/growth-curve", { parameter: "unknown", measurements: [{ ga: 32, value: 1 }] }, "Unknown growth parameter: unknown"],
  ])("returns 400 for invalid input to %s", async (path, body, error) => {
    const response = await postCalculate(path, body, { userId: "doctor-invalid" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error });
  });
});