# Imobiliária Conceitto

> Projeto criado em 03/08/2026. Pasta dedicada, instruções aqui sobrescrevem as da
> raiz quando relevantes.

## Sobre

Reconstruir o site da Imobiliária Conceitto (Farroupilha e Bento Gonçalves, RS) com
um padrão visual bem acima do atual, mantendo o portal de busca de imóveis funcional.

## Tipo

Cliente novo.

## Entregas previstas

- Site novo (portal de imóveis + institucional)

## Onde salvar o que

- Briefing e contexto: `briefing.md` nessa pasta
- Código do site: `site/`
- Prints, textos e material do cliente: `referencias/`

## Contexto que herda da raiz

Tom de voz, marca e contexto do negócio vêm de `_memoria/` e `identidade/` da raiz.
Não duplicar aqui.

Regras globais de desenvolvimento valem integralmente: TypeScript strict, clean code,
mobile-first, acessibilidade AA, branch por feature, Conventional Commits.

## Específico desse projeto

- Os imóveis vivem no CRM **MSYS Imob** (Mold Systems). O site novo não é dono do
  dado. Qualquer decisão de arquitetura depende de como o dado sai de lá
  (API, feed XML ou raspagem). Ver `briefing.md`.
- SEO é ativo do cliente: o site atual já ranqueia com URLs no padrão
  `/comprar/<cidade>-<uf>` e `/imovel/<operacao>/<categoria>/<cidade>/<bairro>/<codigo>`.
  Não quebrar sem plano de redirect 301.
- Duas unidades com contatos diferentes (matriz Farroupilha, filial Bento). Telefone,
  endereço e Instagram são distintos por unidade, nunca misturar.
