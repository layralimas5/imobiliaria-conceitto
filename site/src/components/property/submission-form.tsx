'use client';

import { cloneElement, useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, ImagePlus, Loader2, X } from 'lucide-react';
import { OPERATIONS, PROPERTY_TYPES } from '@/domain/property';
import { TYPE_LABELS } from '@/domain/search';
import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTOS,
  MAX_TOTAL_PHOTO_BYTES,
  OPERATION_INTENT_LABELS,
  isAcceptedPhoto,
} from '@/domain/listing-submission';
import { downscaleImage } from '@/lib/downscale-image';

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface Selected {
  readonly file: File;
  readonly previewUrl: string;
}

export function SubmissionForm({ className = '' }: { readonly className?: string }) {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<readonly Selected[]>([]);
  const [preparing, setPreparing] = useState(false);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'success') confirmationRef.current?.focus();
  }, [status]);

  // Object URLs are leaked memory until revoked, and the previews outlive
  // individual renders, so they are cleaned up when the component goes away.
  useEffect(() => {
    return () => {
      for (const photo of photos) URL.revokeObjectURL(photo.previewUrl);
    };
  }, [photos]);

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    setFormError(null);
    setPreparing(true);

    const accepted: Selected[] = [];
    let total = photos.reduce((sum, photo) => sum + photo.file.size, 0);

    try {
      for (const original of files) {
        if (photos.length + accepted.length >= MAX_PHOTOS) {
          setFormError(`Máximo de ${MAX_PHOTOS} fotos.`);
          break;
        }
        if (!isAcceptedPhoto(original)) {
          setFormError('Aceitamos JPG, PNG ou WebP de até 12 MB cada.');
          continue;
        }

        // Shrunk here, in the browser, or the upload never reaches the server.
        const file = await downscaleImage(original);

        if (total + file.size > MAX_TOTAL_PHOTO_BYTES) {
          setFormError(
            'As fotos somam mais que o limite do envio. Remova alguma e tente de novo.',
          );
          break;
        }
        total += file.size;
        accepted.push({ file, previewUrl: URL.createObjectURL(file) });
      }
    } finally {
      setPreparing(false);
      // Clearing lets the same file be picked again after a removal.
      if (fileInputRef.current) fileInputRef.current.value = '';
    }

    if (accepted.length > 0) setPhotos((current) => [...current, ...accepted]);
  }

  function removePhoto(index: number) {
    setPhotos((current) => {
      const photo = current[index];
      if (photo) URL.revokeObjectURL(photo.previewUrl);
      return current.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setErrors({});
    setStatus('submitting');

    const formElement = event.currentTarget;
    const payload = new FormData(formElement);
    // The picker's own input is not submitted: its selection is replaced by the
    // curated list, which survives removals and per-file rejections.
    payload.delete('photo-picker');
    for (const photo of photos) payload.append('photos', photo.file, photo.file.name);

    try {
      const response = await fetch('/api/anuncie', { method: 'POST', body: payload });

      if (response.status === 422 || response.status === 413) {
        const body = await response.json().catch(() => null);
        const fieldErrors: Record<string, string> = {};
        for (const issue of body?.issues ?? []) {
          if (!fieldErrors[issue.field]) fieldErrors[issue.field] = issue.message;
        }
        setErrors(fieldErrors);
        setFormError(body?.error ?? 'Confira os campos destacados.');
        setStatus('error');
        const firstField = Object.keys(fieldErrors)[0];
        if (firstField) {
          formElement.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
        }
        return;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus('success');
    } catch {
      setStatus('error');
      setFormError(
        'Não conseguimos enviar agora. Tente pelo WhatsApp ou ligue para a loja.',
      );
    }
  }

  if (status === 'success') {
    return (
      <div
        ref={confirmationRef}
        role="status"
        tabIndex={-1}
        className={`rounded-card border border-brand-100 bg-brand-50 p-7 text-center ${className}`}
      >
        <Check className="mx-auto size-7 text-brand-700" aria-hidden />
        <p className="mt-4 text-display text-2xl">Imóvel recebido</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
          A equipe confere os dados, cadastra no sistema e entra em contato para agendar a
          avaliação. Costuma levar um dia útil.
        </p>
      </div>
    );
  }

  const totalMb = (
    photos.reduce((sum, photo) => sum + photo.file.size, 0) /
    1024 /
    1024
  ).toFixed(1);

  return (
    <form onSubmit={handleSubmit} noValidate className={`space-y-7 ${className}`}>
      <fieldset className="space-y-3.5">
        <legend className="text-eyebrow">Seus dados</legend>
        <Field id="s-name" label="Nome" error={errors.ownerName}>
          <input id="s-name" name="ownerName" autoComplete="name" required className={input(errors.ownerName)} />
        </Field>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field id="s-email" label="E-mail" error={errors.ownerEmail}>
            <input id="s-email" name="ownerEmail" type="email" autoComplete="email" required className={input(errors.ownerEmail)} />
          </Field>
          <Field id="s-phone" label="WhatsApp" error={errors.ownerPhone}>
            <input id="s-phone" name="ownerPhone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(54) 99999-9999" required className={input(errors.ownerPhone)} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-3.5">
        <legend className="text-eyebrow">O imóvel</legend>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field id="s-operation" label="O que você quer" error={errors.operation}>
            <select id="s-operation" name="operation" defaultValue="venda" className={input(errors.operation)}>
              {OPERATIONS.map((operation) => (
                <option key={operation} value={operation}>
                  {OPERATION_INTENT_LABELS[operation]}
                </option>
              ))}
            </select>
          </Field>
          <Field id="s-type" label="Tipo" error={errors.type}>
            <select id="s-type" name="type" defaultValue="casa" className={input(errors.type)}>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </Field>
          <Field id="s-city" label="Cidade" error={errors.city}>
            <input id="s-city" name="city" autoComplete="address-level2" required className={input(errors.city)} />
          </Field>
          <Field id="s-neighborhood" label="Bairro" error={errors.neighborhood}>
            <input id="s-neighborhood" name="neighborhood" autoComplete="address-level3" required className={input(errors.neighborhood)} />
          </Field>
        </div>
        <Field id="s-street" label="Rua e número (opcional)" error={errors.street}>
          <input id="s-street" name="street" autoComplete="street-address" className={input(errors.street)} />
        </Field>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          <Field id="s-area" label="Área (m²)" error={errors.area}>
            <input id="s-area" name="area" inputMode="numeric" className={input(errors.area)} />
          </Field>
          <Field id="s-bedrooms" label="Dormitórios" error={errors.bedrooms}>
            <input id="s-bedrooms" name="bedrooms" inputMode="numeric" className={input(errors.bedrooms)} />
          </Field>
          <Field id="s-bathrooms" label="Banheiros" error={errors.bathrooms}>
            <input id="s-bathrooms" name="bathrooms" inputMode="numeric" className={input(errors.bathrooms)} />
          </Field>
          <Field id="s-parking" label="Vagas" error={errors.parkingSpaces}>
            <input id="s-parking" name="parkingSpaces" inputMode="numeric" className={input(errors.parkingSpaces)} />
          </Field>
        </div>

        <Field
          id="s-price"
          label="Valor pretendido em R$ (opcional)"
          error={errors.priceExpectation}
          hint="Deixe em branco se prefere que a avaliação diga."
        >
          <input id="s-price" name="priceExpectation" inputMode="numeric" className={input(errors.priceExpectation)} />
        </Field>

        <Field id="s-description" label="Algo mais que a gente deva saber (opcional)" error={errors.description}>
          <textarea id="s-description" name="description" rows={4} className={`${input(errors.description)} h-auto py-2.5`} />
        </Field>
      </fieldset>

      <fieldset>
        <legend className="text-eyebrow">Fotos</legend>
        <p className="mt-2 text-xs leading-relaxed text-ink-faint">
          Até {MAX_PHOTOS} fotos, JPG, PNG ou WebP. Elas são reduzidas aqui no
          navegador antes de subir, então foto de celular vai numa boa. Não precisa
          ser fotografia profissional — a nossa equipe refotografa antes de publicar.
        </p>

        <div className="mt-3.5">
          <label
            htmlFor="s-photos"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong bg-surface-muted px-4 py-5 text-sm text-ink-soft transition-colors hover:border-brand-500 hover:text-ink"
          >
            {preparing ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Preparando fotos…
              </>
            ) : (
              <>
                <ImagePlus className="size-5" aria-hidden />
                {photos.length === 0 ? 'Escolher fotos' : 'Adicionar mais fotos'}
              </>
            )}
          </label>
          <input
            ref={fileInputRef}
            id="s-photos"
            name="photo-picker"
            type="file"
            multiple
            accept={ACCEPTED_PHOTO_TYPES.join(',')}
            onChange={(event) => addPhotos(event.target.files)}
            className="sr-only"
          />
        </div>

        {photos.length > 0 ? (
          <>
            <ul className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {photos.map((photo, index) => (
                <li key={photo.previewUrl} className="relative">
                  {/* Local object URL: next/image would only add a proxy hop. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt={`Foto ${index + 1}: ${photo.file.name}`}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    aria-label={`Remover foto ${index + 1}`}
                    className="absolute right-1.5 top-1.5 inline-flex size-7 items-center justify-center rounded-full bg-ink/70 text-white backdrop-blur-sm transition-colors hover:bg-ink"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <p aria-live="polite" className="mt-2 text-xs text-ink-faint">
              {photos.length} de {MAX_PHOTOS} · {totalMb} MB
            </p>
          </>
        ) : null}
      </fieldset>

      {/* Honeypot */}
      <div aria-hidden className="absolute left-[-9999px]">
        <label htmlFor="s-website">Não preencha</label>
        <input id="s-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {formError ? (
        <p role="alert" className="text-sm text-red-700">
          {formError}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={status === 'submitting' || preparing}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-700 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Enviando…
            </>
          ) : (
            'Cadastrar meu imóvel'
          )}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          Os dados vão direto para a equipe da unidade que atende a sua cidade, que
          cadastra o imóvel no sistema e entra em contato para agendar a avaliação.
        </p>
      </div>
    </form>
  );
}

function input(error: string | undefined): string {
  return `h-11 w-full rounded-lg border bg-surface px-3 text-sm transition-colors ${
    error ? 'border-red-500' : 'border-line focus:border-brand-500'
  }`;
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error: string | undefined;
  hint?: string;
  children: React.ReactElement<{ 'aria-invalid'?: boolean; 'aria-describedby'?: string }>;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink-soft">
        {label}
      </label>
      {/* Wiring lives here so every call site above stays a single line. */}
      {cloneElement(children, {
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy || undefined,
      })}
      {hint ? (
        <p id={hintId} className="mt-1 text-xs text-ink-faint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
