import { Stethoscope } from "lucide-react";

const RESPONSIBLE_NAME = "Tiago José de Oliveira Gomes";
const RESPONSIBLE_CRM = "CRM SP 164375";

const GlobalFooter = () => {
  return (
    <footer className="w-full border-t border-border/50 mt-8 py-4 px-4">
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 text-center">
        <Stethoscope className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{RESPONSIBLE_NAME}</span>
          <span className="mx-1.5">·</span>
          <span>{RESPONSIBLE_CRM}</span>
        </p>
      </div>
    </footer>
  );
};

export default GlobalFooter;
