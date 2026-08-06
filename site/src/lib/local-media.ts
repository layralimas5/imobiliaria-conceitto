import fs from 'node:fs';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

/**
 * Encodes each path segment. Files arrive named by hand — "banner imagem.png"
 * is a real one — and a raw space is not a valid URL.
 */
function publicUrl(...segments: readonly string[]): string {
  return `/${segments.map(encodeURIComponent).join('/')}`;
}

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
    return file ? publicUrl(...segments, file) : null;
  } catch {
    // Folder absent is the normal case before the client sends anything.
    return null;
  }
}

/** Art-directed cover for the home hero, or null while the folder is empty. */
export function heroImage(): string | null {
  return firstImageIn('imagens', 'banner');
}

const LISTINGS_DIR = path.join(process.cwd(), 'public', 'imagens', 'imoveis');

export interface LocalPhoto {
  readonly url: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

/**
 * Photography now comes from this repository, not from the MSYS S3 bucket.
 *
 * Two layouts work, so a single shot is as easy as a full set:
 *   public/imagens/imoveis/33858.jpg          → one photo
 *   public/imagens/imoveis/33858/01.jpg …     → a gallery, in filename order
 *
 * The whole tree is read once and cached: the build renders 1498 listing pages
 * and a readdir per card would be thousands of syscalls for the same answer.
 */
let indexCache: Map<string, readonly LocalPhoto[]> | null = null;

export function listingPhotoIndex(): Map<string, readonly LocalPhoto[]> {
  if (indexCache) return indexCache;

  const index = new Map<string, LocalPhoto[]>();
  const add = (code: string, file: string) => {
    const list = index.get(code) ?? [];
    list.push({
      url: `/imagens/imoveis/${file.split('/').map(encodeURIComponent).join('/')}`,
      alt: '',
      width: 1024,
      height: 683,
    });
    index.set(code, list);
  };

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(LISTINGS_DIR, { withFileTypes: true });
  } catch {
    indexCache = new Map();
    return indexCache;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const code = entry.name;
      let files: string[];
      try {
        files = fs.readdirSync(path.join(LISTINGS_DIR, code));
      } catch {
        continue;
      }
      for (const file of files.sort()) {
        if (IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase())) {
          add(code, `${code}/${file}`);
        }
      }
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(extension)) continue;
    add(path.basename(entry.name, extension), entry.name);
  }

  indexCache = new Map(index);
  return indexCache;
}

/** Photos on file for a listing code. Empty is the normal state today. */
export function listingPhotos(code: string): readonly LocalPhoto[] {
  return listingPhotoIndex().get(code) ?? [];
}
