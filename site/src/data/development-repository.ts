import type { Development } from '@/domain/development';

/**
 * The seam between the site and whatever ends up holding launch content.
 * Backed today by a curated module; a CMS later means implementing this and
 * nothing else.
 */
export interface DevelopmentRepository {
  all(): Promise<readonly Development[]>;
  findBySlug(slug: string): Promise<Development | null>;
  /** Highlights for the home page, already ordered by sales stage. */
  featured(limit: number): Promise<readonly Development[]>;
}
