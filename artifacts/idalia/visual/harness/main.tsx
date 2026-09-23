import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import DopplerCalculator from "@/pages/DopplerCalculator";
import GrowthCurveCalculator from "@/pages/GrowthCurveCalculator";
import "@/index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function Harness() {
  const page = new URLSearchParams(window.location.search).get("page");
  const calculator = page === "growth" ? <GrowthCurveCalculator /> : <DopplerCalculator />;

  return (
    <React.StrictMode>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <TooltipProvider>{calculator}</TooltipProvider>
          </MemoryRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Harness />);