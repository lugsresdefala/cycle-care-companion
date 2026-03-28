import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import logo from "@/assets/logo.png";

const ProfileEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    crm_number: "",
    specialty: "",
    phone: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            full_name: data.full_name || "",
            crm_number: data.crm_number || "",
            specialty: data.specialty || "",
            phone: data.phone || "",
          });
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!form.full_name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim(),
        crm_number: form.crm_number.trim(),
        specialty: form.specialty.trim(),
        phone: form.phone.trim(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Erro ao salvar perfil");
    } else {
      toast.success("Perfil atualizado");
      navigate("/dashboard");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-2xl shadow-nav">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <img src={logo} alt="IDALIA" className="w-7 h-7 rounded-full object-cover" />
              <span className="font-display text-sm font-semibold text-foreground">Meu Perfil</span>
            </div>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1">
            <Save className="w-3.5 h-3.5" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-8 space-y-5">
        <div className="space-y-1.5">
          <Label className="text-xs">Nome completo *</Label>
          <Input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="input-glass"
            placeholder="Dr(a). Nome Completo"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">CRM</Label>
          <Input
            value={form.crm_number}
            onChange={(e) => setForm({ ...form, crm_number: e.target.value })}
            className="input-glass"
            placeholder="123456/UF"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Especialidade</Label>
          <Input
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            className="input-glass"
            placeholder="Obstetrícia"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Telefone</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="input-glass"
            placeholder="(11) 99999-0000"
          />
        </div>
      </main>
    </div>
  );
};

export default ProfileEdit;
