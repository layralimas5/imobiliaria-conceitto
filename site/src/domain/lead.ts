import { z } from 'zod';

export const LEAD_INTENTS = ['visita', 'informacoes', 'proposta', 'anunciar'] as const;
export type LeadIntent = (typeof LEAD_INTENTS)[number];

export const LEAD_INTENT_LABELS: Record<LeadIntent, string> = {
  visita: 'Agendar visita',
  informacoes: 'Mais informações',
  proposta: 'Fazer uma proposta',
  anunciar: 'Anunciar meu imóvel',
};

const phonePattern = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;

export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome').max(120),
  email: z.string().trim().email('E-mail inválido').max(160),
  phone: z
    .string()
    .trim()
    .min(10, 'Informe um telefone com DDD')
    .max(20)
    .refine((value) => phonePattern.test(value.replace(/\s/g, '')), 'Telefone inválido'),
  intent: z.enum(LEAD_INTENTS).default('visita'),
  message: z.string().trim().max(1000).optional(),
  propertyCode: z.string().trim().max(20).optional(),
  /** Slug of the development the visitor was looking at, when it came from a launch page. */
  developmentSlug: z.string().trim().max(80).optional(),
  /**
   * Honeypot: real users never fill this. It stays valid on purpose — the
   * request is accepted and dropped later, so bots get no signal that they
   * were filtered.
   */
  website: z.string().max(200).optional(),
});

export type Lead = z.infer<typeof leadSchema>;
