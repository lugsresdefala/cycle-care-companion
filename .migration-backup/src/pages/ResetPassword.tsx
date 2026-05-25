import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import logo from "@/assets/logo.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Also check hash for type=recovery
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      setDone(true);
      toast.success("Senha atualizada com sucesso!");
      setTimeout(() => navigate("/", { replace: true }), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="hero-gradient-orb w-[600px] h-[600px] -top-[200px] -left-[200px] fixed"
        style={{ background: "radial-gradient(circle, hsla(218,72%,32%,0.13) 0%, transparent 65%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-3">
          <img src={logo} alt="IDALIA" className="w-16 h-16 mx-auto rounded-full object-cover shadow-logo" />
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {done ? "Senha atualizada" : "Nova senha"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {done ? "Você será redirecionado em instantes" : "Defina sua nova senha de acesso"}
          </p>
        </div>

        {done ? (
          <div className="glass-card-static p-8 flex flex-col items-center gap-4">
            <CheckCircle className="w-12 h-12 text-accent" />
            <p className="text-sm text-muted-foreground text-center">Sua senha foi alterada com sucesso.</p>
          </div>
        ) : !ready ? (
          <div className="glass-card-static p-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Verificando link de recuperação...</p>
            <p className="text-xs text-muted-foreground">Se você chegou aqui por engano, <button onClick={() => navigate("/auth")} className="text-primary hover:underline">volte ao login</button>.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card-static p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Nova senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 caracteres"
                  className="input-glass pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="input-glass"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? "Atualizando..." : "Atualizar senha"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <button onClick={() => navigate("/auth")} className="text-primary font-medium hover:underline">
            Voltar ao login
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
