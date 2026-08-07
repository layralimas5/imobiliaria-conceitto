import { displayArea, priceFor, type Property } from '@/domain/property';
import type { PropertyType } from '@/domain/property';

/**
 * What a client is looking for, and how well an imóvel answers it.
 *
 * The score is not a similarity metric — it is an argument the corretor can
 * repeat on the phone. That is why every criterion returns a sentence: "dentro
 * do orçamento", "um dormitório a menos". A single 87% would be shorter and
 * useless, because nobody can act on it.
 */
export interface SearchBrief {
  readonly operation: 'venda' | 'locacao';
  readonly type: PropertyType | 'qualquer';
  readonly city: string;
  readonly maxPrice: number | null;
  readonly minBedrooms: number | null;
  readonly minParking: number | null;
  readonly minArea: number | null;
}

export interface MatchReason {
  readonly label: string;
  readonly met: boolean;
}

export interface Match<T extends Property = Property> {
  readonly property: T;
  readonly score: number;
  readonly reasons: readonly MatchReason[];
}

/** A near miss is worth showing; a wrong city or wrong operation is not. */
const HARD_FLOOR = 40;

export function matchProperties<T extends Property>(
  properties: readonly T[],
  brief: SearchBrief,
  limit = 12,
): readonly Match<T>[] {
  return properties
    .filter((property) => property.operations.includes(brief.operation))
    .map((property) => score(property, brief))
    .filter((match) => match.score >= HARD_FLOOR)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function score<T extends Property>(property: T, brief: SearchBrief): Match<T> {
  const reasons: MatchReason[] = [];
  let points = 0;
  let possible = 0;

  const add = (weight: number, met: boolean, label: string) => {
    possible += weight;
    if (met) points += weight;
    reasons.push({ label, met });
  };

  if (brief.city !== 'qualquer') {
    const sameCity = property.address.city.toLowerCase() === brief.city.toLowerCase();
    add(30, sameCity, sameCity ? `Em ${property.address.city}` : `Fica em ${property.address.city}`);
  }

  if (brief.type !== 'qualquer') {
    add(20, property.type === brief.type, property.type === brief.type ? 'Tipo procurado' : 'Outro tipo');
  }

  if (brief.maxPrice !== null) {
    const price = priceFor(property.pricing, brief.operation);
    if (price === null) {
      add(25, false, 'Valor sob consulta');
    } else if (price <= brief.maxPrice) {
      add(25, true, 'Dentro do orçamento');
    } else {
      // Up to 10% over is still worth a phone call, and the corretor should be
      // told it is over rather than never seeing the imóvel.
      const over = Math.round(((price - brief.maxPrice) / brief.maxPrice) * 100);
      possible += 25;
      if (over <= 10) points += 12;
      reasons.push({ label: `${over}% acima do orçamento`, met: false });
    }
  }

  if (brief.minBedrooms !== null) {
    const bedrooms = property.rooms.bedrooms ?? 0;
    const met = bedrooms >= brief.minBedrooms;
    add(
      15,
      met,
      met
        ? `${bedrooms} dormitório${bedrooms > 1 ? 's' : ''}`
        : `${brief.minBedrooms - bedrooms} dormitório a menos`,
    );
  }

  if (brief.minParking !== null) {
    const parking = property.rooms.parkingSpaces ?? 0;
    const met = parking >= brief.minParking;
    add(10, met, met ? `${parking} vaga${parking > 1 ? 's' : ''}` : 'Vagas abaixo do pedido');
  }

  if (brief.minArea !== null) {
    const area = displayArea(property.areas) ?? 0;
    const met = area >= brief.minArea;
    add(10, met, met ? `${area} m²` : `${brief.minArea - area} m² a menos`);
  }

  // Nothing asked for: every listing of the right operation is equally valid.
  const percent = possible === 0 ? 100 : Math.round((points / possible) * 100);
  return { property, score: percent, reasons };
}
