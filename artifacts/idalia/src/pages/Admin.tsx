import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Coins, Users, FileText, BarChart3, ShieldCheck, Search } from "lucide-react";

interface AdminUserRow {
  id: string;
  fullName: string | null;
  email: string | null;
  crmNumber: string | null;
  isAdmin: boolean;
  subscription: {
    tier: string | null;
    status: string | null;
    tokensRemaining: number;
    endDate: string | null;
  } | null;
}

export default function Admin() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [grantAmount, setGrantAmount] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<AdminUserRow[]>("/admin/users");
      setRows(data ?? []);
    } catch {
      setRows([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleGrant = async (userId: string) => {
    const raw = grantAmount[userId];
    const amount = parseInt(raw || "", 10);
    if (!amount || amount <= 0) {
      toast.error("Informe uma quantidade válida");
      return;
    }
    try {
      await apiFetch("/admin/grant-tokens", {
        method: "POST",
        body: JSON.stringify({ userId, amount }),
      });
      toast.success(`${amount} tokens concedidos`);
      setGrantAmount((prev) => ({ ...prev, [userId]: "" }));
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro");
    }
  };

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.fullName ?? "").toLowerCase().includes(q)
      || (r.crmNumber ?? "").toLowerCase().includes(q)
      || (r.email ?? "").toLowerCase().includes(q)
      || r.id.includes(q);
  });

  const totalTokens = rows.reduce((a, r) => a + (r.subscription?.tokensRemaining ?? 0), 0);
  const activeCount = rows.filter((r) => r.subscription?.status === "active").length;

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="w-4 h-4" /> Usuários</div>
            <p className="font-display text-2xl font-semibold mt-1">{rows.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><FileText className="w-4 h-4" /> Admins</div>
            <p className="font-display text-2xl font-semibold mt-1">{rows.filter(r => r.isAdmin).length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Coins className="w-4 h-4" /> Tokens disponíveis</div>
            <p className="font-display text-2xl font-semibold mt-1">{totalTokens}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><BarChart3 className="w-4 h-4" /> Assinaturas ativas</div>
            <p className="font-display text-2xl font-semibold mt-1">{activeCount}</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Usuários ({filtered.length})</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar nome / email / CRM" className="pl-8 h-9" />
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
                      <th className="py-2 pr-3">Email</th>
                      <th className="py-2 pr-3">CRM</th>
                      <th className="py-2 pr-3">Plano</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3 text-right">Tokens</th>
                      <th className="py-2 pr-3">Conceder tokens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-b border-border/40">
                        <td className="py-2 pr-3">
                          <div className="font-medium">{r.fullName || "(sem nome)"} {r.isAdmin && <Badge className="ml-1 text-[10px]" variant="secondary">admin</Badge>}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{r.id.slice(0, 12)}</div>
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">{r.email || "—"}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{r.crmNumber || "—"}</td>
                        <td className="py-2 pr-3">{r.subscription?.tier || "—"}</td>
                        <td className="py-2 pr-3">
                          {r.subscription?.status ? (
                            <Badge variant={r.subscription.status === "active" ? "default" : r.subscription.status === "trial" ? "secondary" : "outline"}>{r.subscription.status}</Badge>
                          ) : "—"}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">{r.subscription?.tokensRemaining ?? 0}</td>
                        <td className="py-2 pr-3">
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              min={1}
                              value={grantAmount[r.id] ?? ""}
                              onChange={(e) => setGrantAmount((p) => ({ ...p, [r.id]: e.target.value }))}
                              className="h-8 w-20"
                              placeholder="qtd"
                            />
                            <Button size="sm" className="h-8" onClick={() => handleGrant(r.id)}>+</Button>
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
