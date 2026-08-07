'use client';

import { LISTING_STATUSES, LISTING_STATUS_LABELS } from '@/domain/listing-status';
import { PROPERTY_TYPES } from '@/domain/property';
import { TYPE_LABELS } from '@/domain/search';
import { createListing } from '@/app/sistema/actions';
import { Field, RecordForm, Row, inputClass } from '@/components/system/record-form';

const ROOMS = [
  { name: 'bedrooms', label: 'Dormitórios' },
  { name: 'suites', label: 'Suítes' },
  { name: 'bathrooms', label: 'Banheiros' },
  { name: 'parkingSpaces', label: 'Vagas' },
] as const;

export function ListingForm({
  agents,
  owners,
}: {
  agents: readonly string[];
  owners: readonly string[];
}) {
  return (
    <RecordForm
      trigger="Cadastrar imóvel"
      title="Novo imóvel"
      text="Cadastro completo. Enquanto o status for disponível, reservado ou em negociação, o imóvel fica publicado no site."
      action={createListing}
      submitLabel="Cadastrar imóvel"
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
            <Field name="operation" label="Finalidade" error={errors.operation}>
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

          <Field
            name="status"
            label="Status"
            error={errors.status}
            hint="Vendido, alugado e inativo saem do site automaticamente."
          >
            <select
              id="status"
              name="status"
              defaultValue="disponivel"
              className={inputClass(errors.status)}
            >
              {LISTING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {LISTING_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </Field>

          <fieldset>
            <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-faint">
              Endereço
            </legend>
            <div className="space-y-4">
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

              <Field
                name="street"
                label="Rua e número"
                error={errors.street}
                hint="Só a equipe vê. O site publica bairro e cidade."
              >
                <input
                  id="street"
                  name="street"
                  placeholder="Rua Júlio de Castilhos, 480"
                  className={inputClass(errors.street)}
                />
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-faint">
              Valores
            </legend>
            <div className="space-y-4">
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

              <Row>
                <Field name="condoFee" label="Condomínio (R$/mês)" error={errors.condoFee}>
                  <input
                    id="condoFee"
                    name="condoFee"
                    inputMode="decimal"
                    placeholder="480"
                    className={inputClass(errors.condoFee)}
                  />
                </Field>

                <Field name="propertyTax" label="IPTU (R$/ano)" error={errors.propertyTax}>
                  <input
                    id="propertyTax"
                    name="propertyTax"
                    inputMode="decimal"
                    placeholder="1900"
                    className={inputClass(errors.propertyTax)}
                  />
                </Field>
              </Row>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-faint">
              Metragem e cômodos
            </legend>
            <div className="space-y-4">
              <Row>
                <Field name="area" label="Área construída (m²)" error={errors.area}>
                  <input
                    id="area"
                    name="area"
                    inputMode="decimal"
                    placeholder="76"
                    className={inputClass(errors.area)}
                  />
                </Field>

                <Field name="landArea" label="Área do terreno (m²)" error={errors.landArea}>
                  <input
                    id="landArea"
                    name="landArea"
                    inputMode="decimal"
                    placeholder="360"
                    className={inputClass(errors.landArea)}
                  />
                </Field>
              </Row>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {ROOMS.map((room) => (
                  <div key={room.name}>
                    <label htmlFor={room.name} className="mb-1.5 block text-xs text-ink-soft">
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
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-sm file:font-bold"
            />
          </Field>

          <Field
            name="videoUrl"
            label="Vídeo"
            error={errors.videoUrl}
            hint="Link do YouTube ou Vimeo."
          >
            <input
              id="videoUrl"
              name="videoUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              className={inputClass(errors.videoUrl)}
            />
          </Field>

          <Row>
            <Field name="owner" label="Proprietário" error={errors.owner}>
              <select id="owner" name="owner" defaultValue="" className={inputClass(errors.owner)}>
                <option value="">Não informado</option>
                {owners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            </Field>

            <Field name="agent" label="Corretor responsável" error={errors.agent}>
              <select id="agent" name="agent" defaultValue="" className={inputClass(errors.agent)}>
                <option value="">Não atribuído</option>
                {agents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </Field>
          </Row>

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
