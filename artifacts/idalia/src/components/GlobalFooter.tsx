import { useEffect, useState } from "react";
import { Stethoscope } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

const GlobalFooter = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ fullName: string; crmNumber: string } | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    setProfile(null);
    apiFetch<any>("/me")
      .then((data) => {
        if (data) {
          setProfile({
            fullName: data.fullName || "",
            crmNumber: data.crmNumber || "",
          });
        }
      })
      .catch(() => setProfile(null));
  }, [user]);

  const name = profile?.fullName.trim() || "";
  const crm = profile?.crmNumber.trim() || "";

  if (!user || (!name && !crm)) return null;

  return (
    <footer className="w-full border-t border-border/50 mt-8 py-4 px-4">
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 text-center">
        <Stethoscope className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          {name && <span className="font-medium text-foreground">{name}</span>}
          {name && crm && <span className="mx-1.5">·</span>}
          {crm && <span>CRM {crm}</span>}
        </p>
      </div>
    </footer>
  );
};

export default GlobalFooter;
