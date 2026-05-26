import { addDays, addWeeks, differenceInDays, subDays } from "date-fns";

export interface DevelopmentInfo {
  title: string;
  development: string;
  size: string;
  milestone: string;
}

export interface GestationalResult {
  weeks: number;
  days: number;
  dueDate: Date;
  firstTrimesterEnd: Date;
  secondTrimesterEnd: Date;
  currentTrimester: number;
  developmentInfo: DevelopmentInfo;
}

export function calculateGestationalAgeFromLMP(lmpDate: Date): GestationalResult {
  const today = new Date();
  const totalDays = differenceInDays(today, lmpDate);
  return resultFromLMP(lmpDate, totalDays);
}

export function calculateGestationalAgeFromUltrasound(
  ultrasoundDate: Date,
  usWeeks: number,
  usDays: number,
): GestationalResult {
  const today = new Date();
  const totalDaysAtUS = usWeeks * 7 + usDays;
  const daysSinceUS = differenceInDays(today, ultrasoundDate);
  const estimatedLMP = subDays(ultrasoundDate, totalDaysAtUS);
  return resultFromLMP(estimatedLMP, totalDaysAtUS + daysSinceUS);
}

export function calculateGestationalAgeFromTransfer(
  transferDate: Date,
  embryoDays: number,
): GestationalResult {
  const today = new Date();
  const daysSinceTransfer = differenceInDays(today, transferDate);
  const totalDays = daysSinceTransfer + embryoDays + 14;
  const estimatedLMP = subDays(transferDate, embryoDays + 14);
  return resultFromLMP(estimatedLMP, totalDays);
}

function resultFromLMP(lmpDate: Date, totalDays: number): GestationalResult {
  const weeks = Math.max(0, Math.floor(totalDays / 7));
  const days = ((totalDays % 7) + 7) % 7;
  const dueDate = addDays(lmpDate, 280);
  const firstTrimesterEnd = addWeeks(lmpDate, 13);
  const secondTrimesterEnd = addWeeks(lmpDate, 27);
  const currentTrimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;
  return {
    weeks,
    days,
    dueDate,
    firstTrimesterEnd,
    secondTrimesterEnd,
    currentTrimester,
    developmentInfo: getGestationalDevelopmentInfo(weeks),
  };
}

export function getGestationalDevelopmentInfo(weeks: number): DevelopmentInfo {
  const info: Record<number, DevelopmentInfo> = {
    4: { title: "Implantação", development: "Nidação do blastocisto na parede uterina. Diferenciação das camadas germinativas (ectoderma, mesoderma, endoderma).", size: "~1 mm (semente de papoula)", milestone: "Conclusão da implantação uterina" },
    5: { title: "Atividade Cardíaca Inicial", development: "O tubo cardíaco primitivo inicia atividade contrátil rítmica. Início da neurulação.", size: "~2 mm (CCN)", milestone: "Início da atividade cardíaca embrionária" },
    6: { title: "Esboços dos Membros", development: "Formação dos esboços dos membros e das vesículas ópticas.", size: "~4 mm (CCN)", milestone: "Início da formação dos membros" },
    7: { title: "Morfogênese Facial", development: "Formação das estruturas faciais, fossas nasais e cristalinos. Crescimento acelerado do encéfalo.", size: "~8 mm (CCN)", milestone: "Diferenciação craniofacial" },
    8: { title: "Fim do Período Embrionário", development: "Separação dos dígitos. Organogênese essencialmente concluída.", size: "~1,6 cm (CCN)", milestone: "Transição embrionário → fetal" },
    10: { title: "Período Fetal Inicial", development: "Órgãos formados e em início de maturação funcional. Lâminas ungueais.", size: "~3 cm (CCN)", milestone: "Início do período fetal" },
    12: { title: "Atividade Reflexa", development: "Reflexos primitivos. Diferenciação da genitália externa. Início da função renal.", size: "~5,5 cm (CCN)", milestone: "Reflexos motores e atividade renal" },
    16: { title: "Proporcionalidade Corporal", development: "Crescimento corporal proporcionalmente mais rápido que o cefálico.", size: "~12 cm", milestone: "Movimentos fetais possíveis em multíparas" },
    20: { title: "Avaliação Morfológica", development: "Metade da gestação. Vérnix caseosa. Ciclos de sono-vigília.", size: "~25 cm", milestone: "USG morfológica de 2º trimestre" },
    24: { title: "Limiar de Viabilidade", development: "Produção de surfactante. Maturação auditiva.", size: "~30 cm", milestone: "Limiar de viabilidade extrauterina" },
    28: { title: "Início do 3º Trimestre", development: "Abertura palpebral. Maturação acelerada do SNC.", size: "~38 cm", milestone: "Início do terceiro trimestre" },
    32: { title: "Ganho Ponderal Acelerado", development: "Ganho de ~200 g/semana. Maturação pulmonar.", size: "~42 cm", milestone: "Progressão da maturidade pulmonar" },
    36: { title: "Pré-termo Tardio", development: "Maturação pulmonar avançada. Apresentação cefálica habitual.", size: "~47 cm", milestone: "Insinuação fetal na pelve" },
    38: { title: "Gestação a Termo", development: "Maturidade funcional dos sistemas. Sucção e deglutição plenas.", size: "~50 cm, ~3.000 g", milestone: "Maturidade para o nascimento" },
    40: { title: "Data Provável do Parto", development: "Maturidade completa. Aptidão para vida extrauterina.", size: "~51 cm, ~3.400 g", milestone: "Data provável do parto (DPP)" },
  };
  const keys = Object.keys(info).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) {
    if (k <= weeks) closest = k;
    else break;
  }
  return (
    info[closest] || {
      title: `Semana ${weeks}`,
      development: "Desenvolvimento fetal em curso.",
      size: "Biometria a verificar em USG.",
      milestone: "Manutenção do pré-natal recomendada.",
    }
  );
}

export function formatGA(weeks: number, days: number): string {
  return `${weeks}s ${days}d`;
}

export function trimesterLabel(t: number): string {
  return t === 1 ? "1º trimestre" : t === 2 ? "2º trimestre" : "3º trimestre";
}
