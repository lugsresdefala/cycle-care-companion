import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import DopplerCalculator from "@/pages/DopplerCalculator";
import GrowthCurveCalculator from "@/pages/GrowthCurveCalculator";
import {
  installCalculateFetchBridge,
} from "./helpers/calculateRouterHarness";

const tokenGate = vi.hoisted(() => ({
  blocked: false,
  needsLogin: false,
  subscription: {
    tier: "professional",
    tokens_remaining: 10,
    end_date: "2099-01-01T00:00:00.000Z",
  },
  refetch: vi.fn(),
}));

const toastSpy = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/useTokenGate", () => ({
  useTokenGate: () => tokenGate,
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: toastSpy,
}));

vi.mock("@/hooks/useExamSave", () => ({
  useExamSave: () => ({ saveExam: vi.fn(), canSave: false }),
}));

vi.mock("@/components/PatientSelector", () => ({
  PatientSelector: () => null,
}));

function renderCalculator(ui: React.ReactNode) {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <TooltipProvider>{ui}</TooltipProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("calculator pages against calculate.ts responses", () => {
  beforeEach(() => {
    tokenGate.blocked = false;
    tokenGate.needsLogin = false;
    tokenGate.subscription.tokens_remaining = 10;
    tokenGate.refetch.mockClear();
    toastSpy.mockClear();
    installCalculateFetchBridge();
  });

  it("renders numeric CPR, percentile and reference output returned by the router", async () => {
    const user = userEvent.setup();
    renderCalculator(<DopplerCalculator />);

    await user.click(screen.getByRole("tab", { name: "RCP" }));
    await user.type(screen.getByPlaceholderText("IG"), "32");
    await user.type(screen.getByPlaceholderText("IP UA"), "1");
    await user.type(screen.getByPlaceholderText("IP ACM"), "1.5");
    await user.click(screen.getByRole("button", { name: "Avaliar RCP" }));

    expect((await screen.findAllByText("1,50")).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("< p5")).toBeInTheDocument();
    expect(screen.getByText(/centralização fetal/i)).toBeInTheDocument();
    expect(screen.getByText("RCP", { selector: "span" })).toBeInTheDocument();
    expect(tokenGate.refetch).toHaveBeenCalledTimes(1);
  });

  it("plots router growth references and renders both official EFW p50 anchors", async () => {
    const user = userEvent.setup();
    renderCalculator(<GrowthCurveCalculator />);

    const gaInputs = screen.getAllByPlaceholderText("IG (sem)");
    await user.type(gaInputs[0], "32");
    await user.type(screen.getByPlaceholderText("PFE (g)"), "1755");
    await user.click(screen.getByRole("button", { name: "Adicionar medida" }));
    const nextGaInputs = screen.getAllByPlaceholderText("IG (sem)");
    const valueInputs = screen.getAllByPlaceholderText("PFE (g)");
    await user.type(nextGaInputs[1], "40");
    await user.type(valueInputs[1], "3338");
    await user.click(screen.getByRole("button", { name: "Plotar na Curva" }));

    expect(await screen.findByText("IG 32 sem — 1755 g")).toBeInTheDocument();
    expect(screen.getByText("IG 40 sem — 3338 g")).toBeInTheDocument();
    expect(screen.getAllByText("P10–P90")).toHaveLength(2);
    expect(screen.getByText("Peso Fetal Estimado — Curva INTERGROWTH-21st")).toBeInTheDocument();
    expect(screen.getByText("P50: 1755")).toBeInTheDocument();
    expect(screen.getByText("P50: 3338")).toBeInTheDocument();
    expect(tokenGate.refetch).toHaveBeenCalledTimes(1);
  });

  it("validates growth input client-side without invoking the router", async () => {
    const user = userEvent.setup();
    renderCalculator(<GrowthCurveCalculator />);

    await user.type(screen.getByPlaceholderText("IG (sem)"), "21");
    await user.type(screen.getByPlaceholderText("PFE (g)"), "500");
    await user.click(screen.getByRole("button", { name: "Plotar na Curva" }));

    expect(await screen.findByText("IG deve estar entre 22 e 40 semanas.")).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(tokenGate.refetch).not.toHaveBeenCalled();
  });

  it("handles a real Doppler 402 response without rendering a success result", async () => {
    installCalculateFetchBridge("doctor-without-clinical-plan");
    const user = userEvent.setup();
    renderCalculator(<DopplerCalculator />);

    await user.click(screen.getByRole("tab", { name: "RCP" }));
    await user.type(screen.getByPlaceholderText("IG"), "32");
    await user.type(screen.getByPlaceholderText("IP UA"), "1");
    await user.type(screen.getByPlaceholderText("IP ACM"), "1.5");
    await user.click(screen.getByRole("button", { name: "Avaliar RCP" }));

    await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: "Tokens esgotados",
      variant: "destructive",
    })));
    expect(screen.queryByText("1,50")).not.toBeInTheDocument();
    expect(tokenGate.refetch).not.toHaveBeenCalled();
  });

  it("handles a real Growth 401 response without rendering curve results", async () => {
    installCalculateFetchBridge(null);
    const user = userEvent.setup();
    renderCalculator(<GrowthCurveCalculator />);

    await user.type(screen.getByPlaceholderText("IG (sem)"), "32");
    await user.type(screen.getByPlaceholderText("PFE (g)"), "1755");
    await user.click(screen.getByRole("button", { name: "Plotar na Curva" }));

    await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: "Erro ao calcular",
      variant: "destructive",
    })));
    expect(screen.queryByText("Peso Fetal Estimado — Curva INTERGROWTH-21st")).not.toBeInTheDocument();
    expect(tokenGate.refetch).toHaveBeenCalledTimes(1);
  });

  it("handles a Doppler network failure without a stale result or token refetch", async () => {
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new TypeError("Network unavailable"));
    const user = userEvent.setup();
    renderCalculator(<DopplerCalculator />);

    await user.click(screen.getByRole("tab", { name: "RCP" }));
    await user.type(screen.getByPlaceholderText("IG"), "32");
    await user.type(screen.getByPlaceholderText("IP UA"), "1");
    await user.type(screen.getByPlaceholderText("IP ACM"), "1.5");
    await user.click(screen.getByRole("button", { name: "Avaliar RCP" }));

    await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: "Erro ao calcular",
      variant: "destructive",
    })));
    expect(screen.queryByText("1,50")).not.toBeInTheDocument();
    expect(tokenGate.refetch).not.toHaveBeenCalled();
  });

  it.each([
    ["Positiva", "1,00", "Onda A positiva"],
    ["Ausente", "0,00", "Onda A ausente"],
    ["Reversa", "-1,00", "Onda A reversa"],
  ] as const)("renders the real router DV %s wave-A response", async (buttonName, value, percentile) => {
    const user = userEvent.setup();
    renderCalculator(<DopplerCalculator />);

    await user.click(screen.getByRole("tab", { name: "Ducto Venoso" }));
    await user.type(screen.getByPlaceholderText("IG"), "32");
    await user.type(screen.getByPlaceholderText("IP DV"), "0.7");
    await user.click(screen.getByRole("button", { name: buttonName }));
    await user.click(screen.getByRole("button", { name: "Avaliar Ducto" }));

    expect((await screen.findAllByText("0,70")).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(value)).toBeInTheDocument();
    expect(screen.getByText(percentile)).toBeInTheDocument();
    expect(screen.getByText("p95 · 0,64")).toBeInTheDocument();
    expect(tokenGate.refetch).toHaveBeenCalledTimes(1);
  });

  it("disables premium calculation and shows login guidance when unauthorized", async () => {
    tokenGate.needsLogin = true;
    renderCalculator(<GrowthCurveCalculator />);

    expect(screen.getByText("Login necessário")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Plotar na Curva" })).toBeDisabled();
  });

  it("disables premium calculation when subscription access is blocked", async () => {
    tokenGate.blocked = true;
    tokenGate.subscription.tokens_remaining = 0;
    renderCalculator(<DopplerCalculator />);

    expect(screen.getByText("Tokens esgotados")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Avaliar" })).toBeDisabled();
    await waitFor(() => expect(globalThis.fetch).not.toHaveBeenCalled());
  });

  it("resets inputs and results when clicking 'Limpar cálculo' in Growth Curve", async () => {
    const user = userEvent.setup();
    renderCalculator(<GrowthCurveCalculator />);

    const gaInputs = screen.getAllByPlaceholderText("IG (sem)");
    await user.type(gaInputs[0], "32");
    await user.type(screen.getByPlaceholderText("PFE (g)"), "1755");
    await user.click(screen.getByRole("button", { name: "Plotar na Curva" }));

    expect(await screen.findByText("IG 32 sem — 1755 g")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Limpar cálculo" }));

    expect(screen.queryByText("IG 32 sem — 1755 g")).not.toBeInTheDocument();
    expect(screen.getAllByPlaceholderText("IG (sem)")[0]).toHaveValue(null);
    expect(screen.getByPlaceholderText("PFE (g)")).toHaveValue(null);
  });
});