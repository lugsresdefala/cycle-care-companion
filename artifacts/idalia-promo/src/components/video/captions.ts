export type CaptionCue = {
  start: number;
  end: number;
  text: string;
};

export const SCENE_CAPTIONS: Record<string, CaptionCue[]> = {
  hook: [
    { start: 0.0, end: 3.5, text: 'Precisão clínica. Decisões seguras.' },
    { start: 3.5, end: 7.8, text: 'A ferramenta definitiva para obstetras e ginecologistas.' },
  ],
  dating: [
    { start: 0.0, end: 3.5, text: 'A roda gestacional, reinventada.' },
    { start: 3.5, end: 7.6, text: 'Cálculos precisos com base na DUM ou na primeira ultrassonografia.' },
  ],
  biometry: [
    { start: 0.0, end: 3.2, text: 'Métricas de alto padrão.' },
    { start: 3.2, end: 7.4, text: 'Análise completa de BPD, HC, AC, FL e peso fetal estimado.' },
  ],
  records: [
    { start: 0.0, end: 2.4, text: 'Seu prontuário, sempre organizado.' },
    { start: 2.4, end: 5.3, text: 'Consultas, exames e curvas de crescimento num só lugar.' },
  ],
  pricing: [
    { start: 0.0, end: 4.8, text: 'Escolha a melhor assinatura para a sua prática.' },
  ],
  outro: [
    { start: 0.0, end: 3.0, text: 'Idalia Calc — para obstetras e ginecologistas.' },
  ],
};
