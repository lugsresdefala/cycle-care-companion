import express from "../../../../api-server/node_modules/express/index.js";
import request from "supertest";
import { vi } from "vitest";

vi.mock("@api/lib/auth", () => ({
  requireAuth: (req: any, res: any, next: () => void) => {
    const userId = req.header("x-test-user");
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    req.userId = userId;
    next();
  },
}));

let appPromise: Promise<any> | undefined;

export function getCalculateTestApp() {
  appPromise ??= import("@api/routes/calculate").then(({ default: calculateRouter }) => {
    const app = express();
    app.use(express.json());
    app.use(calculateRouter);
    return app;
  });
  return appPromise;
}

export async function postCalculate(
  path: string,
  body: unknown,
  options: { userId?: string } = {},
) {
  const call = request(await getCalculateTestApp()).post(path).send(body);
  if (options.userId !== undefined) call.set("x-test-user", options.userId);
  return call;
}

export function installCalculateFetchBridge(userId: string | null = "calculator-ui-test") {
  const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const path = new URL(rawUrl, "http://calculator.test").pathname.replace(/^\/api/, "");
    const body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
    const response = await postCalculate(path, body, {
      userId: userId === null ? undefined : userId,
    });
    return new Response(JSON.stringify(response.body), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  });
  fetchSpy.mockClear();
  return fetchSpy;
}