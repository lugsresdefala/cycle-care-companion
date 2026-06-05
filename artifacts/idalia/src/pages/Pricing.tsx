import { useEffect, useState } from "react";
import { PageMeta } from "@/components/PageMeta";
import { apiFetch, ApiError } from "@/lib/api";
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
import { useCheckoutStatus } from "@/hooks/useCheckoutStatus";
import JsonLd from "@/components/JsonLd";

const PRICING_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://idcalc.com/pricing",
  "url": "https://idcalc.com/pricing",
  "name": "Planos — IDALIA Calc",
  "description": "Escolha entre os planos gratuito, pessoal e clínico da IDALIA Calc para acesso às calculadoras de saúde reprodutiva e medicina fetal.",
  "isPartOf": { "@id": "https://idcalc.com/#website" },
  "inLanguage": "pt-BR"
};

interface Plan {
  id: string;
  name: string;
  tier: string;
  description: string;
  priceCents: number;
  durationMonths: number;
  tokensPerPeriod: number;
  features: string[];
  stripePriceId: string | null;
}

const featureLabels: Record<string, string> = {
  biometry: "Biometria Fetal (CCN, DBP, Composta)",
  gestational: "Idade Gestacional",
  fertility: "Ciclo / Fertilidade",
  efw: "Peso Fetal Estimado (PFE)",
  doppler: "Doppler Obstétrico",
  growth_curve: "Curvas de Crescimento",
  trisomy_risk: "Risco de Trissomias",
  preeclampsia_risk: "Risco de Pré-Eclâmpsia",
};

const modeConfig = [
  {
    mode: "free",
    label: "Gratuito",
    icon: Gift,
    accent: "text-emerald-500",
    badge: null as string | null,
    features: [
      "Calculadora de Fertilidade",
      "Calculadora de Idade Gestacional",
      "Resultado na tela (sem armazenamento)",
      "Sem necessidade de cadastro",
    ],
  },
  {
    mode: "personal",
    label: "Modo Pessoal",
    icon: User,
    accent: "text-primary",
    badge: null as string | null,
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
  useCheckoutStatus();

  useEffect(() => {
    apiFetch<Plan[]>("/plans")
      .then((data) => setPlans((data ?? []).filter((p) => p.tier !== "free_trial").sort((a, b) => a.priceCents - b.priceCents)))
      .catch(() => setPlans([]));
  }, []);

  const handleCheckout = async (plan: Plan) => {
    if (!user) {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "") || "";
      navigate(`${base}/sign-in`);
      return;
    }
    if (!plan.stripePriceId) {
      toast.error("Preço não configurado para este plano.");
      return;
    }
    setLoading(plan.id);
    try {
      const data = await apiFetch<{ url: string }>("/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ priceId: plan.stripePriceId }),
      });
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      const message = err instanceof ApiError && err.body?.error ? err.body.error : "Erro ao criar sessão de pagamento.";
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const data = await apiFetch<{ url: string }>("/stripe/portal", { method: "POST" });
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      const message = err instanceof ApiError && err.body?.error ? err.body.error : "Erro ao abrir portal de gerenciamento.";
      toast.error(message);
    }
  };

  const getPlansForTiers = (tiers: string[]) =>
    plans.filter((p) => tiers.includes(p.tier));

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Planos e Preços"
        description="Conheça os planos do IDALIA Calc: acesso gratuito e premium a calculadoras obstétricas baseadas em evidências para profissionais de saúde."
        path="/pricing"
      />
      <JsonLd data={PRICING_SCHEMA as Record<string, unknown>} />
      <header className="border-b border-border/60 bg-card/20">
        <div className="container max-w-5xl mx-auto px-4 h-12 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
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

        {subscription && subscription.status === "active" && (
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
            const modePlans = (mode as any).tiers ? getPlansForTiers((mode as any).tiers) : [];

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

                {mode.mode === "free" && (
                  <div className="glass-card-static p-6 max-w-md space-y-4">
                    <div>
                      <span className="font-display text-2xl font-bold text-foreground">Grátis</span>
                      <span className="text-xs text-muted-foreground ml-1">para sempre</span>
                    </div>
                    <div className="space-y-2">
                      {(mode as any).features?.map((f: string) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" onClick={() => navigate("/gestational")} className="w-full" size="sm">
                      Usar agora
                    </Button>
                  </div>
                )}

                {modePlans.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {modePlans.map((plan, pi) => {
                      const isCurrent = subscription?.tier === plan.tier;
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
                              R$ {(plan.priceCents / 100).toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-xs text-muted-foreground">/mês</span>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{plan.tokensPerPeriod}</span> cálculos/mês
                          </p>

                          <div className="flex-1 space-y-1.5">
                            {(mode as any).extraFeatures?.map((f: string) => (
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
