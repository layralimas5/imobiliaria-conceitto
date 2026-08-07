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
| `/lancamentos` | Vitrine dos empreendimentos |
| `/lancamentos/<slug>` | Landing page do empreendimento |
| `/sobre`, `/contato`, `/anuncie` | Institucional |
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

## Segunda entrega (05/08/2026) — módulo de lançamentos

As landing pages de empreendimento agora vivem dentro do domínio da Conceitto,
que é o que traz para casa o SEO hoje doado ao subdomínio de terceiro.

**O que entrou:**

- `/lancamentos` — vitrine com card por empreendimento, estágio de venda
  (lançamento / em obras / pronto), faixa de área, dormitórios e preço de entrada
- `/lancamentos/<slug>` — LP completa: hero em tela cheia, menu âncora que
  acompanha a rolagem, conceito, números do produto, tipologias com área e valor,
  lazer, padrão construtivo, galeria em tela cheia, localização e captação de lead
  amarrada ao empreendimento
- Bloco "Comprar na planta" na home, com os três lançamentos com material pronto
- `developmentSlug` no lead, para o corretor saber de qual empreendimento veio
- JSON-LD `ApartmentComplex` (residencial) e `LocalBusiness` (comercial), mais as
  cinco URLs novas no sitemap

**Cinco empreendimentos no ar**, com conteúdo tirado do que a Conceitto já
publica no MSYS: Vegas Life Home (Farroupilha), Lumme (Torres), Lançamento no
Centro de Torres, Vietro Centro Profissional (Farroupilha) e Alba.

**Arquitetura:** o texto editorial é curado em `site/src/data/developments.ts`;
foto, corretor e preço vêm do anúncio MSYS pelo `listingCode`, então não existe
segunda cópia do dado. Trocar por um CMS depois significa implementar
`DevelopmentRepository` e mais nada.

**Validado rodando** (`npm run build && npm run start`, mais navegador headless):
status das cinco rotas e 404 de slug inexistente, canonical, JSON-LD dos dois
tipos, sitemap com 180 URLs, lead com `developmentSlug` chegando na API,
galeria e lightbox com teclado, e conferência visual em 1440px e 390px.

## Pendências desse módulo com o cliente

1. **Material do Alba** — a página está de pé, mas sem foto. Hoje ela mostra um
   aviso explícito de material em produção. Falta a incorporadora liberar as
   imagens, e confirmar o endereço (a cidade foi inferida pelo WhatsApp da matriz).
2. **Nome comercial do lançamento de Torres** — no MSYS ele não tem nome, só o
   título "Lançamento no Centro de Torres". Se a incorporadora já batizou, trocar.
3. **Atendimento de Torres** — os leads de Torres estão indo para a matriz de
   Farroupilha. Cai na mesma pergunta em aberto de qual unidade atende cada
   município.
4. **Tabela de preços** — só Vegas, Lumme e Vietro têm valor de entrada. Os outros
   dois estão como "sob consulta" de propósito, para não anunciar preço errado.

## Terceira entrega (06/08/2026) — catálogo completo, mapa e entrega de lead

**Catálogo inteiro no ar.** 1498 imóveis, contra os 119 da amostra. O sitemap
publicado na origem lista 1500; dois ficaram de fora por não terem nenhuma foto.

**Mapa.** O MSYS não expõe coordenada, então `scripts/geocode-catalog.mjs`
geocodifica no nível do bairro pelo Nominatim (OpenStreetMap, sem chave e sem
cobrança), com cache versionado. Uma consulta por par cidade + bairro: 149
consultas cobrindo os 1498 imóveis. Os 149 bairros resolveram, 120 no nível do
bairro e 29 caindo para o centro da cidade.

A escolha de geocodificar por bairro não é uma limitação contornada, é a
política do site: a ficha nunca publica o endereço exato, e o pin não pode
afirmar mais do que isso. Imóveis do mesmo bairro recebem um deslocamento
determinístico de até ~400 m derivado do código, para os pins não empilharem, e
a UI escreve embaixo do mapa qual precisão está mostrando.

Onde aparece: seção "Localização" na ficha, com círculo de incerteza, e uma aba
Lista / Mapa na busca, plotando a página de resultados atual. Só a página, não o
catálogo inteiro — 24 pins ficam legíveis sem clusterização e o navegador não
recebe 1500 coordenadas. O Leaflet entra por import dinâmico, então as páginas
sem mapa não carregam nada disso.

**Entrega de lead.** `/api/leads` deixou de só logar. `src/lib/lead-delivery.ts`
tem dois canais independentes ligados por variável de ambiente:

- E-mail via Resend, roteado para a caixa da unidade que atende a cidade do
  imóvel, com `reply_to` no e-mail do interessado e botão de WhatsApp montado
- Webhook genérico, com o payload completo (lead, unidade, imóvel,
  empreendimento) — é a porta de entrada do MSYS quando liberarem o endpoint

Sem canal configurado o lead é validado, logado com aviso e a resposta é 200,
para o site rodar antes das credenciais. Com canal configurado e todos falhando,
a resposta é 502 e o formulário manda o visitante para o WhatsApp. Um lead nunca
recebe confirmação verde que não mereceu.

**Acessibilidade.** Passada de correção no que estava declarado mas não
implementado:

- O lightbox da galeria e o painel de filtros no mobile declaravam
  `aria-modal` sem prender o foco. O Tab passeava pela página atrás do overlay e
  o foco não voltava ao abrir/fechar. Corrigido com `useModalFocus`
- Erros do formulário de lead agora estão amarrados ao campo por
  `aria-describedby` + `aria-invalid`, e o foco vai para o primeiro campo
  inválido no submit, e para a confirmação no sucesso
- Menu mobile fecha com Escape devolvendo o foco ao botão, e marca a página
  atual com `aria-current`

**Três defeitos que só apareceram com o catálogo inteiro:**

1. A home anunciava **1512 imóveis** somando as facetas de venda e locação, que
   contam duas vezes quem é anunciado nas duas operações. São 1498. Agora vem de
   `propertyRepository.count()`, que é a contagem distinta.
2. O título do MSYS é digitado em caixa alta pela equipe, e o site publicava o
   grito literal em 1498 fichas ("IMOBILIÁRIA CONCEITTO ALUGA-LINDO APARTAMENTO
   NO BOTAFOGO"). `formatListingTitle` baixa para title case quando o texto é
   predominantemente maiúsculo, e não encosta em título já bem escrito.
3. O mapa transbordava a coluna de resultados na busca em desktop, e ficava com
   canto quadrado. O primeiro era `min-width: auto` do grid, o segundo uma
   sintaxe de Tailwind v3 (`rounded-[--radius-card]`) que a v4 não resolve.

## Quarta entrega (06/08/2026) — marca e fotografia

**Logo no ar.** O arquivo veio em PNG com fundo cinza chapado e sem canal
alfa. O recorte é flood fill a partir da borda, então o branco dentro do "C"
sobrevive, e a franja antisserrilhada é desmisturada do cinza em vez de só
receber alfa menor.

**O cabeçalho deixou de ser transparente sobre o hero.** Não foi escolha
estética: a tipografia do "IMOBILIÁRIA" tem 1px de traço, então em cor sobre
foto escura ela fantasmiza, e o knockout branco achata a marca "C" num bloco
sólido sem o C. Com um logo branco ou em vetor o cabeçalho imersivo volta.

**Paleta no vermelho da marca.** O token `forest-*` virou `brand-*`, e
`brand-700` é o `#af1917` exato do logo, então botão e marca são o mesmo
vermelho. Passa 7:1 contra branco. A primeira tentativa dessaturou o
vermelho para não gritar em superfície grande, ficou marrom e foi descartada.

**Filtro do hero centralizado**, com o alternador Comprar/Alugar junto.

**Título dos imóveis igual ao site oficial.** Eu havia convertido de caixa
alta para title case. O site oficial publica em caixa alta, e é esse o nome
que vale. Revertido.

**Fotografia saiu do S3 da Mold Systems.** O site não renderiza mais nenhuma
imagem do bucket. A troca acontece num ponto só, na saída do repositório: as
fotos vêm de `public/imagens/imoveis` pelo código do imóvel, e todo consumidor
(card, galeria, Open Graph, JSON-LD, lançamento) segue sem saber a origem. A
foto do corretor mora no mesmo bucket e caiu junto.

Os estados vazios foram desenhados, porque hoje são o padrão nas 1498 fichas:
o card mostra o bairro em serifada sobre degradê quente, e a ficha não reserva
mais área de foto (um bloco morto de tela inteira empurrava preço e CTA para
fora da dobra). Destaques e imóveis parecidos passaram a preferir foto em vez
de exigir, senão a home esvaziaria.

**Capa da home por arquivo.** A primeira imagem de `public/imagens/banner`
vira o fundo do hero. A Lay já subiu a dela.

## Pendências dessa entrega

1. **Fotos dos imóveis.** As pastas estão vazias e a Lay vai preencher por
   fora. O `LEIA-ME.txt` em `public/imagens/imoveis` documenta a convenção de
   nome. Enquanto não houver arquivo, nenhuma ficha tem foto.
2. **Vídeo no banner.** Há um `banner video.mp4` (2,5 MB) na pasta do banner
   que o site não usa: o hero só lê imagem. Falta decidir se o hero vira vídeo.
3. **Peso dos arquivos.** A imagem do banner tem 2,2 MB em PNG. O otimizador
   do Next converte para AVIF/WebP no build, então o que trafega é bem menor,
   mas um JPEG de origem pouparia tempo de build.
4. **Logo em branco ou vetor**, para o cabeçalho imersivo voltar.

## Quinta entrega (06/08/2026) — captação de imóvel e acabamento

**Cadastro de imóvel em `/anuncie`.** O proprietário preenche dados dele e do
imóvel, anexa fotos e envia. É a mudança de maior peso: a página deixou de ser
um pedido de avaliação de quatro campos.

Importante ser honesto sobre o destino: **isso não escreve no MSYS**. O CRM não
tem API de escrita, só publica para fora via feed de portais. Então a submissão
chega à equipe (e-mail com as fotos em anexo e/ou webhook com o manifesto) com
tudo que é preciso para cadastrar, e uma pessoa cria o registro no MSYS.

As fotos são reduzidas no navegador antes de subir, para 1920px e JPEG. Não é
refinamento: o corpo de uma requisição serverless trava em ~4,5 MB no host, e
uma foto de celular tem de 3 a 5 MB. Sem isso, oito fotos nunca chegariam à
função. Testado: um PNG de 5,54 MB em 3000x2000 vira 0,1 MB.

**Cabeçalho com vidro fosco no scroll**, `blur(40px)` sobre branco a 70%. O
estado anterior era `bg-paper/95`, ou seja, uma chapa opaca com desfoque
irrelevante atrás.

**Ícones de telefone e de acesso ao sistema** ao lado do menu. O telefone
disca a matriz, que é a mesma regra que `branchFor(undefined)` aplica no resto
do site. O ícone de usuário abre a área do cliente do MSYS, o mesmo destino que
o site atual já usa.

**Rodapé:** Instagram e Facebook viraram ícones abaixo do CRECI, uma linha por
unidade, porque as duas lojas têm perfis diferentes e um par único de ícones
seria mentira. A última linha trocou o CRECI por "Desenvolvido por Layra Lima",
e a razão social deu lugar ao nome fantasia.

**Sobre "as abas não estão funcionando":** não reproduziu. Testei as sete rotas
por HTTP e clicando uma a uma no navegador, todas respondem 200 e navegam. O
que aconteceu é que eu subi e derrubei servidor na porta 3000 várias vezes
durante a sessão, e em alguns momentos ela ficou com processo morto ou servindo
build antigo. Para conferir do lado da Lay: `npm run dev` em `site/`, e se der
"porta em uso" é processo velho pendurado.

## Próximos passos

1. **Deploy em staging.** É o único item da terceira entrega que não fechou: a
   Vercel exige login interativo e não há credencial nessa máquina. O código
   está pronto para subir — ver a seção "Deploy" do `site/README.md`, com Root
   Directory em `site`.
2. **Credencial de entrega de lead.** O transporte está implementado e testado
   nos dois canais; falta só a chave. Uma conta Resend com o domínio verificado
   resolve, ou a URL do webhook se preferir passar por n8n/MSYS.
3. Pedir ao cliente o feed XML do MSYS e trocar a origem em
   `scripts/sync-catalog.mjs` (a interface `PropertyRepository` não muda)
4. Logo em vetor e definição da paleta final com o cliente
5. Confirmar quais municípios cada unidade atende. Com o catálogo inteiro no ar
   isso deixou de ser detalhe: aparecem 22 cidades, incluindo litoral (Torres,
   Capão da Canoa, Arroio do Sal, Xangri-lá, Passo de Torres) e Porto Alegre,
   Canoas e Caxias. Hoje tudo que não é a região de Bento cai na matriz.
6. **Foto do hero da home.** Sai automaticamente do primeiro destaque do MSYS, e
   hoje caiu uma foto de prédio comum. Vale escolher uma imagem fixa à altura do
   posicionamento premium.
7. Trocar geração estática por ISR quando o feed chegar. Hoje são 1654 páginas
   pré-renderizadas e o build leva ~6 min, então cada atualização de catálogo
   exige deploy novo.

---

## Sexta entrega — painel interno e demonstração (06/08/2026)

O site ganhou área do cliente e um painel interno em `/sistema` (Leads,
Corretores, Imóveis, CRM, Financeiro, Configurações e API). Ambos são
**demonstrações**: os dados são fictícios, vivem em `src/data/demo-*.ts` e cada
tela diz isso na própria interface. Não há autenticação de verdade em nenhum dos
dois.

O catálogo está limitado a **10 imóveis** (`CATALOG_LIMIT` em
`src/data/catalog-repository.ts`) enquanto a proposta não fecha. Todo imóvel com
foto entra na seleção, seja qual for o limite.

### Pendências novas

1. **Cadastro de imóvel não vai funcionar no Netlify.** O painel grava num JSON
   e escreve as fotos em `public/imagens/imoveis/`. Netlify roda em funções
   serverless, onde o sistema de arquivos é somente leitura: o formulário vai
   falhar com "Não foi possível salvar". Todo o resto do painel funciona, porque
   só lê. Para o cadastro funcionar em produção é preciso trocar
   `src/lib/system-store.ts` por armazenamento de verdade — Netlify Blobs
   resolve o JSON, e as fotos pedem um bucket (Blobs, S3 ou Cloudinary).
2. **Autenticação.** Hoje `/sistema` é acessível por URL e tem ícone no header
   do site. Antes de qualquer coisa pública, precisa de login real.
3. **Senha de corretor em texto puro.** O cadastro grava como digitado, e a tela
   avisa. Em produção, hash.
