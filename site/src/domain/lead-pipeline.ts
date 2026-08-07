/**
 * The funnel.
 *
 * Eight stages, and the two that matter most are the last two: a lead that ends
 * is either fechado or perdido, never just "parou de aparecer". Without a
 * terminal state the funnel silently fills with contacts nobody will ever call
 * again, and every conversion number computed from it is wrong.
 */
export const LEAD_STAGES = [
  'novo',
  'contato',
  'qualificado',
  'visita',
  'proposta',
  'negociacao',
  'fechado',
  'perdido',
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  novo: 'Novo lead',
  contato: 'Contato realizado',
  qualificado: 'Qualificado',
  visita: 'Visita agendada',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  fechado: 'Fechado',
  perdido: 'Perdido',
};

export const LEAD_STAGE_TONES: Record<LeadStage, 'neutral' | 'brand' | 'good' | 'warn'> = {
  novo: 'brand',
  contato: 'neutral',
  qualificado: 'neutral',
  visita: 'warn',
  proposta: 'warn',
  negociacao: 'warn',
  fechado: 'good',
  perdido: 'neutral',
};

/** Still worth someone's time today. */
export function isOpen(stage: LeadStage): boolean {
  return stage !== 'fechado' && stage !== 'perdido';
}

export function isLeadStage(value: unknown): value is LeadStage {
  return LEAD_STAGES.includes(value as LeadStage);
}

/** Where a stage sits in the funnel, for the conversion drop-off chart. */
export function stageIndex(stage: LeadStage): number {
  return LEAD_STAGES.indexOf(stage);
}
