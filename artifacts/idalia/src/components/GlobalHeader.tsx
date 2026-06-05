import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Users,
  CreditCard,
  LayoutDashboard,
  LogIn,
  LogOut,
  ShieldCheck,
  Coins,
} from "lucide-react";
import logo from "@/assets/logo-sm.webp";

const HIDDEN_PREFIXES = ["/sign-in", "/sign-up", "/auth", "/reset-password"];

const GlobalHeader = () => {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-2xl shadow-nav">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
        <Link
          to="/"
          className="flex items-center gap-2 group shrink-0"
          aria-label="Página inicial"
        >
          <img
            src={logo}
            alt="IDALIA Calc"
            className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-primary/10 group-hover:ring-primary/25 transition-all duration-300"
          />
          <span className="font-display text-base font-semibold text-foreground tracking-tight leading-none">
            IDALIA<span className="font-script text-accent text-lg leading-none ml-0.5">Calc</span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs px-2"
            onClick={() => navigate("/")}
            aria-label="Calculadoras"
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden md:inline">Calculadoras</span>
          </Button>

          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs px-2"
              onClick={() => navigate("/patients")}
              aria-label="Pacientes"
            >
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Pacientes</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs px-2"
            onClick={() => navigate("/pricing")}
            aria-label="Planos"
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden md:inline">Planos</span>
          </Button>

          {user && isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs px-2"
              onClick={() => navigate("/admin")}
              aria-label="Admin"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden md:inline">Admin</span>
            </Button>
          )}

          {user ? (
            <>
              {subscription && (
                <button
                  onClick={() => navigate("/pricing")}
                  title="Tokens restantes"
                  aria-label={`${subscription.tokens_remaining} tokens restantes`}
                  className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span className="tabular-nums">{subscription.tokens_remaining}</span>
                </button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs px-2"
                onClick={() => navigate("/dashboard")}
                aria-label="Painel"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Painel</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                title="Sair"
                aria-label="Sair"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => navigate("/sign-in")}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Entrar</span>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default GlobalHeader;
