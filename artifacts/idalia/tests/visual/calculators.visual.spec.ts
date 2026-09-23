import { expect, test, type Page } from "@playwright/test";
import {
  CALCULATOR_REQUEST_FIXTURES,
  createCalculatorResponseFixtures,
} from "../../src/test/fixtures/calculatorResponses";

const responses = createCalculatorResponseFixtures();

async function settle(page: Page) {
  await page.locator("main, body").first().waitFor({ state: "visible" });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(dimensions.document, "document must fit the viewport width").toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.body, "body must fit the viewport width").toBeLessThanOrEqual(dimensions.viewport);
}

async function mockDoppler(page: Page) {
  await page.route("**/api/calculate/doppler/**", async (route) => {
    const endpoint = new URL(route.request().url()).pathname;
    if (endpoint.endsWith("/cpr")) {
      await route.fulfill({ json: responses.cpr });
      return;
    }
    if (endpoint.endsWith("/dv")) {
      expect(route.request().postDataJSON()).toMatchObject(CALCULATOR_REQUEST_FIXTURES.dv.body);
      await route.fulfill({ json: responses.dv });
      return;
    }
    await route.abort("failed");
  });
}

test.describe("result components", () => {
  test("Doppler RCP result", async ({ page }) => {
    await mockDoppler(page);
    await page.goto("/visual/harness/index.html?page=doppler");
    await page.getByRole("tab", { name: "RCP" }).click();
    await page.getByPlaceholder("IG").fill(String(CALCULATOR_REQUEST_FIXTURES.cpr.body.ga));
    await page.getByPlaceholder("IP UA").fill(String(CALCULATOR_REQUEST_FIXTURES.cpr.body.uaPi));
    await page.getByPlaceholder("IP ACM").fill(String(CALCULATOR_REQUEST_FIXTURES.cpr.body.mcaPi));
    await page.getByRole("button", { name: "Avaliar RCP" }).click();
    await expect(page.getByText("1,50", { exact: true }).first()).toBeVisible();
    await settle(page);
    await expectNoHorizontalOverflow(page);
    await expect(page).toHaveScreenshot("doppler-rcp-result.png", { fullPage: true });
  });

  test("Doppler ductus venosus result", async ({ page }) => {
    await mockDoppler(page);
    await page.goto("/visual/harness/index.html?page=doppler");
    await page.getByRole("tab", { name: "Ducto Venoso" }).click();
    await page.getByPlaceholder("IG").fill(String(CALCULATOR_REQUEST_FIXTURES.dv.body.ga));
    await page.getByPlaceholder("IP DV").fill(String(CALCULATOR_REQUEST_FIXTURES.dv.body.piv));
    await expect(page.getByRole("button", { name: "Positiva" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ausente" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reversa" })).toBeVisible();
    await page.getByRole("button", { name: "Reversa" }).click();
    await page.getByRole("button", { name: "Avaliar Ducto" }).click();
    await expect(page.getByText("0,70", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("-1,00", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Onda A reversa", { exact: false })).toBeVisible();
    await settle(page);
    await expectNoHorizontalOverflow(page);
    await expect(page).toHaveScreenshot("doppler-dv-result.png", { fullPage: true });
  });

  test("growth curve and reference result", async ({ page }) => {
    await page.route("**/api/calculate/growth-curve", async (route) => {
      await route.fulfill({ json: responses.growth });
    });
    await page.goto("/visual/harness/index.html?page=growth");

    const gaInputs = page.getByPlaceholder("IG (sem)");
    const valueInputs = page.getByPlaceholder("PFE (g)");
    const measurements = CALCULATOR_REQUEST_FIXTURES.growth.body.measurements;
    await gaInputs.nth(0).fill(String(measurements[0].ga));
    await valueInputs.nth(0).fill(String(measurements[0].value));
    for (const measurement of measurements.slice(1)) {
      await page.getByRole("button", { name: "Adicionar medida" }).click();
      await gaInputs.last().fill(String(measurement.ga));
      await valueInputs.last().fill(String(measurement.value));
    }
    await page.getByRole("button", { name: "Plotar na Curva" }).click();
    await expect(page.getByText("Peso Fetal Estimado — Curva INTERGROWTH-21st")).toBeVisible();
    await expect(page.getByText("IG 32 sem — 1755 g")).toBeVisible();
    await expect(page.getByText("IG 40 sem — 3338 g")).toBeVisible();
    await settle(page);
    await expectNoHorizontalOverflow(page);
    await expect(page).toHaveScreenshot("growth-curve-reference-result.png", { fullPage: true });
  });
});