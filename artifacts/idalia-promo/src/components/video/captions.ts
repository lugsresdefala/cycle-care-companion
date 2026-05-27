export type Caption = { start: number; end: number; text: string };

export const SCENE_CAPTIONS: Record<string, Caption[]> = {
  hook: [
    { start: 0.0, end: 1.8, text: 'Idália.' },
    { start: 1.8, end: 5.5, text: 'Plataforma clínica para medicina fetal e saúde reprodutiva.' },
  ],
  dating: [
    { start: 0.0, end: 3.2, text: 'Datação gestacional precisa,' },
    { start: 3.2, end: 5.6, text: 'a partir da última menstruação,' },
    { start: 5.6, end: 7.4, text: 'ultrassonografia de primeiro trimestre' },
    { start: 7.4, end: 9.4, text: 'ou fertilização in vitro.' },
  ],
  biometry: [
    { start: 0.0, end: 2.6, text: 'Biometria fetal completa:' },
    { start: 2.6, end: 5.0, text: 'diâmetro biparietal,' },
    { start: 5.0, end: 7.6, text: 'circunferências cefálica e abdominal, fêmur.' },
    { start: 7.6, end: 11.8, text: 'Peso fetal estimado pela fórmula de Hadlock.' },
  ],
  growth: [
    { start: 0.0, end: 2.2, text: 'Curvas de crescimento intrauterino.' },
    { start: 2.2, end: 4.6, text: 'Percentil em tempo real,' },
    { start: 4.6, end: 7.0, text: 'conforme INTERGROWTH-21st.' },
  ],
  records: [
    { start: 0.0, end: 3.2, text: 'Pacientes com histórico longitudinal de exames.' },
    { start: 3.2, end: 6.4, text: 'Web e mobile, no mesmo prontuário.' },
  ],
  outro: [
    { start: 0.0, end: 1.6, text: 'Idália Calc.' },
    { start: 1.6, end: 3.8, text: 'Saúde reprodutiva e medicina fetal.' },
  ],
};
