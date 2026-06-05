import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const CALC_LABELS: Record<string, string> = {
  biometry: "Biometria",
  bpd: "DBP",
  crl: "CCN (CRL)",
  efw: "Peso Fetal (PFE)",
  doppler: "Doppler",
  growth_curve: "Curva de Crescimento",
  gestational: "Idade Gestacional",
  fertility: "Fertilidade",
};

interface ExamRow {
  id: string;
  calcType: string;
  inputData: Record<string, unknown>;
  resultData: Record<string, unknown>;
  gestationalAgeWeeks: number | null;
  gestationalAgeDays: number | null;
  notes: string | null;
  createdAt: string;
}

const PatientExams = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState("");
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user || !id) return;
    try {
      const [patient, examData] = await Promise.all([
        apiFetch<{ name: string }>(`/patients/${id}`),
        apiFetch<ExamRow[]>(`/exams?patientId=${encodeURIComponent(id)}`),
      ]);
      setPatientName(patient?.name ?? "Paciente");
      setExams(examData ?? []);
    } catch {
      setExams([]);
    }
    setLoading(false);
  }, [user, id]);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/exams/${deleteTarget}`, { method: "DELETE" });
      toast.success("Exame removido");
      load();
    } catch {
      toast.error("Erro ao excluir exame");
    }
    setDeleteTarget(null);
  };

  const formatGA = (w: number | null, d: number | null) => {
    if (w === null) return null;
    return `${w}s${d ? ` ${d}d` : ""}`;
  };

  const renderResultSummary = (exam: ExamRow) => {
    const r = exam.resultData as Record<string, unknown>;
    const parts: string[] = [];
    if (r.weeks !== undefined && r.days !== undefined) parts.push(`IG: ${r.weeks}s ${r.days}d`);
    if (r.weightG) parts.push(`Peso: ${r.weightG}g`);
    if (r.gestationalAge) parts.push(`IG: ${r.gestationalAge}`);
    if (parts.length === 0) {
      const keys = Object.keys(r).slice(0, 2);
      keys.forEach(k => { if (typeof r[k] === "number" || typeof r[k] === "string") parts.push(`${k}: ${r[k]}`); });
    }
    return parts.join(" • ") || "Ver detalhes";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/20">
        <div className="container max-w-4xl mx-auto px-4 h-12 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/patients")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <span className="font-display text-sm font-semibold text-foreground">{patientName}</span>
            <p className="text-[10px] text-muted-foreground">Histórico de exames</p>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-3">
        {loading ? (
          <div className="text-center py-16 text-sm text-muted-foreground">Carregando...</div>
        ) : exams.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum exame registrado para este paciente</p>
          </div>
        ) : (
          exams.map((exam, i) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card-static p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {CALC_LABELS[exam.calcType] ?? exam.calcType}
                  </Badge>
                  {formatGA(exam.gestationalAgeWeeks, exam.gestationalAgeDays) && (
                    <span className="text-xs text-muted-foreground">
                      {formatGA(exam.gestationalAgeWeeks, exam.gestationalAgeDays)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(exam.createdAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(exam.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-foreground">{renderResultSummary(exam)}</p>
              {exam.notes && <p className="text-[10px] text-muted-foreground italic">{exam.notes}</p>}
            </motion.div>
          ))
        )}
      </main>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este exame? Esta ação não pode ser desfeita.
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

export default PatientExams;
