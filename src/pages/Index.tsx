import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Baby, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import FertilityCalculator from "@/pages/FertilityCalculator";
import GestationalCalculator from "@/pages/GestationalCalculator";

type ActiveModule = null | "fertility" | "gestational";

const Index = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50 bg-background/80">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => setActiveModule(null)} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display text-lg text-foreground tracking-tight">IDALIA-CALC</span>
          </button>

          {activeModule && (
            <div className="flex gap-2">
              <Button
                variant={activeModule === "fertility" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveModule("fertility")}
                className={activeModule === "fertility" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
              >
                <Heart className="w-3.5 h-3.5 mr-1" />
                Ciclo Menstrual
              </Button>
              <Button
                variant={activeModule === "gestational" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveModule("gestational")}
                className={activeModule === "gestational" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}
              >
                <Baby className="w-3.5 h-3.5 mr-1" />
                Idade Gestacional
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        {!activeModule ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12"
          >
            {/* Hero */}
            <div className="text-center space-y-4 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
                  Calculadoras para
                  <br />
                  <span className="text-primary">Saúde Reprodutiva</span>
                </h1>
                <p className="text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
                  Ferramentas de cálculo para estimativa de período fértil e idade gestacional,
                  com referências baseadas em diretrizes clínicas vigentes.
                </p>
              </motion.div>
            </div>

            {/* Module Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setActiveModule("fertility")}
                className="glass-card p-8 text-left space-y-4 mesh-cyan group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-foreground">Ciclo Menstrual e Período Fértil</h2>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Estimativa da janela fértil, data provável de ovulação, previsão da próxima menstruação e identificação de fase do ciclo com base em parâmetros clínicos.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-primary text-sm font-medium">
                  Acessar calculadora
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setActiveModule("gestational")}
                className="glass-card p-8 text-left space-y-4 mesh-teal group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center">
                  <Baby className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-foreground">Idade Gestacional e DPP</h2>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Cálculo de idade gestacional por DUM, ultrassonografia ou transferência embrionária,
                    com data provável do parto e referências de desenvolvimento fetal por semana.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-accent text-sm font-medium">
                  Acessar calculadora
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            </div>

            {/* Trust Bar */}
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground py-4">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Processamento local</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>Referências clínicas</span>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>Uso educativo</span>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-lg mx-auto">
              <strong>Nota:</strong> O IDALIA-CALC é uma ferramenta informativa e educativa. Os resultados apresentados são estimativas calculadas
              e não substituem avaliação, diagnóstico ou conduta de profissional de saúde habilitado.
            </p>
          </motion.div>
        ) : activeModule === "fertility" ? (
          <FertilityCalculator />
        ) : (
          <GestationalCalculator />
        )}
      </main>
    </div>
  );
};

export default Index;
