import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Baby, ArrowRight, Shield, Ruler, Scale, Activity,
  BookOpen, ChevronLeft, Home, Sparkles, Download, Lock, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import FertilityCalculator from "@/pages/FertilityCalculator";
import GestationalCalculator from "@/pages/GestationalCalculator";
import CRLCalculator from "@/pages/CRLCalculator";
import BPDCalculator from "@/pages/BPDCalculator";
import BiometryCalculator from "@/pages/BiometryCalculator";
import EFWCalculator from "@/pages/EFWCalculator";

type ActiveModule = null | "fertility" | "gestational" | "crl" | "bpd" | "biometry" | "efw";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const NAV_ITEMS: { value: ActiveModule; label: string; icon: React.ReactNode; short: string; color: string }[] = [
  { value: "fertility",    label: "Ciclo Menstrual",    icon: <Heart className="w-4 h-4" />,     short: "Ciclo",  color: "text-accent" },
  { value: "gestational", label: "Idade Gestacional",  icon: <Baby className="w-4 h-4" />,      short: "IG",     color: "text-secondary" },
  { value: "crl",         label: "CRL",                icon: <Ruler className="w-4 h-4" />,     short: "CRL",    color: "text-primary" },
  { value: "bpd",         label: "DBP",                icon: <Ruler className="w-4 h-4" />,     short: "DBP",    color: "text-secondary" },
  { value: "biometry",    label: "Biometria",          icon: <Activity className="w-4 h-4" />,  short: "Bio",    color: "text-primary" },
  { value: "efw",         label: "PFE",                icon: <Scale className="w-4 h-4" />,     short: "PFE",    color: "text-accent" },
];

const CARDS: {
  value: ActiveModule;
  title: string;
  description: string;
  icon: React.ReactNode;
  mesh: string;
  iconBg: string;
  iconColor: string;
  linkColor: string;
  accentColor: string;
  category: "dating" | "growth";
}[] = [
  {
    value: "fertility",
    title: "Ciclo Menstrual e Período Fértil",
    description: "Estimativa da janela fértil, data de ovulação, previsão da próxima menstruação e fase do ciclo.",
    icon: <Heart className="w-5 h-5" />,
    mesh: "mesh-pink",
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    linkColor: "text-accent",
    accentColor: "hsla(330, 55%, 55%, 0.15)",
    category: "dating",
  },
  {
    value: "gestational",
    title: "Idade Gestacional e DPP",
    description: "Cálculo por DUM, ultrassonografia ou transferência embrionária, com marcos de desenvolvimento fetal.",
    icon: <Baby className="w-5 h-5" />,
    mesh: "mesh-purple",
    iconBg: "bg-secondary/15",
    iconColor: "text-secondary",
    linkColor: "text-secondary",
    accentColor: "hsla(280, 35%, 45%, 0.15)",
    category: "dating",
  },
  {
    value: "crl",
    title: "CRL — Comprimento Crânio-Caudal",
    description: "Datação gestacional no 1º trimestre pela medida do CCN (Robinson & Fleming).",
    icon: <Ruler className="w-5 h-5" />,
    mesh: "mesh-cyan",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    linkColor: "text-primary",
    accentColor: "hsla(200, 70%, 58%, 0.15)",
    category: "dating",
  },
  {
    value: "bpd",
    title: "DBP — Diâmetro Biparietal",
    description: "Estimativa de IG no 2º e 3º trimestres pelo diâmetro biparietal (Hadlock).",
    icon: <Ruler className="w-5 h-5" />,
    mesh: "mesh-purple",
    iconBg: "bg-secondary/15",
    iconColor: "text-secondary",
    linkColor: "text-secondary",
    accentColor: "hsla(280, 35%, 45%, 0.15)",
    category: "dating",
  },
  {
    value: "biometry",
    title: "Biometria Fetal Composta",
    description: "IG por múltiplas medidas (DBP, CC, CA, CF) — maior acurácia no 2º/3º trimestre.",
    icon: <Activity className="w-5 h-5" />,
    mesh: "mesh-cyan",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    linkColor: "text-primary",
    accentColor: "hsla(200, 70%, 58%, 0.15)",
    category: "dating",
  },
  {
    value: "efw",
    title: "Peso Fetal Estimado (PFE)",
    description: "Cálculo do peso fetal pela fórmula de Hadlock (CC, CA, CF), com classificação por percentil.",
    icon: <Scale className="w-5 h-5" />,
    mesh: "mesh-pink",
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    linkColor: "text-accent",
    accentColor: "hsla(330, 55%, 55%, 0.15)",
    category: "growth",
  },
];

const moduleTitle: Record<string, string> = {
  fertility: "Ciclo Menstrual",
  gestational: "Idade Gestacional",
  crl: "CRL",
  bpd: "DBP",
  biometry: "Biometria",
  efw: "PFE",
};

const Index = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    if (window.matchMedia("(display-mode: standalone)").matches) setIsInstalled(true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case "fertility":    return <FertilityCalculator />;
      case "gestational": return <GestationalCalculator />;
      case "crl":         return <CRLCalculator />;
      case "bpd":         return <BPDCalculator />;
      case "biometry":    return <BiometryCalculator />;
      case "efw":         return <EFWCalculator />;
      default:            return null;
    }
  };

  const datingCards = CARDS.filter((c) => c.category === "dating");
  const growthCards = CARDS.filter((c) => c.category === "growth");

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">

      {/* Animated ambient background orbs */}
      <div
        className="hero-gradient-orb animate-orb w-[600px] h-[600px] -top-[200px] -left-[200px] fixed"
        style={{ background: "radial-gradient(circle, hsla(280, 60%, 40%, 0.28) 0%, transparent 70%)" }}
      />
      <div
        className="hero-gradient-orb animate-orb w-[500px] h-[500px] top-[30%] -right-[150px] fixed"
        style={{
          background: "radial-gradient(circle, hsla(200, 70%, 45%, 0.2) 0%, transparent 70%)",
          animationDelay: "2.5s",
          animationDuration: "10s",
        }}
      />
      <div
        className="hero-gradient-orb w-[350px] h-[350px] bottom-[10%] left-[15%] fixed"
        style={{ background: "radial-gradient(circle, hsla(330, 55%, 45%, 0.13) 0%, transparent 70%)" }}
      />

      {/* ─── Header ─────────────────────────────────── */}
      <header className="app-header">
        <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">

          {activeModule ? (
            <>
              <button
                onClick={() => setActiveModule(null)}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted transition-colors flex-shrink-0"
                aria-label="Voltar ao início"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>

              <div className="flex-1 min-w-0">
                <h1 className="font-display text-base font-semibold text-foreground truncate">
                  {moduleTitle[activeModule]}
                </h1>
                <p className="text-xs text-muted-foreground">IDALIA-CALC</p>
              </div>

              {/* Desktop nav tabs */}
              <div className="hidden sm:flex gap-1 bg-muted/30 rounded-xl p-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setActiveModule(item.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      activeModule === item.value
                        ? "bg-primary/90 text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {item.icon}
                    <span>{item.short}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setActiveModule(null)} className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={logo}
                    alt="IDALIA-CALC"
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-primary/25"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                </div>
                <div>
                  <span className="font-display text-base font-bold text-foreground tracking-tight block leading-none">
                    IDALIA-CALC
                  </span>
                  <span className="text-xs text-muted-foreground">Saúde Reprodutiva</span>
                </div>
              </button>

              <div className="flex-1" />

              {/* Install button */}
              {installPrompt && !isInstalled && (
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-all duration-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Instalar App</span>
                </button>
              )}
            </>
          )}
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────── */}
      <main
        className="container max-w-4xl mx-auto px-4 py-6 relative z-10"
        style={{ paddingBottom: activeModule ? "calc(80px + env(safe-area-inset-bottom, 0px))" : "2rem" }}
      >
        <AnimatePresence mode="wait">
          {!activeModule ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-10"
            >
              {/* ─── Hero ─────────────────────────────── */}
              <div className="text-center space-y-5 py-8 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="flex justify-center mb-5"
                >
                  <div className="relative">
                    {/* Glow ring behind logo */}
                    <div
                      className="absolute inset-0 rounded-3xl blur-2xl opacity-60"
                      style={{ background: "radial-gradient(circle, hsla(200, 70%, 58%, 0.5) 0%, transparent 70%)" }}
                    />
                    <img
                      src={logo}
                      alt="IDALIA-CALC"
                      className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover ring-2 ring-primary/35 shadow-2xl"
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-3 h-3 text-primary-foreground" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-3"
                >
                  <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight">
                    <span className="bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Calculadoras para
                    </span>
                    <br />
                    <span className="text-foreground font-bold">Saúde Reprodutiva</span>
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-sm sm:max-w-xl mx-auto leading-relaxed">
                    Ferramentas de biometria e datação gestacional para uso clínico diário, baseadas em diretrizes internacionais.
                  </p>
                </motion.div>

                {/* Quick stats strip */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap"
                >
                  {[
                    { label: "6", desc: "Calculadoras", icon: <Zap className="w-3 h-3" /> },
                    { label: "100%", desc: "Local", icon: <Lock className="w-3 h-3" /> },
                    { label: "5+", desc: "Fórmulas Validadas", icon: <Sparkles className="w-3 h-3" /> },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border border-border/50">
                      <span className="text-primary">{s.icon}</span>
                      <span className="text-sm font-display font-bold text-primary tabular-nums">{s.label}</span>
                      <span className="text-xs text-muted-foreground">{s.desc}</span>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* ─── Módulos ───────────────────────────── */}
              <div className="space-y-8">

                {/* Datação Gestacional */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-4 rounded-full bg-primary" />
                    <h3 className="section-label">Datação Gestacional</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {datingCards.map((card, i) => (
                      <motion.button
                        key={card.value}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => setActiveModule(card.value)}
                        className={`module-card ${card.mesh} group text-left`}
                        style={{ "--card-accent": card.accentColor } as React.CSSProperties}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0 ${card.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                              {card.icon}
                            </div>
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
                              style={{ background: card.accentColor }}
                            >
                              <ArrowRight className={`w-3.5 h-3.5 ${card.iconColor}`} />
                            </div>
                          </div>

                          <div>
                            <h2 className="font-display text-sm sm:text-base text-foreground leading-snug">
                              {card.title}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                              {card.description}
                            </p>
                          </div>

                          <div className={`flex items-center gap-1 ${card.linkColor} text-xs font-semibold`}>
                            Acessar
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Crescimento Fetal */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-4 rounded-full bg-accent" />
                    <h3 className="section-label">Crescimento Fetal</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {growthCards.map((card, i) => (
                      <motion.button
                        key={card.value}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 + i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => setActiveModule(card.value)}
                        className={`module-card ${card.mesh} group text-left`}
                        style={{ "--card-accent": card.accentColor } as React.CSSProperties}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0 ${card.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                              {card.icon}
                            </div>
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
                              style={{ background: card.accentColor }}
                            >
                              <ArrowRight className={`w-3.5 h-3.5 ${card.iconColor}`} />
                            </div>
                          </div>
                          <div>
                            <h2 className="font-display text-sm sm:text-base text-foreground leading-snug">
                              {card.title}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                              {card.description}
                            </p>
                          </div>
                          <div className={`flex items-center gap-1 ${card.linkColor} text-xs font-semibold`}>
                            Acessar
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ─── Trust Strip ───────────────────────── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="glass-card-static px-5 py-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3 h-3 text-primary" />
                    </div>
                    <span>100% processamento local — nenhum dado é coletado ou transmitido</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {["Hadlock", "Robinson", "Shepard", "INTERGROWTH"].map((ref) => (
                      <span key={ref} className="px-2 py-0.5 rounded-full bg-muted/40 border border-border/50 text-muted-foreground font-medium">
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ─── Legal Disclaimer ──────────────────── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="glass-card-static p-4 border-destructive/20"
              >
                <div className="flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Aviso Legal</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      O IDALIA-CALC é uma ferramenta de <strong>apoio à decisão clínica</strong> destinada a profissionais
                      de saúde habilitados. Os resultados são estimativas matemáticas e <strong>não substituem</strong>{" "}
                      avaliação, diagnóstico ou conduta médica.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* ─── Scientific References ─────────────── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="glass-card-static p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Base Científica</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {[
                    { text: "Robinson HP, Fleming JEE. Br J Obstet Gynaecol, 1975", id: "1191154" },
                    { text: "Hadlock FP et al. Radiology, 1984", id: "6739822" },
                    { text: "Hadlock FP et al. Am J Obstet Gynecol, 1985", id: "3881966" },
                    { text: "Shepard MJ et al. Am J Obstet Gynecol, 1982", id: "7058805" },
                    { text: "INTERGROWTH-21st. Lancet, 2014", id: "25209488" },
                  ].map((ref) => (
                    <a
                      key={ref.id}
                      href={`https://pubmed.ncbi.nlm.nih.gov/${ref.id}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                      {ref.text}
                    </a>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderModule()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─── Mobile Bottom Navigation ─────────────────── */}
      <AnimatePresence>
        {activeModule && (
          <motion.nav
            className="bottom-nav sm:hidden"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center px-2 py-2">
              {/* Home button */}
              <button
                onClick={() => setActiveModule(null)}
                className="flex flex-col items-center gap-0.5 flex-1 py-1.5 px-1 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px] font-medium">Início</span>
              </button>

              <div className="w-px h-8 bg-border/50" />

              {/* Module buttons */}
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setActiveModule(item.value)}
                  className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 ${
                    activeModule === item.value
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className={`relative ${activeModule === item.value ? "scale-110" : ""} transition-transform duration-200`}>
                    {item.icon}
                    {activeModule === item.value && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.short}</span>
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
