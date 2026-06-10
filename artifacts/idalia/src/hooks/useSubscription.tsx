import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { apiFetch } from "@/lib/api";
import { SUBSCRIPTION_REFRESH_EVENT } from "./useCheckoutStatus";

export interface SubscriptionInfo {
  id: string;
  status: string;
  plan_name: string;
  tier: string;
  tokens_remaining: number;
  tokens_used: number;
  end_date: string;
  trial_ends_at: string | null;
  features: string[];
}

interface SubscriptionState {
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  tokensRemaining: number;
  isTrial: boolean;
  trialEndsAt: string | null;
  status: string | null;
}

function toInfo(s: SubscriptionState | null): SubscriptionInfo | null {
  if (!s || (!s.subscribed && !s.isTrial)) return null;
  return {
    id: "",
    status: s.status ?? (s.isTrial ? "trial" : "active"),
    plan_name: s.subscriptionTier ?? "",
    tier: s.subscriptionTier ?? "",
    tokens_remaining: s.tokensRemaining,
    tokens_used: 0,
    end_date: s.subscriptionEnd ?? s.trialEndsAt ?? "",
    trial_ends_at: s.trialEndsAt,
    features: [],
  };
}

// Module-level so the one-time onboarding bootstrap runs once per signed-in
// user, not once per useSubscription mount (the hook is used in many
// components). Tracking the userId (rather than a boolean) re-runs bootstrap
// when the account changes, even without an intermediate signed-out state.
let bootstrappedUserId: string | null = null;

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const syncedRef = useRef(false);

  const fetchSubscription = useCallback(async () => {
    if (!user) { setSubscription(null); setLoading(false); return; }
    try {
      const s = await apiFetch<SubscriptionState>("/subscription");
      setSubscription(toInfo(s));
    } catch {
      setSubscription(null);
    }
    setLoading(false);
  }, [user]);

  const bootstrap = useCallback(async () => {
    if (!user) return;
    try {
      const s = await apiFetch<SubscriptionState>("/bootstrap", { method: "POST" });
      setSubscription(toInfo(s));
      setLoading(false);
    } catch {
      // Bootstrap didn't complete — clear the module flag so a later mount
      // retries provisioning instead of leaving a new user stranded at 0 tokens.
      bootstrappedUserId = null;
      await fetchSubscription();
    }
  }, [user, fetchSubscription]);

  const syncStripe = useCallback(async () => {
    if (!user) return;
    try {
      const s = await apiFetch<SubscriptionState>("/subscription/refresh", { method: "POST" });
      setSubscription(toInfo(s));
      setLoading(false);
    } catch {
      await fetchSubscription();
    }
  }, [user, fetchSubscription]);

  useEffect(() => {
    if (!user) { bootstrappedUserId = null; void fetchSubscription(); return; }
    if (bootstrappedUserId !== user.id) {
      bootstrappedUserId = user.id;
      void bootstrap();
    } else {
      void fetchSubscription();
    }
  }, [user, bootstrap, fetchSubscription]);

  useEffect(() => {
    if (!user) { syncedRef.current = false; return; }
    if (!syncedRef.current) {
      syncedRef.current = true;
      syncStripe();
    }
    const interval = setInterval(syncStripe, 60_000);
    return () => clearInterval(interval);
  }, [user, syncStripe]);

  useEffect(() => {
    const handler = () => { void syncStripe(); };
    window.addEventListener(SUBSCRIPTION_REFRESH_EVENT, handler);
    return () => window.removeEventListener(SUBSCRIPTION_REFRESH_EVENT, handler);
  }, [syncStripe]);

  const inFlightRef = useRef<Promise<boolean> | null>(null);

  const consumeServerToken = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    if (inFlightRef.current) return inFlightRef.current;
    const promise = (async () => {
      try {
        const r = await apiFetch<{ success: boolean; tokensRemaining: number }>("/tokens/use", { method: "POST" });
        if (r.success) await fetchSubscription();
        return !!r.success;
      } catch (err) {
        console.error("[useSubscription] use_token failed", err);
        return false;
      }
    })();
    inFlightRef.current = promise;
    try { return await promise; }
    finally { inFlightRef.current = null; }
  }, [user, fetchSubscription]);

  return { subscription, loading, consumeServerToken, refetch: fetchSubscription };
}
