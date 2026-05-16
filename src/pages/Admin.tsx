import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Coins, Users, FileText, BarChart3, ShieldCheck, Search } from "lucide-react";

type Calc = "biometry" | "bpd" | "crl" | "efw" | "doppler" | "growth_curve" | "gestational" | "fertility" | "preeclampsia_risk" | "trisomy_risk";

interface Row {
  user_id: string;
  full_name: string;
  crm_number: string | null;
  status: string | null;
  tier: string | null;
  tokens_remaining: number;
  tokens_used: number;
  end_date: string | null;
  exam_count: number;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  crm_number: string | null;
}

interface SubscriptionRow {
  doctor_id: string;
  status: string | null;
  tokens_remaining: number | null;
  tokens_used: number | null;
  end_date: string | null;
  subscription_plans?: { tier: string | null } | { tier: string | null }[] | null;
}

const calcLabels: Record<Calc, string> = {
  biometry: "Biometria",
  bpd: "DBP",
  crl: "CCN",
  efw: "PFE",
  doppler: "Doppler",
  growth_curve: "Curva",
  gestational: "IG",
  fertility: "Fertilidade",
  preeclampsia_risk: "Pré-ecl.",
  trisomy_risk: "Trissomia",
};

export default function Admin() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [grantAmount, setGrantAmount] = useState<Record<string, string>>({});
  const [calcMetrics, setCalcMetrics] = useState<Array<{ calc_type: Calc; n: number }>>([]);
  const [totalExams, setTotalExams] = useState(0);

  const load = async () => {
    setLoading(true);
    const [profilesRes, subsRes, examsRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, crm_number"),
      supabase.from("user_subscriptions").select("doctor_id, status, tokens_remaining, tokens_used, end_date, plan_id, created_at, subscription_plans(tier, name)").order("created_at", { ascending: false }),
      supabase.from("exam_history").select("doctor_id, calc_type"),
    ]);

    const profiles = (profilesRes.data ?? []) as ProfileRow[];
    const subs = (subsRes.data ?? []) as SubscriptionRow[];
    const exams = examsRes.data ?? [];

    // pick latest subscription per doctor
    const subByDoctor: Record<string, SubscriptionRow> = {};
    for (const s of subs) {
      if (!subByDoctor[s.doctor_id]) subByDoctor[s.doctor_id] = s;
    }
    const examCountByDoctor: Record<string, number> = {};
    const calcAgg: Record<string, number> = {};
    for (const e of exams) {
      examCountByDoctor[e.doctor_id] = (examCountByDoctor[e.doctor_id] ?? 0) + 1;
      calcAgg[e.calc_type] = (calcAgg[e.calc_type] ?? 0) + 1;
    }

    const built: Row[] = profiles.map((p) => {
      const s = subByDoctor[p.id];
      const planTier = Array.isArray(s?.subscription_plans)
        ? s.subscription_plans[0]?.tier
        : s?.subscription_plans?.tier;
      return {
        user_id: p.id,
        full_name: p.full_name || "(sem nome)",
        crm_number: p.crm_number,
        status: s?.status ?? null,
        tier: planTier ?? null,
        tokens_remaining: s?.tokens_remaining ?? 0,
        tokens_used: s?.tokens_used ?? 0,
        end_date: s?.end_date ?? null,
        exam_count: examCountByDoctor[p.id] ?? 0,
      };
    });

    setRows(built);
    setCalcMetrics(Object.entries(calcAgg).map(([calc_type, n]) => ({ calc_type: calc_type as Calc, n })).sort((a, b) => b.n - a.n));
    setTotalExams(exams.length);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleGrant = async (userId: string) => {
    const raw = grantAmount[userId];
    const amount = parseInt(raw || "", 10);
    if (!amount || amount <= 0) {
      toast.error("Informe uma quantidade válida");
      return;
    }
    const { error } = await supabase.rpc("admin_grant_tokens", { _target_user: userId, _amount: amount });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${amount} tokens concedidos`);
    setGrantAmount((prev) => ({ ...prev, [userId]: "" }));
    load();
  };

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.full_name.toLowerCase().includes(q) || (r.crm_number ?? "").toLowerCase().includes(q) || r.user_id.includes(q);
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-2xl">
        <div className="container max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h1 className="font-display text-base font-semibold">Painel Admin</h1>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>Sair</Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Métricas globais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="w-4 h-4" /> Usuários</div>
            <p className="font-display text-2xl font-semibold mt-1">{rows.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><FileText className="w-4 h-4" /> Exames</div>
            <p className="font-display text-2xl font-semibold mt-1">{totalExams}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Coins className="w-4 h-4" /> Tokens usados</div>
            <p className="font-display text-2xl font-semibold mt-1">{rows.reduce((a, r) => a + r.tokens_used, 0)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><BarChart3 className="w-4 h-4" /> Assinaturas ativas</div>
            <p className="font-display text-2xl font-semibold mt-1">{rows.filter((r) => r.status === "active").length}</p>
          </CardContent></Card>
        </div>

        {/* Métricas por calculadora */}
        <Card>
          <CardHeader><CardTitle className="text-base">Uso por calculadora</CardTitle></CardHeader>
          <CardContent>
            {calcMetrics.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum cálculo registrado.</p>
            ) : (
              <div className="space-y-2">
                {calcMetrics.map((m) => {
                  const pct = totalExams ? (m.n / totalExams) * 100 : 0;
                  return (
                    <div key={m.calc_type} className="flex items-center gap-3">
                      <span className="w-28 text-sm">{calcLabels[m.calc_type]}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-16 text-right text-sm tabular-nums">{m.n}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usuários */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Usuários ({filtered.length})</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar nome / CRM / ID" className="pl-8 h-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 pr-3">Nome</th>
                      <th className="py-2 pr-3">CRM</th>
                      <th className="py-2 pr-3">Plano</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3 text-right">Tokens</th>
                      <th className="py-2 pr-3 text-right">Exames</th>
                      <th className="py-2 pr-3">Conceder tokens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.user_id} className="border-b border-border/40">
                        <td className="py-2 pr-3">
                          <div className="font-medium">{r.full_name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{r.user_id.slice(0, 8)}</div>
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">{r.crm_number || "—"}</td>
                        <td className="py-2 pr-3">{r.tier || "—"}</td>
                        <td className="py-2 pr-3">
                          {r.status ? (
                            <Badge variant={r.status === "active" ? "default" : r.status === "trial" ? "secondary" : "outline"}>{r.status}</Badge>
                          ) : "—"}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">{r.tokens_remaining} <span className="text-muted-foreground text-xs">/ {r.tokens_used}</span></td>
                        <td className="py-2 pr-3 text-right tabular-nums">{r.exam_count}</td>
                        <td className="py-2 pr-3">
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              min={1}
                              value={grantAmount[r.user_id] ?? ""}
                              onChange={(e) => setGrantAmount((p) => ({ ...p, [r.user_id]: e.target.value }))}
                              className="h-8 w-20"
                              placeholder="qtd"
                            />
                            <Button size="sm" className="h-8" onClick={() => handleGrant(r.user_id)}>+</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
