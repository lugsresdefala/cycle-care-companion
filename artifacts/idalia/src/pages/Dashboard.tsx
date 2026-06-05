import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useCheckoutStatus } from "@/hooks/useCheckoutStatus";
import { apiFetch } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, FileText, CreditCard, ChevronRight, Plus, Coins, UserCog } from "lucide-react";

interface ProfileData {
  id: string;
  fullName: string;
  specialty?: string | null;
  crmNumber?: string | null;
  phone?: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  useCheckoutStatus();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [patientCount, setPatientCount] = useState(0);
  const [examCount, setExamCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoadingData(true);
      try {
        const [p, patients, exams] = await Promise.all([
          apiFetch<ProfileData>("/me"),
          apiFetch<any[]>("/patients"),
          apiFetch<any[]>("/exams"),
        ]);
        setProfile(p);
        setPatientCount(patients?.length ?? 0);
        setExamCount(exams?.length ?? 0);
      } catch {
        /* ignore */
      }
      setLoadingData(false);
    };
    load();
  }, [user]);

  const tierLabel: Record<string, string> = {
    free_trial: "Teste Gratuito",
    basic: "Básico",
    professional: "Profissional",
    premium: "Premium",
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Olá, {profile?.fullName || user?.fullName || "Doutor(a)"}
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {profile?.crmNumber ? `CRM ${profile.crmNumber}` : "Complete seu perfil para exibir o CRM"}
            </p>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => navigate("/profile")}>
              <UserCog className="w-3 h-3" /> Editar
            </Button>
          </div>
        </motion.div>

        {loadingData ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card-static p-4 space-y-2 animate-pulse">
                <div className="h-4 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-10" />
              </div>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Pacientes", value: patientCount, icon: Users, color: "text-primary" },
            { label: "Exames", value: examCount, icon: FileText, color: "text-secondary" },
            { label: "Tokens", value: subscription?.tokens_remaining ?? 0, icon: Coins, color: "text-accent" },
            { label: "Plano", value: subscription ? tierLabel[subscription.tier] || subscription.plan_name : "Nenhum", icon: CreditCard, color: "text-primary" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-static p-4 space-y-1"
            >
              <div className="flex items-center gap-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="font-display text-lg font-semibold text-foreground">{stat.value}</p>
            </motion.div>
          ))}
        </div>
        )}

        {subscription?.status === "trial" && (
          <div className="glass-card-warm p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Período de teste</p>
              <p className="text-xs text-muted-foreground">
                {subscription.tokens_remaining} cálculos restantes
              </p>
            </div>
            <Button size="sm" onClick={() => navigate("/pricing")} className="gap-1">
              Ver planos <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        )}

        {!subscription && !subLoading && (
          <div className="glass-card-warm p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Sem assinatura ativa</p>
              <p className="text-xs text-muted-foreground">Escolha um plano para continuar usando</p>
            </div>
            <Button size="sm" onClick={() => navigate("/pricing")} className="gap-1">
              Ver planos <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={() => navigate("/patients")} className="glass-card-blue p-5 text-left group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/12 flex items-center justify-center text-primary">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-sm font-semibold text-foreground">Meus Pacientes</h3>
                <p className="text-xs text-muted-foreground">{patientCount} cadastrados</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </button>

          <button onClick={() => navigate("/")} className="glass-card-purple p-5 text-left group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/12 flex items-center justify-center text-secondary">
                <Plus className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-sm font-semibold text-foreground">Novo Calculo</h3>
                <p className="text-xs text-muted-foreground">Acessar calculadoras</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
