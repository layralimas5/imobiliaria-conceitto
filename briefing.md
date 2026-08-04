# Briefing — Imobiliária Conceitto

Levantado em 03/08/2026 a partir dos dois links enviados pela Lay.

---

## Cliente

**Imobiliária Conceitto** — Farroupilha e Bento Gonçalves, RS (Serra Gaúcha).
Atua desde 2013 em Farroupilha. Filial de Bento Gonçalves aberta depois.
Razão social: Cristiano Marcolin Nery Imóveis.

- CNPJ matriz: 18.473.014/0001-98 (Farroupilha)
- CNPJ filial: 18.473.014/0003-50 (Bento Gonçalves)
- CRECI: 23909-J

### Unidades

| | Matriz | Filial |
|---|---|---|
| Cidade | Farroupilha | Bento Gonçalves |
| Endereço | Rua Coronel Pena de Moraes, 202, Centro | Marechal Floriano, 200, Centro |
| Telefone | (54) 3268-6621 | (54) 3454-7528 |
| Instagram | @imobiliaria.conceitto | @imobiliariaconceittobento |
| Facebook | /Imobiliariaconceitto | /Imobiliariaconceittobento |

E-mails vistos: cristiano@ e samuel@imobiliariaconceitto.com.br

### Serviços

Compra e venda, locação, administração de imóveis, agendamento de visita online.
Discurso institucional atual: quase 3 décadas de experiência, fotógrafo próprio,
marketing profissional, administração segura.

---

## Site atual — https://imobiliariaconceitto.com.br

**Plataforma:** MSYS Imob, da Mold Systems (crédito no rodapé). As fotos ficam em
`msys-imob-imobiliariaconceitto.s3.amazonaws.com` e a área do cliente aponta para
`msysimob.com.br/msys-imob-web/areacliente`.

**Volume:** 1490 imóveis anunciados entre venda e locação.

**Categorias:** casa padrão, sobrado, alto padrão, apartamento, terreno, loja, galpão.

**Bairros com listagem própria:**
- Bento Gonçalves: Santo Antão, Ouro Verde, Botafogo, São Roque, Verona
- Farroupilha: Belvedere, Parque, Centro, Pio X, São Francisco, Alvorada, Bela Vista

**Padrão de URL (importante para SEO, não quebrar):**
- Listagem: `/comprar/bento-goncalves-rs`, `/alugar/centro-bento-goncalves-rs`
- Ficha: `/imovel/venda/casas/bento-goncalves/santo-antao/33845`

**Card de imóvel exibe:** código, bairro, cidade, área m², quartos, banheiros, vagas,
preço, selo "Exclusivo".

**Busca:** fraca. Basicamente um seletor de operação (comprando/alugando) e ordenação.
Sem filtro de faixa de preço, quartos, área ou mapa.

**Diagnóstico:** template genérico de plataforma de imobiliária. Cumpre a função de
catálogo, mas não tem posicionamento visual nem qualquer diferenciação de marca.

---

## Referência enviada — https://imobiliariaconceitto.jocemartonin.com.br

**Atenção:** não é um portal de imóveis. É uma **landing page de um único
empreendimento**, o "Alba", hospedada em subdomínio da Joce Martonin (WordPress).

**Estrutura:** menu âncora (O Alba, Apartamentos, Fotos, Destaques, Localização,
Fale Conosco), one page.

**Seções:** hero com tagline de "elegância e exclusividade" e CTA de WhatsApp;
apresentação narrativa do conceito; números do produto (19 unidades, 3 suítes,
260m², vista 360°, pé-direito 2,70m, um apartamento por andar); carrossel de fotos
internas e externas; diferenciais construtivos (contrapiso flutuante, laje 30cm,
esquadria PVC, parede dupla); localização; formulário (nome, e-mail, WhatsApp,
melhor horário, objetivo: investimento / moradia / conhecer plantas).

**Visual:** minimalista, neutros em branco e cinza, tipografia com hierarquia clara,
posicionamento premium. CTA recorrente para wa.me/555432686621.

**Leitura:** o que a Lay quer replicar é o **nível de acabamento visual e o clima
premium**, não a arquitetura de página. Um portal com 1490 imóveis é um produto
diferente de uma LP de empreendimento.

---

## Onde a entrega pode superar a referência

1. **Busca de verdade.** Filtro por operação, cidade, bairro, tipo, faixa de preço,
   quartos, banheiros, vagas, área, mais mapa. Hoje não existe.
2. **Ficha de imóvel premium.** Galeria em tela cheia, planta, tour, mapa do entorno,
   simulador de financiamento, cálculo de custo mensal (condomínio + IPTU),
   compartilhamento e CTA de WhatsApp com o código do imóvel já preenchido.
3. **Página por empreendimento.** Reaproveitar o formato da LP do Alba como template
   para lançamentos, dentro do próprio domínio, capturando o SEO ao invés de doar
   para um subdomínio de terceiro.
4. **SEO de cauda longa.** Página indexável por cidade + bairro + tipo + operação.
   Com 1490 imóveis isso é o principal canal de aquisição orgânica.
5. **Performance.** Core Web Vitals decentes, imagens em AVIF/WebP com tamanho certo.
   Portal de imobiliária costuma ser pesadíssimo e o atual não é exceção.
6. **Captação de lead.** Formulário curto, WhatsApp contextual, alerta de imóvel novo
   por e-mail, área do proprietário.
7. **Duas unidades bem resolvidas.** Roteamento de lead e contato certo por cidade.

---

## O que é o MSYS Imob

CRM de gestão imobiliária da **Mold Systems** (Araraquara/SP, contato@moldsystems.com.br,
(16) 2036-0373). É onde a Conceitto cadastra e administra os imóveis, contratos,
vistorias e proprietários. O site atual é um template do próprio MSYS lendo esse banco,
não um site independente.

Consequência prática: a equipe continua cadastrando no MSYS. O site novo lê o dado
de lá, nunca substitui o cadastro.

**Caminho de integração:** o MSYS já publica no ZAP, VivaReal e Imovelweb, e isso roda
por **feed XML** gerado pelo sistema. O mesmo XML alimenta o site novo. É preciso pedir
ao cliente a URL do feed no painel do MSYS (Configurações > Integrações/Portais) ou
abrir chamado com a Mold Systems.

Fallback, se o feed não vier: scraping agendado do site atual, que expõe todos os
1490 imóveis em URLs previsíveis. Funciona, mas é frágil e fica como plano B.

---

## Decisões tomadas

- **Escopo:** portal completo. Substitui o site atual inteiro (home, busca, listagens,
  ficha de imóvel, institucional, LP de lançamentos).
- **Stack:** Next.js (App Router) + TypeScript strict + Tailwind + Framer Motion.
  SSR/ISR é obrigatório aqui, é o que faz as fichas de imóvel ranquearem.
- **Fonte de dados:** camada isolada por adapter. Começa com mock no formato final,
  troca por MSYS XML quando o feed chegar, sem tocar na UI.

## Decisões em aberto

1. **URL do feed XML do MSYS** — pendente com o cliente.
2. **Domínio e migração:** plano de 301 das URLs atuais.
3. **Identidade:** existe manual de marca, logo em vetor, banco de fotos?
4. **Hospedagem:** Vercel é o caminho natural com Next.js.
5. **Roteamento de lead por cidade:** a divisão matriz/filial em
   `site/src/lib/site-config.ts` foi inferida por geografia. Confirmar com o
   cliente quais municípios cada unidade atende.

---

## Status da primeira entrega (03/08/2026)

Portal funcionando em `site/`, rodando com dados reais.

**O que já está de pé:**

| Rota | O que é |
|---|---|
| `/` | Home com hero, busca, destaques, cidades, diferenciais, unidades |
| `/comprar` e `/alugar` | Busca com filtros, ordenação e paginação |
| `/comprar/<cidade>-rs` | URLs de lugar, iguais às já indexadas |
| `/imovel/<op>/<tipo>/<cidade>/<bairro>/<código>` | Ficha completa |
| `/sobre`, `/contato`, `/anuncie`, `/lancamentos` | Institucional |
| `/sitemap.xml`, `/robots.txt` | SEO |
| `/api/leads` | Captação de lead validada |

**Números do build:** 181 páginas, 119 fichas pré-renderizadas, 175 URLs no
sitemap. Lint e typecheck limpos.

**Diferenças concretas em relação ao site atual:**

- Filtro de faixa de preço, área, dormitórios, banheiros e vagas — o site
  atual não tem nenhum deles
- Galeria em tela cheia com teclado (setas e Esc)
- Custo mensal estimado (condomínio + IPTU/12) na ficha
- WhatsApp roteado por unidade **e** por operação, usando os 4 números que a
  Conceitto já mantém no MSYS, com o código do imóvel na mensagem
- Bloco de imóveis parecidos, pontuado por cidade, bairro, tipo e preço
- JSON-LD `RealEstateListing` em cada ficha
- URLs antigas em formato não canônico respondem 308 para a canônica

**Validado rodando** (`npm run build && npm run start`): status das rotas,
contagem dos filtros, canonical, JSON-LD, redirect de URL legada, 404 de código
inexistente e os quatro casos da API de lead. Não foi feita conferência visual
em navegador nem teste de Core Web Vitals.

**Sobre os dados:** o catálogo tem 119 dos 1490 imóveis. É uma amostra
estratificada por cidade, categoria e operação, o suficiente para desenvolver e
demonstrar. `npm run sync -- --all` puxa o catálogo inteiro.

## Próximos passos

1. Pedir ao cliente o feed XML do MSYS e trocar a origem em
   `scripts/sync-catalog.mjs` (a interface `PropertyRepository` não muda)
2. Ligar a entrega de lead: e-mail e/ou webhook do MSYS em `/api/leads`
3. Mapa na ficha e na busca (falta geocodificar, o MSYS não expõe lat/lng)
4. Logo em vetor e definição da paleta final com o cliente
5. LP de lançamento no padrão do Alba, dentro do domínio próprio
6. Deploy em staging para o cliente aprovar
