import { BookOpen, Scale, Shield, ExternalLink } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface Reference {
  authors: string;
  title: string;
  journal: string;
  year: number;
  doi?: string;
  pubmedId?: string;
}

interface ScientificFooterProps {
  references: Reference[];
  /** Which units are used in this calculator */
  units?: { param: string; unit: string; description: string }[];
  /** Extra disclaimer text beyond the default */
  extraDisclaimer?: string;
}

const DEFAULT_UNITS = [
  { param: "Comprimento / Diâmetro", unit: "mm", description: "Milímetros — padrão para biometria fetal por ultrassom" },
  { param: "Peso fetal", unit: "g / kg", description: "Gramas (resultado primário) e quilogramas (conversão)" },
  { param: "Idade gestacional", unit: "sem + dias", description: "Semanas completas + dias restantes" },
  { param: "Circunferências", unit: "mm", description: "Milímetros — CC e CA medidas em planos axiais padronizados" },
];

const ScientificFooter = ({ references, units, extraDisclaimer }: ScientificFooterProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const displayUnits = units || DEFAULT_UNITS;

  const getPubmedUrl = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}/`;
  const getDoiUrl = (doi: string) => `https://doi.org/${doi}`;

  return (
    <div className="space-y-3 mt-8">
      {/* Legal Disclaimer */}
      <div className="glass-card-static p-4 border-destructive/20">
        <div className="flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Aviso Legal — Uso Clínico
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Esta ferramenta é destinada exclusivamente ao <strong>apoio à decisão clínica</strong> por
              profissionais de saúde habilitados. Os resultados são estimativas matemáticas baseadas em
              fórmulas publicadas na literatura científica e <strong>não substituem</strong> avaliação
              clínica, diagnóstico ou conduta médica. As medidas devem ser obtidas seguindo protocolos
              padronizados de ultrassonografia (ISUOG). A acurácia dos resultados depende da qualidade
              das medidas obtidas e do contexto clínico individual.
            </p>
            {extraDisclaimer && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {extraDisclaimer}
              </p>
            )}
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              Em conformidade com as diretrizes do <strong>Ministério da Saúde</strong>, <strong>FEBRASGO</strong>, <strong>ACOG</strong> e <strong>ISUOG</strong>.
              Nenhum dado pessoal ou clínico é coletado, armazenado ou transmitido — todo o processamento ocorre localmente no dispositivo.
            </p>
          </div>
        </div>
      </div>

      {/* Scientific References */}
      <Collapsible open={openSections.refs} onOpenChange={() => toggle("refs")}>
        <CollapsibleTrigger className="w-full">
          <div className="glass-card-static p-4 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Referências Científicas ({references.length})
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${openSections.refs ? "rotate-180" : ""}`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="glass-card-static p-4 mt-1 space-y-3">
            {references.map((ref, i) => (
              <div key={i} className="space-y-0.5 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                <p className="text-xs text-foreground leading-relaxed">
                  <span className="text-primary font-medium">[{i + 1}]</span>{" "}
                  {ref.authors}.{" "}
                  <em className="text-foreground/90">{ref.title}</em>.{" "}
                  <span className="text-muted-foreground">
                    {ref.journal}, {ref.year}.
                  </span>
                </p>
                <div className="flex items-center gap-3">
                  {ref.doi && (
                    <a
                      href={getDoiUrl(ref.doi)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      DOI
                    </a>
                  )}
                  {ref.pubmedId && (
                    <a
                      href={getPubmedUrl(ref.pubmedId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      PubMed
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Unit System */}
      <Collapsible open={openSections.units} onOpenChange={() => toggle("units")}>
        <CollapsibleTrigger className="w-full">
          <div className="glass-card-static p-4 flex items-center justify-between cursor-pointer hover:border-accent/30 transition-colors">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Sistema de Unidades
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${openSections.units ? "rotate-180" : ""}`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="glass-card-static p-4 mt-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Parâmetro</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Unidade</th>
                  <th className="text-left py-2 text-muted-foreground font-medium hidden sm:table-cell">Observação</th>
                </tr>
              </thead>
              <tbody>
                {displayUnits.map((u) => (
                  <tr key={u.param} className="border-b border-border/50">
                    <td className="py-1.5 text-foreground font-medium">{u.param}</td>
                    <td className="py-1.5 text-primary tabular-nums">{u.unit}</td>
                    <td className="py-1.5 text-muted-foreground hidden sm:table-cell">{u.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ScientificFooter;
