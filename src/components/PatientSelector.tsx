import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";

interface PatientSelectorProps {
  value?: string;
  onChange: (patientId: string | undefined) => void;
}

interface PatientOption {
  id: string;
  name: string;
  medical_record_id: string | null;
}

export function PatientSelector({ value, onChange }: PatientSelectorProps) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientOption[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("patients")
      .select("id, name, medical_record_id")
      .eq("doctor_id", user.id)
      .order("name")
      .then(({ data }) => setPatients((data as PatientOption[]) ?? []));
  }, [user]);

  if (!user || patients.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Users className="w-4 h-4 text-muted-foreground shrink-0" />
      <Select
        value={value ?? "__none__"}
        onValueChange={(v) => onChange(v === "__none__" ? undefined : v)}
      >
        <SelectTrigger className="input-glass h-9 text-xs">
          <SelectValue placeholder="Vincular paciente (opcional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">Sem paciente</SelectItem>
          {patients.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}{p.medical_record_id ? ` — ${p.medical_record_id}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
