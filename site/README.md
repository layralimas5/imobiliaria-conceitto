# Site da Imobiliária Conceitto

Portal de imóveis em Next.js 16 (App Router) + TypeScript + Tailwind v4.

## Rodar

```bash
npm install
npm run dev          # http://localhost:3000
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

## Estrutura

```
src/
  domain/       regras e tipos (Property, SearchQuery, Lead) — sem framework
  data/         repositório e catálogo sincronizado
  lib/          formatação, slugs de lugar, config do site e das unidades
  components/   layout, property, search
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

## Pendências de integração

- **Leads:** `/api/leads` valida e registra no log do servidor. Falta o
  transporte (e-mail ou webhook do MSYS).
- **Mapa:** o MSYS não expõe lat/lng. Precisa geocodificar por endereço.
- **Roteamento de unidade:** a divisão de municípios entre matriz e filial em
  `src/lib/site-config.ts` foi inferida por geografia e precisa de confirmação.
