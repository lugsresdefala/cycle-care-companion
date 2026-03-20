import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Crown, Coins, Zap } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

interface Plan {
  id: string;
  name: string;
  tier: string;
  description: string;
  price_cents: number;
  duration_months: number;
  tokens_per_period: number;
  features: string[];
}

const tierIcon: Record<string, typeof Crown> = {
  basic: Zap,
  professional: Coins,
  premium: Crown,
};

const tierStyle: Record<string, string> = {
  basic: "glass-card-blue",
  professional: "glass-card-purple",
  premium: "glass-card-warm",
};

const Pricing = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    supabase
      .from("subscription_plans")
      .select("*")
      .neq("tier", "free_trial")
      .order("price_cents", { ascending: true })
      .then(({ data }) => setPlans((data as Plan[]) ?? []));
  }, []);

  const featureLabels: Record<string, string> = {
    biometry: "Biometria",
    gestational: "Idade Gestacional",
    fertility: "Ciclo Menstrual",
    bpd: "DBP",
    crl: "CRL",
    efw: "PFE",
    doppler: "Doppler",
    growth_curve: "Curva de Crescimento",
  };

  const handleSelect = async (plan: Plan) => {
    if (!user) { navigate("/auth"); return; }
    // TODO: Stripe checkout integration
    toast.info("Integracao com Stripe sera ativada em breve. Por enquanto, o plano de teste esta ativo.");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-2xl shadow-nav">
        <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <img src={logo} alt="" className="w-7 h-7 rounded-full object-cover" />
          <span className="font-display text-sm font-semibold text-foreground">Planos</span>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">Escolha seu plano</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Todos os planos incluem tokens de uso por periodo. Recursos fetais avancados exclusivos do plano Premium.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan, i) => {
            const Icon = tierIcon[plan.tier] || Zap;
            const style = tierStyle[plan.tier] || "glass-card";
            const isCurrent = subscription?.plan_name === plan.name;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`${style} p-5 space-y-4 flex flex-col`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="font-display text-sm font-semibold text-foreground">{plan.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>

                <div>
                  <span className="font-display text-2xl font-bold text-foreground">
                    R$ {(plan.price_cents / 100).toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    /{plan.duration_months === 1 ? "mes" : `${plan.duration_months} meses`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <Coins className="w-3.5 h-3.5 text-accent" />
                  <span className="font-medium text-foreground">{plan.tokens_per_period} tokens</span>
                </div>

                <div className="flex-1 space-y-1.5">
                  {(Array.isArray(plan.features) ? plan.features : []).map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-primary shrink-0" />
                      {featureLabels[f] || f}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSelect(plan)}
                  disabled={isCurrent}
                  variant={plan.tier === "premium" ? "default" : "outline"}
                  className="w-full"
                  size="sm"
                >
                  {isCurrent ? "Plano atual" : "Assinar"}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Pricing;
