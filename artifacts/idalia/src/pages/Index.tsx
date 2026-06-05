import { lazy, Suspense, useEffect, useState } from "react";
import { PageMeta } from "@/components/PageMeta";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Baby, ArrowRight, Shield, Ruler, Scale, Activity, BookOpen, Microscope, Waves, TrendingUp, User, LogIn, ShieldAlert, HeartPulse } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import logoSm from "@/assets/logo-sm.webp";
import logoMd from "@/assets/logo-md.webp";
import JsonLd from "@/components/JsonLd";

const HOME_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": "https://idcalc.com/#webapplication",
  "name": "IDALIA Calc",
  "url": "https://idcalc.com/",
  "applicationCategory": "MedicalApplication",
  "operatingSystem": "Web",
  "description": "Calculadoras clínicas de biometria e datação gestacional, fundamentadas em diretrizes internacionais. Inclui cálculo de período fértil, idade gestacional, biometria fetal, peso fetal estimado, Doppler obstétrico, curva de crescimento fetal, risco de trissomias e risco de pré-eclâmpsia.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "BRL"
  },
  "audience": {
    "@type": "MedicalAudience",
    "audienceType": "Clinician"
  },
  "inLanguage": "pt-BR",
  "isPartOf": { "@id": "https://idcalc.com/#website" }
};

const CARDS: {
  route: string;
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
    route: "/fertility",
    title: "Ciclo Menstrual e Período Fértil",
    description: "Estimativa da janela fértil, data de ovulação e previsão da próxima menstruação.",
    icon: <Heart className="w-5 h-5" />,
    cardClass: "glass-card-warm",
    iconBg: "bg-accent/12",
    iconColor: "text-accent",
    accentColor: "text-accent",
    tag: "Fertilidade",
  },
  {
    route: "/gestational",
    title: "Idade Gestacional e DPP",
    description: "Cálculo por DUM, ultrassonografia ou transferência embrionária.",
    icon: <Baby className="w-5 h-5" />,
    cardClass: "glass-card-purple",
    iconBg: "bg-secondary/12",
    iconColor: "text-secondary",
    accentColor: "text-secondary",
    tag: "Gestação",
  },
  {
    route: "/biometry",
    title: "Biometria Fetal",
    description: "IG por CCN, DBP individual ou biometria composta (DBP, CC, CA, CF).",
    icon: <Activity className="w-5 h-5" />,
    cardClass: "glass-card-blue",
    iconBg: "bg-primary/12",
    iconColor: "text-primary",
    accentColor: "text-primary",
    tag: "CRL · DBP · Composta",
  },
  {
    route: "/efw",
    title: "Peso Fetal Estimado (PFE)",
    description: "Cálculo do peso fetal com classificação por percentil.",
    icon: <Scale className="w-5 h-5" />,
    cardClass: "glass-card-warm",
    iconBg: "bg-accent/12",
    iconColor: "text-accent",
    accentColor: "text-accent",
    tag: "Crescimento",
  },
  {
    route: "/doppler",
    title: "Doppler Obstétrico",
    description: "Velocimetria das artérias umbilical, cerebral média e uterina (RCP).",
    icon: <Waves className="w-5 h-5" />,
    cardClass: "glass-card-blue",
    iconBg: "bg-primary/12",
    iconColor: "text-primary",
    accentColor: "text-primary",
    tag: "Hemodinâmica",
  },
  {
    route: "/growth-curve",
    title: "Curva de Crescimento Fetal",
    description: "Percentis INTERGROWTH-21st com gráfico interativo e avaliação longitudinal.",
    icon: <TrendingUp className="w-5 h-5" />,
    cardClass: "glass-card-purple",
    iconBg: "bg-secondary/12",
    iconColor: "text-secondary",
    accentColor: "text-secondary",
    tag: "INTERGROWTH-21st",
  },
  {
    route: "/trisomy-risk",
    title: "Risco de Trissomias",
    description: "Rastreamento combinado do 1º trimestre: TN, bioquímica sérica e marcadores adicionais.",
    icon: <ShieldAlert className="w-5 h-5" />,
    cardClass: "glass-card-warm",
    iconBg: "bg-accent/12",
    iconColor: "text-accent",
    accentColor: "text-accent",
    tag: "T21 · T18 · T13",
  },
  {
    route: "/preeclampsia-risk",
    title: "Risco de Pré-Eclâmpsia",
    description: "Modelo FMF com fatores maternos, PAM, Doppler uterino, PAPP-A e PlGF.",
    icon: <HeartPulse className="w-5 h-5" />,
    cardClass: "glass-card-blue",
    iconBg: "bg-primary/12",
    iconColor: "text-primary",
    accentColor: "text-primary",
    tag: "FMF / ASPRE",
  },
];

const SECTIONS = [
  {
    label: "Ciclo e Gestação",
    subtitle: "Datação gestacional",
    routes: ["/fertility", "/gestational", "/biometry"],
  },
  {
    label: "Crescimento e Hemodinâmica",
    subtitle: "Peso fetal, Doppler e curvas",
    routes: ["/efw", "/doppler", "/growth-curve"],
  },
  {
    label: "Rastreamento de Risco",
    subtitle: "Trissomias e pré-eclâmpsia",
    routes: ["/trisomy-risk", "/preeclampsia-risk"],
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

const REFERENCES = [
  { text: "Robinson HP, Fleming JEE — Br J Obstet Gynaecol, 1975", id: "1191154", tag: "CRL" },
  { text: "Hadlock FP et al. — Radiology, 1984", id: "6739822", tag: "Biometria" },
  { text: "Hadlock FP et al. — Am J Obstet Gynecol, 1985", id: "3881966", tag: "PFE" },
  { text: "Shepard MJ et al. — Am J Obstet Gynecol, 1982", id: "7058805", tag: "PFE" },
  { text: "INTERGROWTH-21st — Lancet, 2014", id: "25209488", tag: "Crescimento" },
  { text: "Kagan KO et al. — Ultrasound Obstet Gynecol, 2008", id: "18634131", tag: "Trissomias" },
  { text: "Rolnik DL et al. (ASPRE) — N Engl J Med, 2017", id: "28657417", tag: "Pré-Eclâmpsia" },
];

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <PageMeta
        title="Calculadoras Obstétricas e de Saúde Reprodutiva"
        description="Calculadoras baseadas em evidências para período fértil, biometria fetal, idade gestacional e risco obstétrico. Precisão clínica para obstetras e ginecologistas."
        path="/"
      />
      <JsonLd data={HOME_SCHEMA as Record<string, unknown>} />
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
          <Link
            to="/"
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="Ir para página inicial"
          >
            <img
              src={logoSm}
              alt="IDALIA Calc"
              className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-primary/10 group-hover:ring-primary/25 transition-all duration-300"
            />
            <span className="font-display text-base font-semibold text-foreground tracking-tight leading-none">
              IDALIA<span className="font-script text-accent text-lg leading-none ml-0.5">Calc</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-1.5 text-xs">
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Painel</span>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="gap-1.5 text-xs">
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Entrar</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="container max-w-4xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="space-y-12"
        >
          {/* ── Hero (compact — logo already in header) ── */}
          <motion.div variants={item} className="text-center space-y-4 pt-6 pb-2">
            <div className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
              <div
                aria-hidden
                className="absolute inset-0 rounded-full animate-spin-slow"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.55) 60deg, hsl(var(--accent) / 0.6) 140deg, transparent 220deg, hsl(var(--secondary) / 0.5) 300deg, transparent 360deg)",
                  filter: "blur(14px)",
                }}
              />
              <div
                aria-hidden
                className="absolute inset-1 rounded-full animate-spin-reverse opacity-70"
                style={{
                  background:
                    "conic-gradient(from 180deg, transparent 0deg, hsl(var(--accent) / 0.45) 90deg, transparent 180deg, hsl(var(--primary) / 0.45) 270deg, transparent 360deg)",
                  filter: "blur(10px)",
                }}
              />
              <img
                src={logoMd}
                alt="IDALIA Calc"
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-lg ring-4 ring-primary/10"
              />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight text-balance">
              <span className="gradient-text-brand">Saúde Reprodutiva</span>
              <br />
              <span className="text-foreground font-bold text-2xl sm:text-3xl md:text-4xl">
                & Medicina Fetal
              </span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto leading-relaxed text-balance">
              Calculadoras clínicas de biometria e datação gestacional,
              fundamentadas em diretrizes internacionais.
            </p>

            {!user && (
              <div className="flex items-center justify-center pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate("/sign-up")}
                  className="gap-2 w-full sm:w-auto"
                >
                  Criar conta
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </motion.div>

          {/* ── Calculator sections ── */}
          <motion.div variants={item} className="space-y-10">
            {SECTIONS.map((section) => {
              const sectionCards = CARDS.filter((c) =>
                section.routes.includes(c.route)
              );
              return (
                <div key={section.label} className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                    <div className="divider-fade flex-1" />
                    <div className="text-center">
                      <p className="section-label">{section.label}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">{section.subtitle}</p>
                    </div>
                    <div className="divider-fade flex-1" />
                  </div>

                  <div className={`grid gap-4 ${
                    sectionCards.length === 1
                      ? "grid-cols-1 max-w-sm mx-auto"
                      : "grid-cols-1 sm:grid-cols-2"
                  }`}>
                    {sectionCards.map((card, i) => (
                      <motion.div
                        key={card.route}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link
                          to={card.route}
                          className={`${card.cardClass} p-5 text-left group cursor-pointer w-full block`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 ${card.iconColor} mt-0.5 transition-transform duration-300 group-hover:scale-110`}>
                              {card.icon}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-display text-sm font-semibold text-foreground leading-snug">
                                  {card.title}
                                </p>
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
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* ── Footer: Trust + References + Disclaimer (single card) ── */}
          <motion.div variants={item} className="glass-card-static p-5 space-y-5">
            <div className="flex items-center justify-center flex-wrap gap-3 sm:gap-5">
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

            <div className="divider-fade" />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Referências</h4>
              </div>
              {REFERENCES.map((ref) => (
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

            <div className="divider-fade" />

            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Aviso Legal</strong> — O IDALIA-CALC é uma ferramenta de apoio à decisão clínica destinada a profissionais habilitados. Os resultados são estimativas matemáticas e <strong className="text-foreground">não substituem</strong> avaliação, diagnóstico ou conduta médica. Processamento 100% local.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <footer className="border-t border-border/40 bg-muted/30 mt-12">
        <div className="container max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} IDALIA Calc — Saúde Reprodutiva & Medicina Fetal</span>
          <div className="flex items-center gap-4">
            <Link to="/termos" className="hover:text-foreground transition-colors">Termos de Uso</Link>
            <Link to="/privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
