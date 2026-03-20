import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

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

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) { setSubscription(null); setLoading(false); return; }

    const { data } = await supabase
      .from("user_subscriptions")
      .select("*, subscription_plans(*)")
      .eq("doctor_id", user.id)
      .in("status", ["active", "trial"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      const plan = data.subscription_plans as any;
      setSubscription({
        id: data.id,
        status: data.status,
        plan_name: plan?.name ?? "",
        tier: plan?.tier ?? "",
        tokens_remaining: data.tokens_remaining,
        tokens_used: data.tokens_used,
        end_date: data.end_date,
        trial_ends_at: data.trial_ends_at,
        features: Array.isArray(plan?.features) ? plan.features : [],
      });
    } else {
      setSubscription(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const canUseCalculator = (calcType: string): boolean => {
    if (!subscription) return false;
    if (subscription.tokens_remaining <= 0) return false;
    if (new Date(subscription.end_date) < new Date()) return false;
    return subscription.features.includes(calcType);
  };

  const useToken = async (): Promise<boolean> => {
    if (!user) return false;
    const { data } = await supabase.rpc("use_token", { _user_id: user.id });
    if (data) await fetchSubscription();
    return !!data;
  };

  return { subscription, loading, canUseCalculator, useToken, refetch: fetchSubscription };
}
