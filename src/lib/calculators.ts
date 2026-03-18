import {
  addDays,
  addWeeks,
  differenceInDays,
  differenceInWeeks,
  subDays,
} from "date-fns";

// ---- Types ----

export interface CycleHistory {
  periodStart: Date;
  periodEnd: Date;
  periodLength: number;
  cycleLength: number;
}

export interface FertilityResult {
  ovulationDay: Date;
  fertileStart: Date;
  fertileEnd: Date;
  nextPeriodStart: Date;
  nextPeriodEnd: Date;
  cycleVariability?: number;
}

export interface GestationalResult {
  weeks: number;
  days: number;
  dueDate: Date;
  firstTrimesterEnd: Date;
  secondTrimesterEnd: Date;
  currentTrimester: number;
  developmentInfo: DevelopmentInfo;
  prenatalCare: PrenatalCare;
}

export interface DevelopmentInfo {
  title: string;
  development: string;
  size: string;
  milestone: string;
}

export interface PrenatalCare {
  nutrition: string;
  lifestyle: string;
  warning_signs: string;
  examinations: string;
  vaccines: string;
  special_care: string;
}

// ---- Fertility Calculator ----

export function calculateFertilePeriod(
  periodStart: Date,
  periodEnd: Date,
  cycleLength: number,
  history: CycleHistory[] = []
): FertilityResult {
  const avgCycle = history.length > 1
    ? Math.round(history.reduce((s, c) => s + c.cycleLength, 0) / history.length)
    : cycleLength;

  const ovulationDay = addDays(periodStart, avgCycle - 14);
  const fertileStart = subDays(ovulationDay, 5);
  const fertileEnd = addDays(ovulationDay, 1);
  const nextPeriodStart = addDays(periodStart, avgCycle);
  const periodLength = differenceInDays(periodEnd, periodStart) + 1;
  const nextPeriodEnd = addDays(nextPeriodStart, periodLength - 1);

  let cycleVariability: number | undefined;
  if (history.length > 1) {
    const lengths = history.map((c) => c.cycleLength);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    cycleVariability = Math.round(
      Math.sqrt(lengths.reduce((s, l) => s + (l - mean) ** 2, 0) / lengths.length)
    );
  }

  return { ovulationDay, fertileStart, fertileEnd, nextPeriodStart, nextPeriodEnd, cycleVariability };
}

// ---- Cycle Phase Detail ----

export interface CyclePhaseDetail {
  mucus: string;
  bbt: string;
  hormones: string;
}

const PHASE_DETAILS: Record<string, CyclePhaseDetail> = {
  menstrual: {
    mucus: "Geralmente não observável durante o período de sangramento. Pode haver presença residual de muco cervical misturado ao fluxo menstrual nos últimos dias da fase.",
    bbt: "A temperatura corporal basal (TCB) tende a atingir os valores mais baixos do ciclo, compatível com os níveis reduzidos de progesterona nesta fase.",
    hormones: "O FSH (hormônio folículo-estimulante) inicia elevação para recrutamento folicular. Estradiol e progesterona encontram-se em concentrações basais.",
  },
  folicular: {
    mucus: "Inicialmente escasso e de consistência espessa. Torna-se progressivamente mais fluido, transparente e filante à medida que os níveis de estradiol se elevam.",
    bbt: "Mantém-se na faixa hipotérmica (fase pré-ovulatória). Oscilações discretas são consideradas fisiológicas.",
    hormones: "Estradiol eleva-se progressivamente. O FSH estimula o crescimento folicular e a seleção do folículo dominante. O LH permanece em níveis basais.",
  },
  "fértil": {
    mucus: "Muco cervical filante (spinnbarkeit), transparente e de alta elasticidade — indicador clínico mais confiável da janela fértil. Pode apresentar extensibilidade de vários centímetros.",
    bbt: "Permanece na faixa hipotérmica, podendo apresentar discreta depressão (nadir térmico) imediatamente antes da ovulação — achado nem sempre identificável.",
    hormones: "Pico de estradiol. O LH inicia elevação acentuada (pico de LH), desencadeando a ovulação em aproximadamente 24 a 36 horas.",
  },
  "ovulatória": {
    mucus: "Muco cervical em pico de filância e transparência. Máxima receptividade cervical ao trânsito espermático.",
    bbt: "Nadir térmico seguido de elevação sustentada de 0,2 a 0,5 °C nas 24 a 48 horas subsequentes à ovulação, confirmando a ruptura folicular.",
    hormones: "Pico máximo de LH. Queda transitória do estradiol. A progesterona começa a ser secretada pelo corpo lúteo recém-formado.",
  },
  "lútea": {
    mucus: "Muco cervical torna-se espesso, opaco e em menor quantidade, formando tampão cervical. Nos dias finais da fase, pode haver ausência de muco perceptível.",
    bbt: "Elevada (fase hipertérmica) por ação termogênica da progesterona. Manutenção do platô térmico por 18 dias ou mais pode sugerir gestação.",
    hormones: "Predomínio de progesterona (secretada pelo corpo lúteo). Estradiol apresenta segunda elevação de menor amplitude. Ambos declinam ao final da fase na ausência de implantação.",
  },
};

export function getCyclePhaseDetail(phase: string): CyclePhaseDetail {
  return PHASE_DETAILS[phase] || PHASE_DETAILS["folicular"];
}

// ---- Gestational Calculator ----

function gestationalFromTotalDays(totalDays: number, referenceDate: Date): GestationalResult {
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  const dueDate = addDays(referenceDate, 280 - totalDays);
  const firstTrimesterEnd = addWeeks(referenceDate, 13 - weeks > 0 ? 13 : 0);
  const secondTrimesterEnd = addWeeks(referenceDate, 27 - weeks > 0 ? 27 : 0);

  // Recalculate trimester end dates from conception reference
  const conceptionApprox = subDays(referenceDate, totalDays);
  const ftEnd = addWeeks(conceptionApprox, 13);
  const stEnd = addWeeks(conceptionApprox, 27);

  const currentTrimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;

  return {
    weeks,
    days,
    dueDate,
    firstTrimesterEnd: ftEnd,
    secondTrimesterEnd: stEnd,
    currentTrimester,
    developmentInfo: getGestationalDevelopmentInfo(weeks),
    prenatalCare: getPrenatalCareRecommendations(weeks),
  };
}

export function calculateGestationalAgeFromLMP(lmpDate: Date): GestationalResult {
  const today = new Date();
  const totalDays = differenceInDays(today, lmpDate);
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  const dueDate = addDays(lmpDate, 280);
  const firstTrimesterEnd = addWeeks(lmpDate, 13);
  const secondTrimesterEnd = addWeeks(lmpDate, 27);
  const currentTrimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;

  return {
    weeks, days, dueDate, firstTrimesterEnd, secondTrimesterEnd, currentTrimester,
    developmentInfo: getGestationalDevelopmentInfo(weeks),
    prenatalCare: getPrenatalCareRecommendations(weeks),
  };
}

export function calculateGestationalAgeFromUltrasound(
  ultrasoundDate: Date,
  usWeeks: number,
  usDays: number
): GestationalResult {
  const today = new Date();
  const daysSinceUS = differenceInDays(today, ultrasoundDate);
  const totalDaysAtUS = usWeeks * 7 + usDays;
  const totalDaysNow = totalDaysAtUS + daysSinceUS;
  const estimatedLMP = subDays(ultrasoundDate, totalDaysAtUS);
  const dueDate = addDays(estimatedLMP, 280);
  const weeks = Math.floor(totalDaysNow / 7);
  const days = totalDaysNow % 7;
  const firstTrimesterEnd = addWeeks(estimatedLMP, 13);
  const secondTrimesterEnd = addWeeks(estimatedLMP, 27);
  const currentTrimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;

  return {
    weeks, days, dueDate, firstTrimesterEnd, secondTrimesterEnd, currentTrimester,
    developmentInfo: getGestationalDevelopmentInfo(weeks),
    prenatalCare: getPrenatalCareRecommendations(weeks),
  };
}

export function calculateGestationalAgeFromTransfer(
  transferDate: Date,
  embryoDays: number
): GestationalResult {
  const today = new Date();
  // Gestational age = days since transfer + embryo age + 14 (to account for "LMP equivalent")
  const daysSinceTransfer = differenceInDays(today, transferDate);
  const totalDays = daysSinceTransfer + embryoDays + 14;
  const estimatedLMP = subDays(transferDate, embryoDays + 14);
  const dueDate = addDays(estimatedLMP, 280);
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  const firstTrimesterEnd = addWeeks(estimatedLMP, 13);
  const secondTrimesterEnd = addWeeks(estimatedLMP, 27);
  const currentTrimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;

  return {
    weeks, days, dueDate, firstTrimesterEnd, secondTrimesterEnd, currentTrimester,
    developmentInfo: getGestationalDevelopmentInfo(weeks),
    prenatalCare: getPrenatalCareRecommendations(weeks),
  };
}

// ---- Development Info by Week ----

export function getGestationalDevelopmentInfo(weeks: number): DevelopmentInfo {
  const info: Record<number, DevelopmentInfo> = {
    4: { title: "Implantação", development: "O blastocisto se implanta no útero. Formação das camadas celulares iniciais.", size: "Semente de papoula (~1mm)", milestone: "Implantação uterina completa" },
    5: { title: "Início do Coração", development: "Tubo cardíaco primitivo começa a pulsar. Formação do tubo neural.", size: "Semente de gergelim (~2mm)", milestone: "Primeiros batimentos cardíacos" },
    6: { title: "Brotos dos Membros", development: "Pequenos brotos onde serão os braços e pernas. Formação das vesículas ópticas.", size: "Lentilha (~4mm)", milestone: "Início da formação dos membros" },
    7: { title: "Formação Facial", development: "Formação do rosto, narinas, lentes dos olhos. O cérebro cresce rapidamente.", size: "Mirtilo (~8mm)", milestone: "Características faciais emergentes" },
    8: { title: "Movimentos Iniciais", development: "Dedos começam a se separar. Movimentos espontâneos (não sentidos). Todos os órgãos essenciais iniciados.", size: "Framboesa (~1.6cm)", milestone: "Fim do período embrionário" },
    10: { title: "Período Fetal", development: "Todos os órgãos formados e começam a funcionar. Dedos completamente separados. Unhas começam.", size: "Morango (~3cm)", milestone: "Início do período fetal" },
    12: { title: "Reflexos", development: "Reflexos aparecem. Genitália externa diferenciando. Rins produzem urina. O feto engole líquido amniótico.", size: "Limão (~5.5cm)", milestone: "Reflexos e movimentos ativos" },
    16: { title: "Proporções Humanas", development: "Corpo cresce mais rápido que a cabeça. Expressões faciais. Impressões digitais se formam.", size: "Abacate (~12cm)", milestone: "Movimentos podem ser sentidos (multíparas)" },
    20: { title: "Anatomia Completa", development: "Metade da gestação. Verniz caseoso cobre a pele. Cabelos (lanugo). Ciclos de sono.", size: "Banana (~25cm)", milestone: "Ultrassom morfológico — anatomia fetal visível" },
    24: { title: "Viabilidade", development: "Pulmões produzem surfactante. Audição funcional. Respostas a estímulos externos.", size: "Espiga de milho (~30cm)", milestone: "Limiar de viabilidade fetal" },
    28: { title: "3º Trimestre", development: "Olhos abrem. Sistema nervoso em maturação rápida. Camada de gordura subcutânea.", size: "Berinjela (~38cm)", milestone: "Início do terceiro trimestre" },
    32: { title: "Ganho de Peso", development: "Ganho de peso acelerado (~200g/semana). Pulmões em amadurecimento. Movimentos mais coordenados.", size: "Jicama (~42cm)", milestone: "Maturação pulmonar avançando" },
    36: { title: "Quase Maduro", development: "Pulmões quase maduros. O feto geralmente assume posição cefálica. Vérnix espesso.", size: "Papaia (~47cm)", milestone: "Posição para o parto" },
    38: { title: "Termo Inicial", development: "Considerado a termo. Órgãos funcionais. Reflexos de sucção e deglutição maduros.", size: "Melão (~50cm, ~3kg)", milestone: "Pronto para o nascimento" },
    40: { title: "Data Provável", development: "Maturidade completa. Verniz caseoso absorvido. Pronto para vida extrauterina.", size: "Melancia pequena (~51cm, ~3.4kg)", milestone: "Data provável do parto" },
  };

  // Find closest week
  const keys = Object.keys(info).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) {
    if (k <= weeks) closest = k;
    else break;
  }

  return info[closest] || {
    title: `Semana ${weeks}`,
    development: "O desenvolvimento fetal continua conforme esperado para esta fase gestacional.",
    size: "Consulte seu profissional de saúde para medições atualizadas.",
    milestone: "Acompanhamento pré-natal regular recomendado.",
  };
}

// ---- Prenatal Care Recommendations ----

export function getPrenatalCareRecommendations(weeks: number): PrenatalCare {
  if (weeks < 13) {
    return {
      nutrition: "Ácido fólico (400-800mcg/dia). Evitar álcool, tabaco e drogas. Limitar cafeína a 200mg/dia. Dieta rica em ferro, cálcio e proteínas.",
      lifestyle: "Atividade física leve a moderada (caminhada, natação). Evitar esforço excessivo. Manter hidratação adequada. Descanso quando necessário.",
      warning_signs: "Sangramento vaginal intenso, dor abdominal severa, febre acima de 38°C, perda de líquido. Procure atendimento imediato.",
      examinations: "Hemograma, tipagem sanguínea, sorologias (HIV, sífilis, hepatites B e C, toxoplasmose, rubéola), glicemia de jejum, urina tipo 1, ultrassom obstétrico inicial.",
      vaccines: "Verificar carteira vacinal. Hepatite B (se necessário). Influenza (se período sazonal). dTpa a partir de 20 semanas.",
      special_care: "Evitar medicamentos sem prescrição médica. Suplementação de ácido fólico e ferro conforme orientação. Primeira consulta pré-natal o mais cedo possível.",
    };
  }
  if (weeks < 27) {
    return {
      nutrition: "Aumentar ingestão calórica em ~300kcal/dia. Manter ferro, cálcio, vitamina D. Omega-3 (DHA). Fibras para prevenir constipação.",
      lifestyle: "Exercícios moderados continuados. Uso de cinto de segurança abaixo do abdome. Posição lateral para dormir (preferencialmente esquerda).",
      warning_signs: "Contrações regulares antes de 37 semanas, sangramento, inchaço repentino de rosto/mãos, alterações visuais, cefaleia persistente.",
      examinations: "Ultrassom morfológico (20-24 sem). Teste de tolerância à glicose (24-28 sem). Hemograma. Urina tipo 1. Acompanhamento de peso e pressão arterial.",
      vaccines: "dTpa (entre 27 e 36 semanas, idealmente). Influenza se não tomou no 1º trimestre.",
      special_care: "Atenção a movimentos fetais (começam a ser percebidos). Preparação para o parto pode ser iniciada. Cuidados com a pele (hidratação para prevenir estrias).",
    };
  }
  return {
    nutrition: "Refeições menores e mais frequentes. Manter hidratação. Alimentos ricos em ferro. Evitar alimentos crus ou mal-cozidos.",
    lifestyle: "Preparar bolsa da maternidade. Conhecer sinais de trabalho de parto. Exercícios de respiração e relaxamento. Descanso adequado.",
    warning_signs: "Diminuição dos movimentos fetais, contrações regulares com intervalos decrescentes, ruptura da bolsa, sangramento, pressão alta, inchaço severo.",
    examinations: "Consultas quinzenais (32-36 sem) e semanais (37+ sem). Monitoramento de crescimento fetal. Cardiotocografia se indicado. Cultura para Streptococcus B (35-37 sem).",
    vaccines: "Completar dTpa se não fez entre 27-36 semanas.",
    special_care: "Plano de parto. Identificar sinais de trabalho de parto verdadeiro vs falso. Posição do bebê. Preparo perineal se desejado. Apoio emocional e rede de suporte.",
  };
}
