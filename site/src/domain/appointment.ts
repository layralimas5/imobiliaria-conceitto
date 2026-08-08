/**
 * Compromissos da agenda.
 *
 * Vive fora de `demo-system` porque a agenda deixou de ser só demonstração: um
 * compromisso marcado na ficha do lead é um registro de verdade, gravado, e a
 * agenda passa a mostrar os dois lado a lado.
 */

export const APPOINTMENT_KINDS = ['visita', 'reunião', 'assinatura', 'avaliação'] as const;
export type AppointmentKind = (typeof APPOINTMENT_KINDS)[number];

export const APPOINTMENT_STATUSES = ['confirmado', 'a confirmar', 'concluído'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export function isAppointmentKind(value: unknown): value is AppointmentKind {
  return APPOINTMENT_KINDS.includes(value as AppointmentKind);
}

export function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return APPOINTMENT_STATUSES.includes(value as AppointmentStatus);
}

/**
 * `2026-08-12` → `12/08/2026`.
 *
 * O `<input type="date">` devolve ISO e o painel inteiro exibe pt-BR. A
 * conversão é feita por string de propósito: `new Date('2026-08-12')` é lido
 * como UTC e, em fuso negativo, volta um dia.
 */
export function isoToLabel(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return iso.trim();
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** `12/08/2026` → `2026-08-12`, para devolver a data a um `<input type="date">`. */
export function labelToIso(label: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(label.trim());
  if (!match) return '';
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

/** Hoje em ISO, no fuso de quem está usando o painel — não em UTC. */
export function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * "Hoje", "Amanhã" ou "Qua, 12/08": como a agenda agrupa os dias.
 *
 * O nome do dia só aparece a partir de depois de amanhã porque, para hoje e
 * amanhã, a palavra diz mais que a data.
 */
export function dayLabel(iso: string): string {
  const today = todayIso();
  if (iso === today) return 'Hoje';

  const days = Math.round(
    (Date.parse(`${iso}T00:00:00`) - Date.parse(`${today}T00:00:00`)) / 86_400_000,
  );
  if (days === 1) return 'Amanhã';
  if (days === -1) return 'Ontem';

  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
    .format(new Date(`${iso}T12:00:00`))
    .replace('.', '');
  const label = isoToLabel(iso).slice(0, 5);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${label}`;
}
