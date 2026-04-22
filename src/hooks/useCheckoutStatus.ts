import { useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type CheckoutStatus = "success" | "canceled" | null;

// Broadcast channel name used to tell useSubscription to force-refresh
// immediately after a successful checkout, so the UI reflects the new plan
// without waiting for the 60-second Stripe sync poll.
export const SUBSCRIPTION_REFRESH_EVENT = "idalia:subscription-refresh";

/**
 * Detects checkout status from URL query params after Stripe redirect.
 * On success, triggers a Stripe->DB sync and dispatches an event so any
 * mounted useSubscription instance refetches immediately.
 */
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

      // Force-sync with Stripe in case the webhook is briefly delayed. The
      // event then tells useSubscription to refetch from the DB. Best-effort:
      // the normal 60-second poll will recover from any failure here.
      void (async () => {
        try {
          await supabase.functions.invoke("check-subscription");
        } catch (err) {
          console.warn("[useCheckoutStatus] post-checkout sync failed", err);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(SUBSCRIPTION_REFRESH_EVENT));
        }
      })();

      clearParams();
    }
  }, [status, clearParams]);

  return { status, sessionId };
}
