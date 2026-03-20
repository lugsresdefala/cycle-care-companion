import { useCallback, useState } from "react";
import { useSubscription } from "./useSubscription";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export function useTokenGate() {
  const { user } = useAuth();
  const { subscription, loading, useToken, refetch } = useSubscription();
  const [consuming, setConsuming] = useState(false);

  const blocked = !loading && (!subscription || subscription.tokens_remaining <= 0 || new Date(subscription.end_date) < new Date());
  const needsLogin = !user;

  const consumeToken = useCallback(async (): Promise<boolean> => {
    if (!user) {
      toast({ title: "Login necessário", description: "Faça login para usar as calculadoras.", variant: "destructive" });
      return false;
    }
    if (blocked) {
      toast({ title: "Tokens esgotados", description: "Assine um plano para continuar usando as calculadoras.", variant: "destructive" });
      return false;
    }
    setConsuming(true);
    const ok = await useToken();
    setConsuming(false);
    if (!ok) {
      toast({ title: "Erro ao consumir token", description: "Tente novamente.", variant: "destructive" });
    }
    return ok;
  }, [user, blocked, useToken]);

  return { blocked, needsLogin, consuming, loading, subscription, consumeToken, refetch };
}
