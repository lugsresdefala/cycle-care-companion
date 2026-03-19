import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Baby, ArrowRight, Shield, Ruler, Scale, Activity, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import FertilityCalculator from "@/pages/FertilityCalculator";
import GestationalCalculator from "@/pages/GestationalCalculator";
import CRLCalculator from "@/pages/CRLCalculator";
import BPDCalculator from "@/pages/BPDCalculator";
import BiometryCalculator from "@/pages/BiometryCalculator";
import EFWCalculator from "@/pages/EFWCalculator";

type ActiveModule = null | "fertility" | "gestational" | "crl" | "bpd" | "biometry" | "efw";

const NAV_ITEMS: {value: ActiveModule;label: string;icon: React.ReactNode;short: string;}[] = [
{ value: "fertility", label: "Ciclo Menstrual", icon: <Heart className="w-3.5 h-3.5" />, short: "Ciclo" },
{ value: "gestational", label: "Idade Gestacional", icon: <Baby className="w-3.5 h-3.5" />, short: "IG" },
{ value: "crl", label: "CRL", icon: <Ruler className="w-3.5 h-3.5" />, short: "CRL" },
{ value: "bpd", label: "DBP", icon: <Ruler className="w-3.5 h-3.5" />, short: "DBP" },
{ value: "biometry", label: "Biometria", icon: <Activity className="w-3.5 h-3.5" />, short: "Bio" },
{ value: "efw", label: "PFE", icon: <Scale className="w-3.5 h-3.5" />, short: "PFE" }];


const CARDS: {
  value: ActiveModule;
  title: string;
  description: string;
  icon: React.ReactNode;
  mesh: string;
  iconBg: string;
  iconColor: string;
  linkColor: string;
}[] = [
{
  value: "fertility",
  title: "Ciclo Menstrual e Período Fértil",
  description:
  "Estimativa da janela fértil, data de ovulação, previsão da próxima menstruação e identificação de fase do ciclo.",
  icon: <Heart className="w-6 h-6 text-accent" />,
  mesh: "mesh-pink",
  iconBg: "bg-accent/15",
  iconColor: "text-accent",
  linkColor: "text-accent"
},
{
  value: "gestational",
  title: "Idade Gestacional e DPP",
  description:
  "Cálculo por DUM, ultrassonografia ou transferência embrionária, com referências de desenvolvimento fetal.",
  icon: <Baby className="w-6 h-6 text-secondary" />,
  mesh: "mesh-purple",
  iconBg: "bg-secondary/15",
  iconColor: "text-secondary",
  linkColor: "text-secondary"
},
{
  value: "crl",
  title: "CRL — Comprimento Crânio-Caudal",
  description: "Datação gestacional no 1º trimestre pela medida do CCN (Robinson & Fleming).",
  icon: <Ruler className="w-6 h-6 text-primary" />,
  mesh: "mesh-cyan",
  iconBg: "bg-primary/15",
  iconColor: "text-primary",
  linkColor: "text-primary"
},
{
  value: "bpd",
  title: "DBP — Diâmetro Biparietal",
  description: "Estimativa de IG no 2º e 3º trimestres pelo diâmetro biparietal (Hadlock).",
  icon: <Ruler className="w-6 h-6 text-secondary" />,
  mesh: "mesh-purple",
  iconBg: "bg-secondary/15",
  iconColor: "text-secondary",
  linkColor: "text-secondary"
},
{
  value: "biometry",
  title: "Biometria Fetal Composta",
  description: "IG por múltiplas medidas (DBP, CC, CA, CF) — maior acurácia no 2º/3º trimestre.",
  icon: <Activity className="w-6 h-6 text-primary" />,
  mesh: "mesh-cyan",
  iconBg: "bg-primary/15",
  iconColor: "text-primary",
  linkColor: "text-primary"
},
{
  value: "efw",
  title: "Peso Fetal Estimado (PFE)",
  description: "Cálculo do peso fetal pela fórmula de Hadlock (CC, CA, CF), com classificação por percentil.",
  icon: <Scale className="w-6 h-6 text-accent" />,
  mesh: "mesh-pink",
  iconBg: "bg-accent/15",
  iconColor: "text-accent",
  linkColor: "text-accent"
}];


const Index = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>(null);

  const renderModule = () => {
    switch (activeModule) {
      case "fertility":
        return <FertilityCalculator />;
      case "gestational":
        return <GestationalCalculator />;
      case "crl":
        return <CRLCalculator />;
      case "bpd":
        return <BPDCalculator />;
      case "biometry":
        return <BiometryCalculator />;
      case "efw":
        return <EFWCalculator />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background orbs */}
      <div
        className="hero-gradient-orb w-[600px] h-[600px] -top-[200px] -left-[200px] fixed"
        style={{ background: "radial-gradient(circle, hsla(280, 60%, 40%, 0.3) 0%, transparent 70%)" }} />
      
      <div
        className="hero-gradient-orb w-[500px] h-[500px] top-[30%] -right-[150px] fixed"
        style={{ background: "radial-gradient(circle, hsla(200, 70%, 45%, 0.2) 0%, transparent 70%)" }} />
      
      <div
        className="hero-gradient-orb w-[400px] h-[400px] bottom-[10%] left-[20%] fixed"
        style={{ background: "radial-gradient(circle, hsla(330, 55%, 45%, 0.15) 0%, transparent 70%)" }} />
      

      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50 bg-background/70">
        <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => setActiveModule(null)} className="flex items-center gap-2.5">
            <img src={logo} alt="IDALIA-CALC" className="w-12 h-12 rounded-xl object-cover ring-1 ring-primary/20" />
            <span className="font-display text-lg text-foreground tracking-tight">IDALIA-CALC</span>
          </button>

          {activeModule &&
          <div className="flex gap-1 overflow-x-auto">
              {NAV_ITEMS.map((item) =>
            <Button
              key={item.value}
              variant={activeModule === item.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveModule(item.value)}
              className={`text-xs px-2 ${activeModule === item.value ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              
                  {item.icon}
                  <span className="ml-1 hidden sm:inline">{item.label}</span>
                  <span className="ml-1 sm:hidden">{item.short}</span>
                </Button>
            )}
            </div>
          }
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 relative z-10">
        {!activeModule ?
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-12">
          
            {/* Hero */}
            <div className="text-center space-y-6 py-12 relative">
              <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center mb-6">
              
                <img
                src={logo}
                alt="IDALIA-CALC"
                className="w-56 h-56 rounded-xl object-cover ring-2 ring-primary/20 shadow-2xl" />
              
              </motion.div>
              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
              
                <h1 className="font-display text-4xl md:text-5xl leading-tight">
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Calculadoras para
                  </span>
                  <br />
                  <span className="text-foreground text-4xl font-bold">Saúde Reprodutiva & Medicina Fetal</span>
                </h1>
                <p className="text-muted-foreground mt-5 max-w-xl mx-auto leading-relaxed">
                  Ferramentas de biometria e datação gestacional para uso clínico diário, com referências baseadas em
                  diretrizes internacionais.
                </p>
              </motion.div>
            </div>

            {/* Category Labels */}
            <div className="space-y-8">
              {/* Datação */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium px-1">
                  Datação Gestacional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CARDS.filter((c) =>
                ["fertility", "gestational", "crl", "bpd", "biometry"].includes(c.value as string)
                ).map((card, i) =>
                <motion.button
                  key={card.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setActiveModule(card.value)}
                  className={`glass-card p-6 text-left space-y-3 ${card.mesh} group cursor-pointer`}>
                  
                      <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                        {card.icon}
                      </div>
                      <div>
                        <h2 className="font-display text-base text-foreground">{card.title}</h2>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{card.description}</p>
                      </div>
                      <div className={`flex items-center gap-1 ${card.linkColor} text-xs font-medium`}>
                        Acessar
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                )}
                </div>
              </div>

              {/* Crescimento */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium px-1">
                  Crescimento Fetal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CARDS.filter((c) => c.value === "efw").map((card, i) =>
                <motion.button
                  key={card.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setActiveModule(card.value)}
                  className={`glass-card p-6 text-left space-y-3 ${card.mesh} group cursor-pointer`}>
                  
                      <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                        {card.icon}
                      </div>
                      <div>
                        <h2 className="font-display text-base text-foreground">{card.title}</h2>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{card.description}</p>
                      </div>
                      <div className={`flex items-center gap-1 ${card.linkColor} text-xs font-medium`}>
                        Acessar
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                )}
                </div>
              </div>
            </div>

            {/* Trust Bar */}
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground py-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Processamento local</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>Hadlock · Robinson · Shepard</span>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>Uso clínico</span>
            </div>

            {/* Legal Disclaimer */}
            <div className="glass-card-static p-4 border-destructive/20">
              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Aviso Legal</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    O IDALIA-CALC é uma ferramenta de <strong>apoio à decisão clínica</strong> destinada a profissionais
                    de saúde habilitados. Os resultados são estimativas matemáticas e <strong>não substituem</strong>{" "}
                    avaliação, diagnóstico ou conduta médica. Nenhum dado pessoal ou clínico é coletado — processamento
                    100% local.
                  </p>
                </div>
              </div>
            </div>

            {/* References summary */}
            <div className="glass-card-static p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Base Científica</span>
              </div>
              <div className="space-y-1.5">
                {[
              { text: "Robinson HP, Fleming JEE. Br J Obstet Gynaecol, 1975", id: "1191154" },
              { text: "Hadlock FP et al. Radiology, 1984", id: "6739822" },
              { text: "Hadlock FP et al. Am J Obstet Gynecol, 1985", id: "3881966" },
              { text: "Shepard MJ et al. Am J Obstet Gynecol, 1982", id: "7058805" },
              { text: "INTERGROWTH-21st. Lancet, 2014", id: "25209488" }].
              map((ref) =>
              <a
                key={ref.id}
                href={`https://pubmed.ncbi.nlm.nih.gov/${ref.id}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                
                    <span className="w-1 h-1 rounded-full bg-primary/50 flex-shrink-0" />
                    {ref.text}
                  </a>
              )}
              </div>
            </div>
          </motion.div> :

        renderModule()
        }
      </main>
    </div>);

};

export default Index;