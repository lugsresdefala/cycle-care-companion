import { useCallback, useState } from "react";
import { useSubscription } from "./useSubscription";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

// These calculators can be used without login/tokens (free mode, no data storage)
const FREE_CALCULATORS = ["gestational", "fertility"];

// These calculators require a professional or premium (clinical) plan tier.
// A basic (Modo Pessoal) subscription is not sufficient.
const CLINICAL_ONLY_CALCULATORS = [
  "trisomy_risk",
  "preeclampsia_risk",
  "efw",
  "doppler",
  "growth_curve",
];

const CLINICAL_TIERS = ["professional", "premium"];

export function useTokenGate(calculatorType?: string) {
  const { user } = useAuth();
  const { subscription, loading, consumeServerToken, refetch } = useSubscription();
  const [consuming, setConsuming] = useState(false);

  const isFreeCalculator = calculatorType ? FREE_CALCULATORS.includes(calculatorType) : false;

  const requiresClinicalTier = calculatorType
    ? CLINICAL_ONLY_CALCULATORS.includes(calculatorType)
    : false;

  const isExpired = (() => {
    if (!subscription?.end_date) return true;
    const end = new Date(subscription.end_date).getTime();
    return !Number.isFinite(end) || end < Date.now();
  })();

  // Tier is insufficient when a clinical calculator is requested but the
  // active subscription's plan tier is basic (or free_trial).
  const tierInsufficient =
    requiresClinicalTier &&
    !!subscription &&
    !isExpired &&
    !CLINICAL_TIERS.includes(subscription.tier);

  const blocked =
    !loading &&
    !isFreeCalculator &&
    (tierInsufficient || !subscription || subscription.tokens_remaining <= 0 || isExpired);

  const needsLogin = !user && !isFreeCalculator;

  const consumeToken = useCallback(async (): Promise<boolean> => {
    // Free calculators never consume tokens
    if (isFreeCalculator) {
      return true;
    }

    if (!user) {
      toast({ title: "Login necessário", description: "Faça login para usar as calculadoras.", variant: "destructive" });
      return false;
    }

    if (tierInsufficient) {
      toast({ title: "Plano insuficiente", description: "Esta calculadora requer um plano Clínico (Profissional ou Premium).", variant: "destructive" });
      return false;
    }

    if (blocked) {
      toast({ title: "Tokens esgotados", description: "Assine um plano para continuar usando as calculadoras.", variant: "destructive" });
      return false;
    }

    setConsuming(true);
    const ok = await consumeServerToken();
    setConsuming(false);
    if (!ok) {
      toast({ title: "Erro ao consumir token", description: "Tente novamente.", variant: "destructive" });
    }
    return ok;
  }, [user, blocked, tierInsufficient, consumeServerToken, isFreeCalculator]);

  return { blocked, needsLogin, consuming, loading, subscription, consumeToken, refetch, isFreeCalculator, tierInsufficient };
}
