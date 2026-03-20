import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Baby, ArrowRight, Shield, Ruler, Scale, Activity, BookOpen, Microscope, ChevronRight, Waves, TrendingUp } from "lucide-react";
import logo from "@/assets/logo.png";
import FertilityCalculator from "@/pages/FertilityCalculator";
import GestationalCalculator from "@/pages/GestationalCalculator";
import CRLCalculator from "@/pages/CRLCalculator";
import BPDCalculator from "@/pages/BPDCalculator";
import BiometryCalculator from "@/pages/BiometryCalculator";
import EFWCalculator from "@/pages/EFWCalculator";
import DopplerCalculator from "@/pages/DopplerCalculator";
import GrowthCurveCalculator from "@/pages/GrowthCurveCalculator";

type ActiveModule = null | "fertility" | "gestational" | "crl" | "bpd" | "biometry" | "efw" | "doppler" | "growth";

const NAV_ITEMS: { value: ActiveModule; label: string; icon: React.ReactNode; short: string }[] = [
  { value: "fertility",   label: "Ciclo Menstrual",    icon: <Heart className="w-3 h-3" />,     short: "Ciclo" },
  { value: "gestational", label: "Idade Gestacional",  icon: <Baby className="w-3 h-3" />,      short: "IG" },
  { value: "crl",         label: "CRL",                icon: <Ruler className="w-3 h-3" />,     short: "CRL" },
  { value: "bpd",         label: "DBP",                icon: <Ruler className="w-3 h-3" />,     short: "DBP" },
  { value: "biometry",    label: "Biometria",           icon: <Activity className="w-3 h-3" />,  short: "Bio" },
  { value: "efw",         label: "PFE",                icon: <Scale className="w-3 h-3" />,     short: "PFE" },
  { value: "doppler",     label: "Doppler",            icon: <Waves className="w-3 h-3" />,     short: "Dop" },
  { value: "growth",      label: "Crescimento",        icon: <TrendingUp className="w-3 h-3" />, short: "Curva" },
];

const CARDS: {
  value: ActiveModule;
  title: string;
  description: string;
  icon: React.ReactNode;
  cardClass: string;
  iconBg: string;
  iconColor: string;
  accentColor: string;
  tag: string;
}[] = [
  {
    value: "fertility",
    title: "Ciclo Menstrual e Período Fértil",
    description: "Estimativa da janela fértil, data de ovulação, previsão da próxima menstruação e identificação de fase do ciclo.",
    icon: <Heart className="w-5 h-5" />,
    cardClass: "glass-card-warm",
    iconBg: "bg-accent/12",
    iconColor: "text-accent",
    accentColor: "text-accent",
    tag: "Fertilidade",
  },
  {
    value: "gestational",
    title: "Idade Gestacional e DPP",
    description: "Cálculo por DUM, ultrassonografia ou transferência embrionária, com referências de desenvolvimento fetal.",
    icon: <Baby className="w-5 h-5" />,
    cardClass: "glass-card-purple",
    iconBg: "bg-secondary/12",
    iconColor: "text-secondary",
    accentColor: "text-secondary",
    tag: "Gestação",
  },
  {
    value: "crl",
    title: "CRL — Comprimento Crânio-Caudal",
    description: "Datação gestacional no 1º trimestre pela medida do CCN segundo Robinson & Fleming.",
    icon: <Ruler className="w-5 h-5" />,
    cardClass: "glass-card-blue",
    iconBg: "bg-primary/12",
    iconColor: "text-primary",
    accentColor: "text-primary",
    tag: "1º Trimestre",
  },
  {
    value: "bpd",
    title: "DBP — Diâmetro Biparietal",
    description: "Estimativa de IG no 2º e 3º trimestres pelo diâmetro biparietal segundo Hadlock.",
    icon: <Ruler className="w-5 h-5" />,
    cardClass: "glass-card-purple",
    iconBg: "bg-secondary/12",
    iconColor: "text-secondary",
    accentColor: "text-secondary",
    tag: "2º–3º Trim.",
  },
  {
    value: "biometry",
    title: "Biometria Fetal Composta",
    description: "IG por múltiplas medidas (DBP, CC, CA, CF) — maior acurácia no 2º e 3º trimestre.",
    icon: <Activity className="w-5 h-5" />,
    cardClass: "glass-card-blue",
    iconBg: "bg-primary/12",
    iconColor: "text-primary",
    accentColor: "text-primary",
    tag: "Precisão Máxima",
  },
  {
    value: "efw",
    title: "Peso Fetal Estimado (PFE)",
    description: "Cálculo do peso fetal pela fórmula de Hadlock (CC, CA, CF), com classificação por percentil.",
    icon: <Scale className="w-5 h-5" />,
    cardClass: "glass-card-warm",
    iconBg: "bg-accent/12",
    iconColor: "text-accent",
    accentColor: "text-accent",
    tag: "Crescimento",
  },
  {
    value: "doppler",
    title: "Doppler Obstétrico",
    description: "Velocimetria Doppler das artérias umbilical, cerebral média, uterina e razão cerebroplacentária (RCP).",
    icon: <Waves className="w-5 h-5" />,
    cardClass: "glass-card-blue",
    iconBg: "bg-primary/12",
    iconColor: "text-primary",
    accentColor: "text-primary",
    tag: "Hemodinâmica",
  },
  {
    value: "growth",
    title: "Curva de Crescimento Fetal",
    description: "Percentis INTERGROWTH-21st para PFE, CC, CA, CF e DBP com gráfico interativo e avaliação longitudinal.",
    icon: <TrendingUp className="w-5 h-5" />,
    cardClass: "glass-card-purple",
    iconBg: "bg-secondary/12",
    iconColor: "text-secondary",
    accentColor: "text-secondary",
    tag: "INTERGROWTH-21st",
  },
];

const SECTIONS = [
  {
    label: "Ciclo e Gestação",
    subtitle: "Datação gestacional",
    values: ["fertility", "gestational", "crl", "bpd", "biometry"] as ActiveModule[],
  },
  {
    label: "Crescimento e Hemodinâmica",
    subtitle: "Peso fetal e Doppler",
    values: ["efw", "doppler"] as ActiveModule[],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const Index = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderModule = () => {
    switch (activeModule) {
      case "fertility":   return <FertilityCalculator />;
      case "gestational": return <GestationalCalculator />;
      case "crl":         return <CRLCalculator />;
      case "bpd":         return <BPDCalculator />;
      case "biometry":    return <BiometryCalculator />;
      case "efw":         return <EFWCalculator />;
      case "doppler":     return <DopplerCalculator />;
      default:            return null;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Ambient background */}
      <div
        className="hero-gradient-orb w-[700px] h-[700px] -top-[250px] -left-[250px] fixed"
        style={{ background: "radial-gradient(circle, hsla(218,72%,32%,0.13) 0%, transparent 65%)" }}
      />
      <div
        className="hero-gradient-orb w-[500px] h-[500px] top-[40%] -right-[180px] fixed"
        style={{ background: "radial-gradient(circle, hsla(262,52%,44%,0.10) 0%, transparent 65%)" }}
      />
      <div
        className="hero-gradient-orb w-[420px] h-[420px] bottom-[8%] left-[22%] fixed"
        style={{ background: "radial-gradient(circle, hsla(25,88%,56%,0.08) 0%, transparent 65%)" }}
      />

      {/* ── Header ── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-border/60 bg-background/85 backdrop-blur-2xl shadow-nav"
            : "bg-transparent"
        }`}
      >
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Logo + brand */}
          <button
            onClick={() => setActiveModule(null)}
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="Ir para página inicial"
          >
            <img
              src={logo}
              alt="IDALIA Calc"
              className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-primary/10 group-hover:ring-primary/25 transition-all duration-300"
            />
            <span className="font-display text-base font-semibold text-foreground tracking-tight leading-none">
              IDALIA<span className="font-script text-accent text-lg leading-none ml-0.5">Calc</span>
            </span>
          </button>

          {/* Nav pills — shown only when a module is active */}
          {activeModule && (
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {NAV_ITEMS.map((nav) => (
                <button
                  key={nav.value}
                  onClick={() => setActiveModule(nav.value)}
                  className={`nav-pill whitespace-nowrap ${
                    activeModule === nav.value ? "nav-pill-active" : "nav-pill-inactive"
                  }`}
                >
                  {nav.icon}
                  <span className="hidden sm:inline">{nav.label}</span>
                  <span className="sm:hidden">{nav.short}</span>
                </button>
              ))}
            </div>
          )}

          {/* Back link when module active (mobile) */}
          {activeModule && (
            <button
              onClick={() => setActiveModule(null)}
              className="shrink-0 text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <ChevronRight className="w-3 h-3 rotate-180" />
              <span className="hidden xs:inline">Início</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="container max-w-4xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {!activeModule ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-14"
          >
            {/* ── Hero ── */}
            <motion.div variants={item} className="text-center space-y-7 pt-8 pb-4 relative">
              {/* Logo with ring effect */}
              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                  className="logo-ring"
                >
                  <img
                    src={logo}
                    alt="IDALIA Calc"
                    className="w-52 h-52 md:w-60 md:h-60 rounded-full object-cover relative z-10"
                    style={{
                      boxShadow: "0 0 0 6px hsla(218,72%,27%,0.07), 0 0 0 12px hsla(218,72%,27%,0.03), 0 20px 60px -10px rgba(15,30,70,0.25)",
                    }}
                  />
                </motion.div>
              </div>

              {/* Brand name */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/6 text-xs font-medium text-primary mb-2">
                  <Microscope className="w-3 h-3" />
                  Calculadoras Clínicas Certificadas
                </div>

                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight text-balance">
                  <span className="gradient-text-brand">
                    Saúde Reprodutiva
                  </span>
                  <br />
                  <span className="text-foreground font-bold text-2xl sm:text-3xl md:text-4xl">
                    & Medicina Fetal
                  </span>
                </h1>

                <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto leading-relaxed text-balance">
                  Ferramentas de biometria e datação gestacional para uso clínico diário,
                  fundamentadas em diretrizes internacionais.
                </p>
              </motion.div>
            </motion.div>

            {/* ── Calculator sections ── */}
            <motion.div variants={item} className="space-y-10">
              {SECTIONS.map((section) => {
                const sectionCards = CARDS.filter((c) =>
                  section.values.includes(c.value as ActiveModule)
                );
                return (
                  <div key={section.label} className="space-y-4">
                    {/* Section header */}
                    <div className="flex items-center gap-3 px-1">
                      <div className="divider-fade flex-1" />
                      <div className="text-center">
                        <p className="section-label">{section.label}</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">{section.subtitle}</p>
                      </div>
                      <div className="divider-fade flex-1" />
                    </div>

                    {/* Cards grid */}
                    <div className={`grid gap-4 ${
                      sectionCards.length === 1
                        ? "grid-cols-1 max-w-sm mx-auto"
                        : "grid-cols-1 sm:grid-cols-2"
                    }`}>
                      {sectionCards.map((card, i) => (
                        <motion.button
                          key={card.value}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          onClick={() => setActiveModule(card.value)}
                          className={`${card.cardClass} p-5 text-left group cursor-pointer w-full`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Icon block */}
                            <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 ${card.iconColor} mt-0.5 transition-transform duration-300 group-hover:scale-110`}>
                              {card.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <h2 className="font-display text-sm font-semibold text-foreground leading-snug">
                                  {card.title}
                                </h2>
                                <span className={`badge-${card.accentColor === "text-accent" ? "accent" : card.accentColor === "text-secondary" ? "secondary" : "primary"} shrink-0 text-[10px] whitespace-nowrap`}>
                                  {card.tag}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                {card.description}
                              </p>
                              <div className={`flex items-center gap-1 ${card.accentColor} text-xs font-semibold mt-0.5`}>
                                Acessar calculadora
                                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* ── Trust bar ── */}
            <motion.div variants={item}>
              <div className="flex items-center justify-center flex-wrap gap-3 sm:gap-5 py-2">
                <div className="badge-primary">
                  <Shield className="w-3 h-3" />
                  Processamento local
                </div>
                <div className="badge-primary">
                  <Microscope className="w-3 h-3" />
                  Evidência científica
                </div>
                <div className="badge-primary">
                  <Activity className="w-3 h-3" />
                  Uso clínico
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground/70 mt-2">
                Hadlock · Robinson · Shepard · INTERGROWTH-21st
              </p>
            </motion.div>

            {/* ── Scientific references ── */}
            <motion.div variants={item} className="glass-card-static p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Base Científica</h4>
                  <p className="text-xs text-muted-foreground">Referências revisadas por pares</p>
                </div>
              </div>

              <div className="divider-fade" />

              <div className="space-y-2">
                {[
                  { text: "Robinson HP, Fleming JEE — Br J Obstet Gynaecol, 1975", id: "1191154", tag: "CRL" },
                  { text: "Hadlock FP et al. — Radiology, 1984", id: "6739822", tag: "Biometria" },
                  { text: "Hadlock FP et al. — Am J Obstet Gynecol, 1985", id: "3881966", tag: "PFE" },
                  { text: "Shepard MJ et al. — Am J Obstet Gynecol, 1982", id: "7058805", tag: "PFE" },
                  { text: "INTERGROWTH-21st — Lancet, 2014", id: "25209488", tag: "Crescimento" },
                ].map((ref) => (
                  <a
                    key={ref.id}
                    href={`https://pubmed.ncbi.nlm.nih.gov/${ref.id}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary shrink-0 transition-colors" />
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate">
                        {ref.text}
                      </span>
                    </div>
                    <span className="badge-primary text-[10px] shrink-0">{ref.tag}</span>
                  </a>
                ))}
              </div>
            </motion.div>

            {/* ── Legal disclaimer ── */}
            <motion.div variants={item}>
              <div className="glass-card-static p-4 border border-destructive/20 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Aviso Legal</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      O <strong className="text-foreground">IDALIA-CALC</strong> é uma ferramenta de{" "}
                      <strong className="text-foreground">apoio à decisão clínica</strong> destinada a
                      profissionais de saúde habilitados. Os resultados são estimativas matemáticas e{" "}
                      <strong className="text-foreground">não substituem</strong> avaliação, diagnóstico
                      ou conduta médica. Nenhum dado pessoal ou clínico é coletado —
                      processamento 100% local.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderModule()}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Index;
