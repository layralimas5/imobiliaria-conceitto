import fs from 'node:fs';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

/**
 * First image dropped into a folder under `public/`, or null when it is empty.
 *
 * Read at build time, so adding a file is a deploy and not a code change. The
 * folders exist to let the client hand over art direction without touching the
 * app: whatever lands there wins over whatever the catalog would have picked.
 */
function firstImageIn(...segments: readonly string[]): string | null {
  const directory = path.join(process.cwd(), 'public', ...segments);
  try {
    const file = fs
      .readdirSync(directory)
      .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort()[0];
    return file ? `/${[...segments, file].join('/')}` : null;
  } catch {
    // Folder absent is the normal case before the client sends anything.
    return null;
  }
}

/**
 * Art-directed cover for the home hero. Falls back to the first featured
 * listing's photography, which is what shipped before and is never empty.
 */
export function heroImage(): string | null {
  return firstImageIn('imagens', 'banner');
}
