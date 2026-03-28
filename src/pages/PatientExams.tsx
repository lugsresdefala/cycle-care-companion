import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

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
  calc_type: string;
  input_data: Record<string, unknown>;
  result_data: Record<string, unknown>;
  gestational_age_weeks: number | null;
  gestational_age_days: number | null;
  notes: string | null;
  created_at: string;
}

const PatientExams = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState("");
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user || !id) return;
    const [{ data: patient }, { data: examData }] = await Promise.all([
      supabase.from("patients").select("name").eq("id", id).eq("doctor_id", user.id).maybeSingle(),
      supabase.from("exam_history").select("*").eq("patient_id", id).eq("doctor_id", user.id).order("created_at", { ascending: false }),
    ]);
    setPatientName(patient?.name ?? "Paciente");
    setExams((examData as ExamRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user, id]);

  const handleDelete = async (examId: string) => {
    const { error } = await supabase.from("exam_history").delete().eq("id", examId);
    if (error) toast.error("Erro ao excluir exame");
    else { toast.success("Exame removido"); load(); }
  };

  const formatGA = (w: number | null, d: number | null) => {
    if (w === null) return null;
    return `${w}s${d ? ` ${d}d` : ""}`;
  };

  const renderResultSummary = (exam: ExamRow) => {
    const r = exam.result_data as Record<string, unknown>;
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
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-2xl shadow-nav">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/patients")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="IDALIA" className="w-7 h-7 rounded-full object-cover" />
            <div>
              <span className="font-display text-sm font-semibold text-foreground">{patientName}</span>
              <p className="text-[10px] text-muted-foreground">Histórico de exames</p>
            </div>
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
                    {CALC_LABELS[exam.calc_type] ?? exam.calc_type}
                  </Badge>
                  {formatGA(exam.gestational_age_weeks, exam.gestational_age_days) && (
                    <span className="text-xs text-muted-foreground">
                      {formatGA(exam.gestational_age_weeks, exam.gestational_age_days)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(exam.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(exam.id)}>
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
    </div>
  );
};

export default PatientExams;
