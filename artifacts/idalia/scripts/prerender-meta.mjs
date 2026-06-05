/**
 * Post-build prerender script.
 * Reads dist/public/index.html and generates per-route HTML files with
 * route-specific <title>, <meta name="description">, canonical URL, and
 * Open Graph / Twitter card tags pre-injected. This lets non-JS bots (social
 * crawlers, AI crawlers) receive correct head metadata without executing React.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "../dist/public");
const BASE_URL = "https://idcalc.com";
const SITE_NAME = "IDALIA Calc";
const OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/ufQK6LGtuvVSYYkWQadeh2DIPSD3/social-images/social-1776829286751-w_XTP9uyjaadOYsH_(1).webp";

const routes = [
  {
    path: "/",
    outDir: "",
    title: "Calculadoras Obstétricas e de Saúde Reprodutiva",
    description:
      "Calculadoras baseadas em evidências para período fértil, biometria fetal, idade gestacional e risco obstétrico. Precisão clínica para obstetras e ginecologistas.",
  },
  {
    path: "/pricing",
    outDir: "pricing",
    title: "Planos e Preços",
    description:
      "Conheça os planos do IDALIA Calc: acesso gratuito e premium a calculadoras obstétricas baseadas em evidências para profissionais de saúde.",
  },
  {
    path: "/termos",
    outDir: "termos",
    title: "Termos de Uso",
    description:
      "Leia os Termos de Uso do IDALIA Calc. Conheça as condições de uso das calculadoras obstétricas e os direitos e responsabilidades dos usuários.",
  },
  {
    path: "/privacidade",
    outDir: "privacidade",
    title: "Política de Privacidade",
    description:
      "Saiba como o IDALIA Calc coleta, usa e protege seus dados. Nossa política de privacidade garante transparência no tratamento de informações de saúde.",
  },
  {
    path: "/gestational",
    outDir: "gestational",
    title: "Calculadora de Idade Gestacional",
    description:
      "Calcule a idade gestacional pela DUM, ultrassom ou FIV. Estime a data provável do parto com precisão baseada em evidências — IDALIA Calc.",
  },
  {
    path: "/fertility",
    outDir: "fertility",
    title: "Calculadora do Período Fértil",
    description:
      "Identifique os dias férteis, a ovulação e a janela de concepção com base no ciclo menstrual. Calculadora de período fértil baseada em evidências — IDALIA Calc.",
  },
  {
    path: "/biometry",
    outDir: "biometry",
    title: "Calculadora de Biometria Fetal",
    description:
      "Avalie DBP, CA, CC e CF para estimar a idade gestacional e o peso fetal. Biometria fetal baseada nas referências INTERGROWTH-21st — IDALIA Calc.",
  },
  {
    path: "/bpd",
    outDir: "bpd",
    title: "Calculadora de DBP — Diâmetro Biparietal",
    description:
      "Estime a idade gestacional e a data do parto pelo Diâmetro Biparietal (DBP) fetal. Cálculo baseado em curvas de referência validadas — IDALIA Calc.",
  },
  {
    path: "/crl",
    outDir: "crl",
    title: "Calculadora de CCN — Comprimento Cabeça-Nádega",
    description:
      "Calcule a idade gestacional pelo Comprimento Cabeça-Nádega (CCN/CRL) no primeiro trimestre. Referência de Robinson & Fleming — IDALIA Calc.",
  },
  {
    path: "/efw",
    outDir: "efw",
    title: "Calculadora de Peso Fetal Estimado",
    description:
      "Estime o peso fetal (PFE) pelas fórmulas de Hadlock. Avalie o percentil e identifique restrição de crescimento intrauterino (RCIU) — IDALIA Calc.",
  },
  {
    path: "/doppler",
    outDir: "doppler",
    title: "Calculadora de Dopplervelocimetria Fetal",
    description:
      "Avalie índices de resistência e pulsatilidade das artérias umbilical, cerebral média, uterina e ductus venoso. Dopplervelocimetria fetal baseada em evidências — IDALIA Calc.",
  },
  {
    path: "/growth-curve",
    outDir: "growth-curve",
    title: "Curvas de Crescimento Fetal",
    description:
      "Acompanhe o crescimento fetal ao longo da gestação com curvas baseadas nas referências INTERGROWTH-21st e Hadlock. Avalie percentis e tendências — IDALIA Calc.",
  },
];

const template = readFileSync(join(distDir, "index.html"), "utf8");

for (const route of routes) {
  const fullTitle = `${route.title} | ${SITE_NAME}`;
  const canonicalUrl = `${BASE_URL}${route.path}`;

  const metaTags = `
    <title>${fullTitle}</title>
    <meta name="description" content="${route.description}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${fullTitle}" />
    <meta property="og:description" content="${route.description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${fullTitle}" />
    <meta name="twitter:description" content="${route.description}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />`;

  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${fullTitle}</title>`)
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${route.description}" />`
    )
    .replace(
      /<meta property="og:title"[^>]*>/,
      `<meta property="og:title" content="${fullTitle}" />`
    )
    .replace(
      /<meta name="twitter:title"[^>]*>/,
      `<meta name="twitter:title" content="${fullTitle}" />`
    )
    .replace(
      /<meta property="og:description"[^>]*>/,
      `<meta property="og:description" content="${route.description}" />`
    )
    .replace(
      /<meta name="twitter:description"[^>]*>/,
      `<meta name="twitter:description" content="${route.description}" />`
    );

  if (!html.includes('<link rel="canonical"')) {
    html = html.replace("</head>", `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
  } else {
    html = html.replace(
      /<link rel="canonical"[^>]*>/,
      `<link rel="canonical" href="${canonicalUrl}" />`
    );
  }

  if (!html.includes('<meta property="og:url"')) {
    html = html.replace("</head>", `  <meta property="og:url" content="${canonicalUrl}" />\n</head>`);
  } else {
    html = html.replace(
      /<meta property="og:url"[^>]*>/,
      `<meta property="og:url" content="${canonicalUrl}" />`
    );
  }

  if (route.outDir === "") {
    writeFileSync(join(distDir, "index.html"), html);
    console.log(`  updated: /index.html (${route.path})`);
  } else {
    const routeDir = join(distDir, route.outDir);
    mkdirSync(routeDir, { recursive: true });
    writeFileSync(join(routeDir, "index.html"), html);
    console.log(`  created: /${route.outDir}/index.html (${route.path})`);
  }
}

console.log(`\nPrerender complete — ${routes.length} routes processed.`);
