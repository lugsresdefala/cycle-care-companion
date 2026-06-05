import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";

const RESPONSIBLE_NAME = "Tiago José de Oliveira Gomes";
const RESPONSIBLE_CRM = "CRM SP 164375";

const CALCULATOR_LINKS = [
  { to: "/gestational", label: "Idade Gestacional" },
  { to: "/fertility", label: "Ciclo Menstrual" },
  { to: "/biometry", label: "Biometria Fetal" },
  { to: "/efw", label: "Peso Fetal (PFE)" },
  { to: "/doppler", label: "Doppler Obstétrico" },
  { to: "/growth-curve", label: "Curva de Crescimento" },
  { to: "/bpd", label: "DBP" },
  { to: "/crl", label: "CRL" },
];

const GlobalFooter = () => {
  return (
    <footer className="w-full border-t border-border/50 mt-8 py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <nav aria-label="Calculadoras" className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {CALCULATOR_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-center gap-2 text-center">
          <Stethoscope className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{RESPONSIBLE_NAME}</span>
            <span className="mx-1.5">·</span>
            <span>{RESPONSIBLE_CRM}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
