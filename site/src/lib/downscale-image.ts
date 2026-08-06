/** Longest edge, in pixels, after downscaling. */
const MAX_EDGE = 1920;
const JPEG_QUALITY = 0.82;

/**
 * Shrinks a photo in the browser before it is uploaded.
 *
 * Not a nicety: a serverless request body caps out around 4.5 MB on the host,
 * and a single phone photo is 3–5 MB. Eight of them would never reach the
 * function. Re-encoding at 1920px/JPEG lands a typical shot near 300 kB, which
 * is more than enough for what these are — reference shots for the valuation
 * visit, where the team reshoots properly anyway.
 *
 * Returns the original file untouched if anything fails; a slightly-too-big
 * upload that the server rejects with a clear message beats losing the photo.
 */
export async function downscaleImage(file: File): Promise<File> {
  if (typeof createImageBitmap !== 'function') return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    // Already small enough and already compressed: re-encoding would only
    // throw away quality for nothing.
    if (scale === 1 && file.type === 'image/jpeg' && file.size <= 900_000) {
      return file;
    }

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY);
    });
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: file.lastModified });
  } finally {
    bitmap.close();
  }
}
