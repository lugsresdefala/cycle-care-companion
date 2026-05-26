import { useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export type CheckoutStatus = "success" | "canceled" | null;

export const SUBSCRIPTION_REFRESH_EVENT = "idalia:subscription-refresh";

export function useCheckoutStatus() {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = (searchParams.get("checkout") as CheckoutStatus) ?? null;
  const sessionId = searchParams.get("session_id");

  const clearParams = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("checkout");
    next.delete("session_id");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!status) return;

    if (status === "canceled") {
      toast.error("Pagamento cancelado", {
        description: "Você cancelou o processo de pagamento. Nenhuma cobrança foi realizada.",
        duration: 6000,
      });
      clearParams();
      return;
    }

    if (status === "success") {
      toast.success("Assinatura realizada!", {
        description: "Seu pagamento foi processado com sucesso. Aproveite sua assinatura!",
        duration: 6000,
      });
      void (async () => {
        try { await apiFetch("/subscription/refresh", { method: "POST" }); }
        catch (err) { console.warn("[useCheckoutStatus] post-checkout sync failed", err); }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(SUBSCRIPTION_REFRESH_EVENT));
        }
      })();
      clearParams();
    }
  }, [status, clearParams]);

  return { status, sessionId };
}
