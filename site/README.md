# Site da Imobiliária Conceitto

Portal de imóveis em Next.js 16 (App Router) + TypeScript + Tailwind v4.

## Rodar

```bash
npm install
cp .env.example .env.local   # opcional: só a entrega de lead depende disso
npm run dev                  # http://localhost:3000
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run sync` | Sincroniza o catálogo (padrão: 120 imóveis) |
| `npm run sync -- --all` | Sincroniza o catálogo inteiro |
| `npm run geocode` | Resolve as coordenadas dos bairros e plota o catálogo |

**Sempre rode `npm run geocode` depois de um `sync`.** O sync zera lat/lng; o
geocode devolve, e as coordenadas já resolvidas vêm do cache (`geocode.json`),
então a segunda execução é instantânea.

## De onde vêm os imóveis

A fonte de verdade é o **MSYS Imob**, o CRM que a Conceitto usa. A equipe
continua cadastrando lá; o site só lê.

`scripts/sync-catalog.mjs` gera `src/data/catalog/catalog.json` a partir dos
registros que o MSYS já publica. Quando o cliente liberar o feed XML oficial de
portais, só a função `fetchRawRecord` do script muda — o mapeamento e o resto do
site continuam iguais, porque as duas superfícies expõem os mesmos campos.

Nada no app importa o JSON direto. Tudo passa por `PropertyRepository`
(`src/data/property-repository.ts`), que é a única fronteira com a origem dos
dados. Trocar para uma API ao vivo é implementar essa interface.

## Mapa

O MSYS não expõe coordenada, e o site nunca publica o endereço exato de um
imóvel. Então `scripts/geocode-catalog.mjs` geocodifica no nível do **bairro**:
uma consulta por par cidade + bairro (149 no catálogo inteiro, contra 1498
imóveis), com cache versionado em `src/data/catalog/geocode.json`.

Os imóveis de um mesmo bairro recebem um deslocamento determinístico de até
~400 m, derivado do código do imóvel, para os pins não empilharem. Determinístico
porque o mesmo imóvel precisa cair no mesmo ponto a cada build.

A UI declara a precisão que tem: bairro na maioria (1437 imóveis) e cidade quando
o bairro não resolveu (61). Nunca afirma mais do que sabe.

Os tiles vêm do OpenStreetMap, sem chave e sem cobrança. Quando o volume
justificar um provedor pago (MapTiler, Carto), basta definir
`NEXT_PUBLIC_MAP_TILE_URL` e `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION` — nenhum
componente muda.

## Leads

O formulário faz POST em `/api/leads`, que valida com zod e entrega através de
`src/lib/lead-delivery.ts`. Dois canais, ligados por variável de ambiente e
independentes entre si:

- **E-mail (Resend):** `RESEND_API_KEY` + `LEAD_INBOX`. O lead vai para a caixa
  da unidade que atende a cidade do imóvel, com `reply_to` no e-mail do
  interessado e botão de WhatsApp já montado.
- **Webhook:** `LEAD_WEBHOOK_URL`. Recebe um POST JSON com lead, unidade, imóvel
  e empreendimento — é por aqui que o MSYS entra quando liberarem o endpoint.

Sem nenhum canal configurado o lead é validado e gravado no log com um aviso, e a
resposta é 200: o site precisa rodar antes das credenciais chegarem. Com um canal
configurado e todos falhando, a resposta é **502** e o formulário manda o
visitante para o WhatsApp. Um lead nunca recebe confirmação que não mereceu.

Ver `.env.example` para a lista completa.

## Estrutura

```
src/
  domain/       regras e tipos (Property, SearchQuery, Lead) — sem framework
  data/         repositório e catálogo sincronizado
  lib/          formatação, slugs de lugar, config do site, env, entrega de lead
  hooks/        comportamento de UI reutilizável (foco em modal)
  components/   layout, property, search, map, development
  app/          rotas
```

## URLs

O padrão de URL espelha o que o site atual já tem indexado, para a migração ser
redirect 1:1:

- `/comprar`, `/alugar` — busca com filtros no querystring
- `/comprar/farroupilha-rs`, `/alugar/centro-bento-goncalves-rs` — páginas de lugar
- `/imovel/<operação>/<tipo>/<cidade>/<bairro>/<código>` — ficha

Qualquer variação da URL da ficha (categoria no plural, slug antigo de bairro)
responde 308 para a forma canônica, desde que o código no fim esteja certo.

## Deploy

Vercel. O repositório tem o app dentro de `site/`, então na criação do projeto:

- **Root Directory:** `site`
- **Framework:** Next.js (detectado sozinho)
- **Variáveis de ambiente:** as de `.env.example` que já tiverem valor

O build é estático para as fichas e as páginas de lugar, então cada atualização
do catálogo exige um novo deploy. Quando o feed XML do MSYS chegar, o caminho é
trocar a geração estática por ISR com revalidação — a interface do repositório
não muda.

## Pendências com o cliente

- **Feed XML do MSYS:** trocar a origem em `scripts/sync-catalog.mjs`
- **Credencial de e-mail ou webhook** para ligar a entrega de lead
- **Roteamento de unidade:** a divisão de municípios entre matriz e filial em
  `src/lib/site-config.ts` foi inferida por geografia e precisa de confirmação —
  hoje 22 cidades aparecem no catálogo, incluindo litoral (Torres, Capão da
  Canoa, Arroio do Sal) e Porto Alegre
- **Logo em vetor e paleta final**
