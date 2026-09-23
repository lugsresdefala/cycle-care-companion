import {
  assessGrowthBatch,
  calculateCPR,
  evaluateDuctusVenosusPIV,
  evaluateDuctusVenosusWaveA,
  getCPRRefsForGA,
  getDVPivRefsForGA,
  getGrowthCurveData,
} from "@api/lib/premium-calculators";

export const CALCULATOR_REQUEST_FIXTURES = {
  cpr: {
    path: "/calculate/doppler/cpr",
    body: { ga: 32, mcaPi: 1.5, uaPi: 1 },
  },
  dv: {
    path: "/calculate/doppler/dv",
    body: { ga: 32, piv: 0.7, waveA: "reversed" as const },
    states: {
      positive: { ga: 32, piv: 0.7, waveA: "positive" as const },
      zero: { ga: 32, piv: 0.7, waveA: "zero" as const },
      reversed: { ga: 32, piv: 0.7, waveA: "reversed" as const },
    },
  },
  growth: {
    path: "/calculate/growth-curve",
    body: {
      parameter: "efw" as const,
      measurements: [
        { ga: 32, value: 1755 },
        { ga: 40, value: 3338 },
      ],
    },
  },
} as const;

/**
 * Shared, patient-free response fixtures for component and visual tests.
 * Values are produced by the same server-only calculator functions used by
 * calculate.ts rather than duplicated medical constants.
 */
export function createCalculatorResponseFixtures() {
  const cprRequest = CALCULATOR_REQUEST_FIXTURES.cpr.body;
  const dvRequest = CALCULATOR_REQUEST_FIXTURES.dv.body;
  const dvRequests = CALCULATOR_REQUEST_FIXTURES.dv.states;
  const growthRequest = CALCULATOR_REQUEST_FIXTURES.growth.body;
  const createDVResponse = (request: (typeof dvRequests)[keyof typeof dvRequests]) => ({
    pivResult: evaluateDuctusVenosusPIV(request.piv, request.ga),
    waveAResult: evaluateDuctusVenosusWaveA(request.waveA, request.ga),
    refs: getDVPivRefsForGA(request.ga),
  });

  return {
    cpr: {
      res: calculateCPR(cprRequest.mcaPi, cprRequest.uaPi, cprRequest.ga),
      refs: getCPRRefsForGA(cprRequest.ga),
    },
    dv: createDVResponse(dvRequest),
    dvByWaveA: {
      positive: createDVResponse(dvRequests.positive),
      zero: createDVResponse(dvRequests.zero),
      reversed: createDVResponse(dvRequests.reversed),
    },
    growth: {
      assessments: assessGrowthBatch(growthRequest.parameter, [...growthRequest.measurements]),
      curveData: getGrowthCurveData(growthRequest.parameter),
    },
  };
}

export type CalculatorResponseFixtures = ReturnType<typeof createCalculatorResponseFixtures>;