import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Search, ArrowLeft, Users, FileText, Trash2, Pencil } from "lucide-react";
import logo from "@/assets/logo.png";

interface Patient {
  id: string;
  name: string;
  age: number | null;
  medical_record_id: string;
  notes: string;
  created_at: string;
}

const Patients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({ name: "", age: "", medical_record_id: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("patients")
      .select("*")
      .eq("doctor_id", user.id)
      .order("created_at", { ascending: false });
    setPatients((data as Patient[]) ?? []);
  };

  useEffect(() => { load(); }, [user]);

  const handleSave = async () => {
    if (!user || !form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    if (editingPatient) {
      const { error } = await supabase.from("patients").update({
        name: form.name.trim(),
        age: form.age ? parseInt(form.age) : null,
        medical_record_id: form.medical_record_id.trim(),
        notes: form.notes.trim(),
      }).eq("id", editingPatient.id);
      if (error) toast.error("Erro ao atualizar");
      else { toast.success("Paciente atualizado"); closeDialog(); load(); }
    } else {
      const { error } = await supabase.from("patients").insert({
        doctor_id: user.id,
        name: form.name.trim(),
        age: form.age ? parseInt(form.age) : null,
        medical_record_id: form.medical_record_id.trim(),
        notes: form.notes.trim(),
      });
      if (error) toast.error("Erro ao salvar paciente");
      else { toast.success("Paciente cadastrado"); closeDialog(); load(); }
    }
    setSaving(false);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPatient(null);
    setForm({ name: "", age: "", medical_record_id: "", notes: "" });
  };

  const openEdit = (p: Patient) => {
    setEditingPatient(p);
    setForm({
      name: p.name,
      age: p.age ? String(p.age) : "",
      medical_record_id: p.medical_record_id || "",
      notes: p.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Paciente removido"); load(); }
  };

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.medical_record_id?.toLowerCase().includes(search.toLowerCase())
  );

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
              <span className="font-display text-sm font-semibold text-foreground">Pacientes</span>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="w-3.5 h-3.5" /> Novo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPatient ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-glass" placeholder="Nome completo" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Idade</Label>
                    <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="input-glass" placeholder="Anos" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Prontuario</Label>
                    <Input value={form.medical_record_id} onChange={(e) => setForm({ ...form, medical_record_id: e.target.value })} className="input-glass" placeholder="ID" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Observacoes</Label>
                  <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-glass" placeholder="Notas clinicas" />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? "Salvando..." : editingPatient ? "Atualizar Paciente" : "Cadastrar Paciente"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou prontuario..."
            className="input-glass pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Users className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum paciente cadastrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card-static p-4 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold text-foreground truncate">{p.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    {p.age && <span>{p.age} anos</span>}
                    {p.medical_record_id && <span>Pront. {p.medical_record_id}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/patient/${p.id}/exams`)}>
                    <FileText className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Patients;
