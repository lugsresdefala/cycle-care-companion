import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    apiFetch<{ isAdmin: boolean }>("/me/is-admin")
      .then((r) => { if (!cancelled) { setIsAdmin(!!r.isAdmin); setLoading(false); } })
      .catch(() => { if (!cancelled) { setIsAdmin(false); setLoading(false); } });
    return () => { cancelled = true; };
  }, [user]);

  return { isAdmin, loading };
}
