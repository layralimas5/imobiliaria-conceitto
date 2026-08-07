'use client';

import { PROPERTY_TYPES } from '@/domain/property';
import { TYPE_LABELS } from '@/domain/search';
import { createListing } from '@/app/sistema/actions';
import { Field, RecordForm, Row, inputClass } from '@/components/system/record-form';

export function ListingForm() {
  return (
    <RecordForm
      trigger="Cadastrar imóvel"
      title="Novo imóvel"
      text="O que for preenchido aqui vai direto para o site, com as fotos anexadas."
      action={createListing}
      submitLabel="Cadastrar e publicar"
    >
      {(errors) => (
        <>
          <Field name="title" label="Título do anúncio" error={errors.title}>
            <input
              id="title"
              name="title"
              required
              placeholder="Apartamento 2 dormitórios no Centro"
              className={inputClass(errors.title)}
            />
          </Field>

          <Row>
            <Field name="operation" label="Operação" error={errors.operation}>
              <select
                id="operation"
                name="operation"
                defaultValue="venda"
                className={inputClass(errors.operation)}
              >
                <option value="venda">Venda</option>
                <option value="locacao">Locação</option>
              </select>
            </Field>

            <Field name="type" label="Tipo" error={errors.type}>
              <select
                id="type"
                name="type"
                defaultValue="apartamento"
                className={inputClass(errors.type)}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </Field>
          </Row>

          <Row>
            <Field name="city" label="Cidade" error={errors.city}>
              <input
                id="city"
                name="city"
                required
                defaultValue="Farroupilha"
                className={inputClass(errors.city)}
              />
            </Field>

            <Field name="neighborhood" label="Bairro" error={errors.neighborhood}>
              <input
                id="neighborhood"
                name="neighborhood"
                required
                placeholder="Centro"
                className={inputClass(errors.neighborhood)}
              />
            </Field>
          </Row>

          <Row>
            <Field
              name="price"
              label="Valor (R$)"
              error={errors.price}
              hint="Deixe vazio para “consulte-nos”."
            >
              <input
                id="price"
                name="price"
                inputMode="decimal"
                placeholder="450000"
                className={inputClass(errors.price)}
              />
            </Field>

            <Field name="area" label="Área (m²)" error={errors.area}>
              <input
                id="area"
                name="area"
                inputMode="decimal"
                placeholder="76"
                className={inputClass(errors.area)}
              />
            </Field>
          </Row>

          {/* The four numbers that become the icon row on the listing page. */}
          <fieldset>
            <legend className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-faint">
              Cômodos
            </legend>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { name: 'bedrooms', label: 'Dormitórios' },
                { name: 'suites', label: 'Suítes' },
                { name: 'bathrooms', label: 'Banheiros' },
                { name: 'parkingSpaces', label: 'Vagas' },
              ].map((room) => (
                <div key={room.name}>
                  <label
                    htmlFor={room.name}
                    className="mb-1.5 block text-xs text-ink-soft"
                  >
                    {room.label}
                  </label>
                  <input
                    id={room.name}
                    name={room.name}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    className={inputClass()}
                  />
                </div>
              ))}
            </div>
          </fieldset>

          <Field
            name="features"
            label="Características"
            hint="Separe por vírgula. Viram a lista de características do anúncio."
            error={errors.features}
          >
            <input
              id="features"
              name="features"
              placeholder="Churrasqueira, Sacada, Elevador"
              className={inputClass(errors.features)}
            />
          </Field>

          <Field name="description" label="Descrição" error={errors.description}>
            <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="O texto que aparece em “Sobre o imóvel”."
              className={`${inputClass(errors.description)} h-auto py-2.5`}
            />
          </Field>

          <Field
            name="photos"
            label="Fotos"
            hint="A primeira vira a capa. JPG, PNG, WebP ou AVIF, até 8 MB cada."
          >
            <input
              id="photos"
              name="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
          </Field>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="isExclusive"
              className="size-4 rounded border-line-strong text-brand-600 focus:ring-brand-500"
            />
            Imóvel exclusivo da Conceitto
          </label>
        </>
      )}
    </RecordForm>
  );
}
