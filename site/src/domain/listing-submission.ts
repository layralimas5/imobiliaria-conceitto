import { z } from 'zod';
import { OPERATIONS, PROPERTY_TYPES } from './property';

export const MAX_PHOTOS = 8;

/**
 * Ceiling for a single file as it arrives from the visitor's disk. The browser
 * downscales before upload (see `downscaleImage`), so this only guards against
 * something absurd being picked.
 */
export const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

/**
 * Ceiling for the upload itself, after downscaling. A serverless request body
 * caps out around 4.5 MB on the host and is rejected by the platform before the
 * route ever runs, so this sits under it with room for the form fields.
 */
export const MAX_TOTAL_PHOTO_BYTES = 4 * 1024 * 1024;
export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const phonePattern = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;

const optionalPositive = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === undefined || value === '' ? null : value))
  .refine(
    (value) => value === null || (Number.isFinite(Number(value)) && Number(value) >= 0),
    'Informe apenas números',
  )
  .transform((value) => (value === null ? null : Number(value)));

/**
 * What an owner fills in to put a property forward.
 *
 * Deliberately shorter than the MSYS record: this is the start of a
 * conversation, not a CRM import. The team confirms everything on the
 * valuation visit, so demanding precision here would only cost submissions.
 */
export const listingSubmissionSchema = z.object({
  ownerName: z.string().trim().min(2, 'Informe seu nome').max(120),
  ownerEmail: z.string().trim().email('E-mail inválido').max(160),
  ownerPhone: z
    .string()
    .trim()
    .min(10, 'Informe um telefone com DDD')
    .max(20)
    .refine((value) => phonePattern.test(value.replace(/\s/g, '')), 'Telefone inválido'),

  operation: z.enum(OPERATIONS),
  type: z.enum(PROPERTY_TYPES),
  city: z.string().trim().min(2, 'Informe a cidade').max(80),
  neighborhood: z.string().trim().min(2, 'Informe o bairro').max(80),
  street: z.string().trim().max(160).optional(),

  area: optionalPositive,
  bedrooms: optionalPositive,
  bathrooms: optionalPositive,
  parkingSpaces: optionalPositive,
  /** What the owner hopes to get. Null means they want the valuation to say. */
  priceExpectation: optionalPositive,

  description: z.string().trim().max(2000).optional(),

  /** Honeypot, same contract as the lead form: accepted, then dropped. */
  website: z.string().max(200).optional(),
});

export type ListingSubmission = z.infer<typeof listingSubmissionSchema>;

export const OPERATION_INTENT_LABELS = {
  venda: 'Quero vender',
  locacao: 'Quero alugar',
} as const;

export function isAcceptedPhoto(file: { type: string; size: number }): boolean {
  return (
    (ACCEPTED_PHOTO_TYPES as readonly string[]).includes(file.type) &&
    file.size > 0 &&
    file.size <= MAX_PHOTO_BYTES
  );
}
