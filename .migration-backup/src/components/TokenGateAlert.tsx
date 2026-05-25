import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  needsLogin: boolean;
  blocked: boolean;
  tokensRemaining?: number;
}

export function TokenGateAlert({ needsLogin, blocked, tokensRemaining }: Props) {
  const navigate = useNavigate();

  if (needsLogin) {
    return (
      <Alert className="border-primary/30 bg-primary/5">
        <LogIn className="h-4 w-4 text-primary" />
        <AlertTitle className="text-foreground">Login necessário</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          Faça login para usar as calculadoras.
          <Button size="sm" className="ml-3" onClick={() => navigate("/auth")}>Entrar</Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (blocked) {
    return (
      <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
        <Lock className="h-4 w-4" />
        <AlertTitle>Tokens esgotados</AlertTitle>
        <AlertDescription>
          Seus tokens acabaram. Assine um plano para continuar.
          <Button size="sm" variant="outline" className="ml-3" onClick={() => navigate("/pricing")}>Ver Planos</Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (tokensRemaining !== undefined && tokensRemaining <= 5) {
    return (
      <Alert className="border-accent/30 bg-accent/5">
        <Coins className="h-4 w-4 text-accent" />
        <AlertTitle className="text-foreground">Tokens limitados</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          Você possui <strong>{tokensRemaining}</strong> cálculo{tokensRemaining !== 1 ? "s" : ""} restante{tokensRemaining !== 1 ? "s" : ""}.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
