import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Check, Crown, User, Stethoscope, Gift,
  Loader2, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { STRIPE_TIERS } from "@/lib/stripe-config";

interface Plan {
  id: string;
  name: string;
  tier: string;
  description: string;
  price_cents: number;
  duration_months: number;
  tokens_per_period: number;
  features: string[];
  stripe_price_id: string;
}

const featureLabels: Record<string, string> = {
  biometry: "Biometria Fetal",
  gestational: "Idade Gestacional",
  fertility: "Ciclo / Fertilidade",
  bpd: "DBP",
  crl: "CRL",
  efw: "PFE",
  doppler: "Doppler",
  growth_curve: "Curvas de Crescimento",
};

const modeConfig = [
  {
    mode: "free",
    label: "Gratuito",
    icon: Gift,
    accent: "text-emerald-500",
    badge: null,
    features: [
      "Calculadora de Fertilidade",
      "Calculadora de Idade Gestacional",
      "Resultado na tela (sem armazenamento)",
      "Sem necessidade de cadastro",
    ],
    price: "Grátis",
    sub: "para sempre",
    cta: null,
  },
  {
    mode: "personal",
    label: "Modo Pessoal",
    icon: User,
    accent: "text-primary",
    badge: null,
    tiers: ["basic"],
    extraFeatures: ["Histórico pessoal de cálculos", "Salvar resultados"],
  },
  {
    mode: "clinical",
    label: "Modo Clínico",
    icon: Stethoscope,
    accent: "text-accent",
    badge: "Profissional",
    tiers: ["professional", "premium"],
    extraFeatures: [
      "Gestão de pacientes múltiplos",
      "Prontuário por paciente",
      "Todas as calculadoras",
    ],
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .neq("tier", "free_trial")
      .order("price_cents", { ascending: true })
      .then(({ data }) => setPlans((data as Plan[]) ?? []));
  }, []);

  const handleCheckout = async (plan: Plan) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!plan.stripe_price_id) {
      toast.error("Preço não configurado para este plano.");
      return;
    }

    setLoading(plan.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: plan.stripe_price_id },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar sessão de pagamento.");
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Erro ao abrir portal de gerenciamento.");
    }
  };

  const getPlansForTiers = (tiers: string[]) =>
    plans.filter((p) => tiers.includes(p.tier));

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

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-10">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
            Escolha como usar a Idalia
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Comece grátis com as calculadoras básicas. Evolua para o modo Pessoal ou Clínico conforme sua necessidade.
          </p>
        </div>

        {/* Subscription management for existing subscribers */}
        {subscription && (
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={handleManageSubscription}>
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Gerenciar assinatura
            </Button>
          </div>
        )}

        <div className="space-y-8">
          {modeConfig.map((mode, mi) => {
            const Icon = mode.icon;
            const modePlans = mode.tiers ? getPlansForTiers(mode.tiers) : [];

            return (
              <motion.section
                key={mode.mode}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: mi * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${mode.accent}`} />
                  <h2 className="font-display text-lg font-semibold text-foreground">{mode.label}</h2>
                  {mode.badge && (
                    <Badge variant="secondary" className="text-xs">{mode.badge}</Badge>
                  )}
                </div>

                {/* Free tier card */}
                {mode.mode === "free" && (
                  <div className="glass-card-static p-6 max-w-md space-y-4">
                    <div>
                      <span className="font-display text-2xl font-bold text-foreground">Grátis</span>
                      <span className="text-xs text-muted-foreground ml-1">para sempre</span>
                    </div>
                    <div className="space-y-2">
                      {mode.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" onClick={() => navigate("/calculadora-gestacional")} className="w-full" size="sm">
                      Usar agora
                    </Button>
                  </div>
                )}

                {/* Paid plan cards */}
                {modePlans.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {modePlans.map((plan, pi) => {
                      const isCurrent = subscription?.plan_name === plan.name;
                      const isPremium = plan.tier === "premium";

                      return (
                        <motion.div
                          key={plan.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: mi * 0.1 + pi * 0.06, duration: 0.4 }}
                          className={`glass-card-static p-6 space-y-4 flex flex-col ${
                            isPremium ? "border-accent/30" : ""
                          } ${isCurrent ? "ring-2 ring-accent/40" : ""}`}
                        >
                          {isCurrent && (
                            <Badge className="w-fit text-xs bg-accent/15 text-accent border-accent/30">
                              Plano atual
                            </Badge>
                          )}
                          {isPremium && !isCurrent && (
                            <Badge variant="secondary" className="w-fit text-xs">
                              <Crown className="w-3 h-3 mr-1" /> Mais completo
                            </Badge>
                          )}

                          <div>
                            <h3 className="font-display text-base font-semibold text-foreground">{plan.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                          </div>

                          <div>
                            <span className="font-display text-2xl font-bold text-foreground">
                              R$ {(plan.price_cents / 100).toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-xs text-muted-foreground">/mês</span>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{plan.tokens_per_period}</span> cálculos/mês
                          </p>

                          <div className="flex-1 space-y-1.5">
                            {mode.extraFeatures?.map((f) => (
                              <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Check className="w-3 h-3 text-primary shrink-0" />
                                {f}
                              </div>
                            ))}
                            {(Array.isArray(plan.features) ? plan.features : []).map((f) => (
                              <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Check className="w-3 h-3 text-primary shrink-0" />
                                {featureLabels[f] || f}
                              </div>
                            ))}
                          </div>

                          <Button
                            onClick={() => handleCheckout(plan)}
                            disabled={isCurrent || loading === plan.id}
                            variant={isPremium ? "default" : "outline"}
                            className="w-full"
                            size="sm"
                          >
                            {loading === plan.id && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                            {isCurrent ? "Plano atual" : "Assinar"}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.section>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Pricing;
