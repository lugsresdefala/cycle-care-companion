import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "") || "";
    navigate(`${base}/sign-in`, { replace: true });
  }, [navigate]);
  return (
    <div className="flex items-center justify-center min-h-screen text-sm text-muted-foreground">
      Redirecionando para login...
    </div>
  );
};

export default ResetPassword;
