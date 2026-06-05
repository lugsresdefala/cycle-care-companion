import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Search, ArrowLeft, Users, FileText, Trash2, Pencil } from "lucide-react";
import logo from "@/assets/logo-sm.webp";

interface Patient {
  id: string;
  name: string;
  age: number | null;
  medicalRecordId: string | null;
  notes: string | null;
  createdAt: string;
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
  const [loadingPatients, setLoadingPatients] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoadingPatients(false); return; }
    setLoadingPatients(true);
    try {
      const data = await apiFetch<Patient[]>("/patients");
      setPatients(data ?? []);
    } catch {
      setPatients([]);
    }
    setLoadingPatients(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!user || !form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      age: form.age ? parseInt(form.age) : null,
      medicalRecordId: form.medical_record_id.trim(),
      notes: form.notes.trim(),
    };
    try {
      if (editingPatient) {
        await apiFetch(`/patients/${editingPatient.id}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast.success("Paciente atualizado");
      } else {
        await apiFetch("/patients", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Paciente cadastrado");
      }
      closeDialog();
      load();
    } catch {
      toast.error(editingPatient ? "Erro ao atualizar" : "Erro ao salvar paciente");
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
      medical_record_id: p.medicalRecordId || "",
      notes: p.notes || "",
    });
    setDialogOpen(true);
  };

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/patients/${deleteTarget}`, { method: "DELETE" });
      toast.success("Paciente removido");
      load();
    } catch {
      toast.error("Erro ao excluir");
    }
    setDeleteTarget(null);
  };

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.medicalRecordId ?? "").toLowerCase().includes(search.toLowerCase())
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

        {loadingPatients ? (
          <div className="text-center py-16 text-sm text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
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
                    {p.medicalRecordId && <span>Pront. {p.medicalRecordId}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/patient/${p.id}/exams`)}>
                    <FileText className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(p.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Patients;
