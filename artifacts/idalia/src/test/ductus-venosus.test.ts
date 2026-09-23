// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import { evaluateDuctusVenosusWaveA } from "../../../api-server/src/lib/premium-calculators";

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("../../../../lib/db/src/index", () => ({ db: { execute } }));
vi.mock("../../../api-server/src/lib/auth", () => ({
  requireAuth: (req: any, _res: any, next: () => void) => { req.userId = "test"; next(); },
}));
import router from "../../../api-server/src/routes/calculate";
const express = createRequire(new URL("../../../api-server/package.json", import.meta.url))("express");

describe("ductus venosus a-wave — ISUOG 2020 doi:10.1002/uog.22134", () => {
  it.each([12, 28, 40])("distinguishes all three states at %s weeks", (ga) => {
    expect(evaluateDuctusVenosusWaveA("positive", ga)).toMatchObject({ value: 1, severity: "normal", percentile: "Onda A positiva" });
    expect(evaluateDuctusVenosusWaveA("zero", ga)).toMatchObject({ value: 0, severity: "critical", percentile: "Onda A ausente" });
    expect(evaluateDuctusVenosusWaveA("reversed", ga)).toMatchObject({ value: -1, severity: "critical", percentile: "Onda A reversa" });
  });
  it("never defaults invalid evaluator input to normal", () => {
    expect(() => evaluateDuctusVenosusWaveA(undefined as any, 28)).toThrow();
  });
  it("preserves each state through HTTP and rejects ambiguous requests before charging", async () => {
    const app = express();
    app.use(express.json(), router);
    const server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address() as { port: number };
    const post = (body: object) => fetch(`http://127.0.0.1:${address.port}/calculate/doppler/dv`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ga: 28, piv: 0.4, ...body }),
    });
    try {
      execute.mockResolvedValue({ rows: [{ id: "subscription" }] });
      for (const waveA of ["positive", "zero", "reversed"] as const) {
        const response = await post({ waveA });
        expect(response.status).toBe(200);
        const result = await response.json();
        expect(result.waveAResult).toEqual(evaluateDuctusVenosusWaveA(waveA, 28));
        expect(result.pivResult.severity).toBe("normal");
      }
      execute.mockClear();
      for (const body of [{}, { waveA: null }, { waveA: true }, { waveA: "absent" }, { waveAReversed: false }, { waveAReversed: true }, { waveA: "zero", waveAReversed: false }]) {
        expect((await post(body)).status).toBe(400);
      }
      expect(execute).not.toHaveBeenCalled();
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});