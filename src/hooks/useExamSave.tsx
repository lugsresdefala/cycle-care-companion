import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CalcType = Database["public"]["Enums"]["calculation_type"];

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
    const { error } = await supabase.from("exam_history").insert({
      doctor_id: user.id,
      calc_type: params.calcType,
      input_data: params.inputData,
      result_data: params.resultData,
      gestational_age_weeks: params.gestationalAgeWeeks ?? null,
      gestational_age_days: params.gestationalAgeDays ?? null,
      patient_id: params.patientId ?? null,
      notes: params.notes ?? "",
    });
    if (error) {
      console.error("Error saving exam:", error);
      toast.error("Erro ao salvar exame no histórico");
    } else {
      toast.success("Exame salvo no histórico");
    }
  };

  return { saveExam, canSave: !!user };
}
