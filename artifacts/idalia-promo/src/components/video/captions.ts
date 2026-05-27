export type Caption = { start: number; end: number; text: string };

export const SCENE_CAPTIONS: Record<string, Caption[]> = {
  hook: [
    { start: 0.0, end: 1.6, text: 'IdaliaCalc.' },
    { start: 1.6, end: 5.6, text: 'Cálculos clínicos para medicina fetal e saúde reprodutiva.' },
  ],
  suite: [
    { start: 0.0, end: 2.4, text: 'Dez calculadoras validadas:' },
    { start: 2.4, end: 4.4, text: 'datação, biometria, peso fetal,' },
    { start: 4.4, end: 6.6, text: 'crescimento, doppler,' },
    { start: 6.6, end: 9.0, text: 'pré-eclâmpsia, trissomias' },
    { start: 9.0, end: 11.8, text: 'e fertilidade.' },
  ],
  dating: [
    { start: 0.0, end: 2.6, text: 'Idade gestacional precisa —' },
    { start: 2.6, end: 5.0, text: 'a partir da última menstruação,' },
    { start: 5.0, end: 6.8, text: 'ultrassonografia de primeiro trimestre' },
    { start: 6.8, end: 9.0, text: 'ou fertilização in vitro.' },
  ],
  biometry: [
    { start: 0.0, end: 2.4, text: 'Biometria fetal completa:' },
    { start: 2.4, end: 4.6, text: 'diâmetro biparietal,' },
    { start: 4.6, end: 7.0, text: 'circunferências cefálica e abdominal, fêmur.' },
    { start: 7.0, end: 10.6, text: 'Peso estimado pela fórmula de Hadlock.' },
  ],
  result: [
    { start: 0.0, end: 2.4, text: 'Cada cálculo entrega percentil,' },
    { start: 2.4, end: 5.2, text: 'classificação e orientação clínica.' },
  ],
  records: [
    { start: 0.0, end: 3.0, text: 'Pacientes com histórico longitudinal de exames.' },
    { start: 3.0, end: 6.0, text: 'Web e mobile, no mesmo prontuário.' },
  ],
  outro: [
    { start: 0.0, end: 1.6, text: 'IdaliaCalc.' },
    { start: 1.6, end: 3.8, text: 'Sua plataforma de medicina fetal.' },
  ],
};
