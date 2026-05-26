import { useAuth } from "./useAuth";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type CalcType =
  | "biometry" | "bpd" | "crl" | "efw" | "doppler"
  | "growth_curve" | "gestational" | "fertility"
  | "preeclampsia_risk" | "trisomy_risk";

interface SaveExamParams {
  calcType: CalcType;
  inputData: Record<string, unknown>;
  resultData: Record<string, unknown>;
  gestationalAgeWeeks?: number;
  gestationalAgeDays?: number;
  patientId?: string;
  notes?: string;
}

export function useExamSave() {
  const { user } = useAuth();

  const saveExam = async (params: SaveExamParams) => {
    if (!user) return;
    try {
      await apiFetch("/exams", {
        method: "POST",
        body: JSON.stringify({
          calcType: params.calcType,
          inputData: params.inputData,
          resultData: params.resultData,
          gestationalAgeWeeks: params.gestationalAgeWeeks ?? null,
          gestationalAgeDays: params.gestationalAgeDays ?? null,
          patientId: params.patientId ?? null,
          notes: params.notes ?? "",
        }),
      });
      toast.success("Exame salvo no histórico");
    } catch {
      toast.error("Erro ao salvar exame no histórico");
    }
  };

  return { saveExam, canSave: !!user };
}
