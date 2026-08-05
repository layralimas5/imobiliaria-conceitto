import type { DevelopmentSeed } from '@/domain/development';

/**
 * Launch content, curated by hand.
 *
 * Every fact here was taken from what the Conceitto already publishes about the
 * development (MSYS listing text, referenced by `listingCode`). Nothing is
 * invented: when a measure or a delivery date is unknown, the field is null and
 * the section hides itself.
 */
export const DEVELOPMENT_SEEDS: readonly DevelopmentSeed[] = [
  {
    slug: 'vegas-life-home',
    name: 'Vegas Life Home',
    tagline: 'O edifício mais alto de Farroupilha',
    stage: 'lancamento',
    use: 'residencial',
    builder: null,
    location: {
      addressLine: null,
      neighborhood: 'Centro',
      city: 'Farroupilha',
      citySlug: 'farroupilha',
      state: 'RS',
      mapsQuery: 'Centro, Farroupilha, RS',
      surroundings: 'No centro de Farroupilha, a pé de comércio, serviços e escolas.',
    },
    summary:
      'Vinte e sete pavimentos, quatro apartamentos por andar e plantas de 84 a 130 m² no ponto mais alto de Farroupilha.',
    story: [
      'O Vegas eleva o conceito de morar bem em Farroupilha. São 27 pavimentos e apenas quatro apartamentos por andar, com sofisticação, conforto e a exclusividade de uma vista que nenhum outro endereço da cidade entrega.',
      'As plantas vão de 84 m² a 130 m², com opção de até três suítes e personalização do layout antes da entrega, para o apartamento ficar do jeito que você imaginou.',
      'Mais do que um lançamento, o Vegas é um marco para a construção civil de Farroupilha.',
    ],
    facts: [
      { label: 'Pavimentos', value: '27' },
      { label: 'Por andar', value: '4 apartamentos' },
      { label: 'Plantas', value: '84 a 130 m²' },
      { label: 'Suítes', value: 'até 3' },
    ],
    unitTypes: [
      {
        name: '2 e 3 dormitórios, até 3 suítes',
        bedrooms: null,
        suites: 3,
        parkingSpaces: 1,
        areaFrom: 84,
        areaTo: 130,
        priceFrom: 664000,
      },
    ],
    amenities: [
      'Terraço externo',
      'Quadra de esportes',
      'Espaço kids e playground',
      'Dois salões de festas, um deles estilo pub',
      'Espaço fitness',
      'Lounge com lareira de chão',
    ],
    specs: [
      'Personalização de planta antes da entrega',
      'Elevador social e elevador de serviço',
    ],
    priceFrom: 664000,
    deliveryLabel: null,
    mediaStatus: 'final',
    listingCode: '32247',
    updatedAt: '2026-08-05',
  },
  {
    slug: 'lumme-torres',
    name: 'Lumme',
    tagline: 'Onde a terra e o mar se encontram',
    stage: 'em-obras',
    use: 'residencial',
    builder: null,
    location: {
      addressLine: 'Avenida Carlos Barbosa, 650',
      neighborhood: 'Centro',
      city: 'Torres',
      citySlug: 'torres',
      state: 'RS',
      mapsQuery: 'Avenida Carlos Barbosa, 650, Centro, Torres, RS',
      surroundings:
        'Área nobre de Torres, perto das Quatro Praças e de frente para o Rio Mampituba.',
    },
    summary:
      'Quarenta e sete apartamentos em 20 andares na área nobre de Torres, de frente para o Rio Mampituba, com piscina de borda infinita.',
    story: [
      'O Lumme fica na Avenida Carlos Barbosa, área nobre de Torres, perto das Quatro Praças e de frente para o Rio Mampituba, que deságua no Oceano Atlântico e conecta o Rio Grande do Sul a Santa Catarina.',
      'São 47 apartamentos em 20 andares, com apenas três plantas por andar, de dois ou três dormitórios, box duplo ou simples e guarda-volumes individual para os itens de praia.',
      'A personalização é parte do projeto: dá para alterar paredes, pontos elétricos, hidráulicos, de gás e de ar-condicionado, acabamentos, piso e gesso, além de instalar vidro duplo e persianas motorizadas.',
    ],
    facts: [
      { label: 'Apartamentos', value: '47' },
      { label: 'Andares', value: '20' },
      { label: 'Por andar', value: '3 plantas' },
      { label: 'Dormitórios', value: '2 ou 3' },
    ],
    unitTypes: [
      {
        name: '2 dormitórios, 1 suíte',
        bedrooms: 2,
        suites: 1,
        parkingSpaces: 1,
        areaFrom: 78.51,
        areaTo: 78.51,
        priceFrom: 700000,
      },
      {
        name: '3 dormitórios',
        bedrooms: 3,
        suites: null,
        parkingSpaces: 1,
        areaFrom: null,
        areaTo: null,
        priceFrom: null,
      },
    ],
    amenities: [
      'Piscina de borda infinita',
      'Fire place',
      'Academia',
      'Espaço kids',
      'Salão de festas',
      'Guarda-volumes individual para itens de praia',
    ],
    specs: [
      'Reúso da água da chuva na irrigação dos jardins',
      'Garagens fechadas com espera para carro elétrico',
      'Ponto de água nas garagens para lavar os pés depois da praia',
      'Compressor com calibrador para reparos do dia a dia',
      'Personalização de planta, acabamentos e instalações',
    ],
    deliveryLabel: null,
    mediaStatus: 'final',
    listingCode: '31517',
    updatedAt: '2026-08-05',
  },
  {
    slug: 'lancamento-centro-torres',
    name: 'Lançamento no Centro de Torres',
    tagline: 'Rooftop panorâmico perto da Lagoa do Violão',
    stage: 'lancamento',
    use: 'residencial',
    builder: null,
    location: {
      addressLine: null,
      neighborhood: 'Centro',
      city: 'Torres',
      citySlug: 'torres',
      state: 'RS',
      mapsQuery: 'Lagoa do Violão, Centro, Torres, RS',
      surroundings: 'Pertinho da Lagoa do Violão e a poucos minutos do centro de Torres.',
    },
    summary:
      'Apartamentos de 95 a 110 m² com duas vagas, rooftop panorâmico e piscina aquecida, a poucos passos da Lagoa do Violão.',
    story: [
      'Um empreendimento que une localização privilegiada, vista panorâmica e lazer completo, pertinho da Lagoa do Violão e próximo ao centro de Torres.',
      'A orientação solar foi pensada para manter os ambientes iluminados o dia inteiro, e cada apartamento tem duas vagas de garagem.',
      'No térreo, cinco salas comerciais com mezanino em ponto estratégico da cidade, para quem quer investir ou instalar o próprio negócio.',
    ],
    facts: [
      { label: 'Vagas', value: '2 por apartamento' },
      { label: 'Tipologias', value: '5 plantas' },
      { label: 'Salas comerciais', value: '5 com mezanino' },
    ],
    unitTypes: [
      {
        name: '2 dormitórios, 2 suítes',
        bedrooms: 2,
        suites: 2,
        parkingSpaces: 2,
        areaFrom: 109.22,
        areaTo: 109.46,
        priceFrom: null,
      },
      {
        name: '2 dormitórios, 1 suíte',
        bedrooms: 2,
        suites: 1,
        parkingSpaces: 2,
        areaFrom: 95.95,
        areaTo: 95.95,
        priceFrom: null,
      },
      {
        name: '3 dormitórios, 1 suíte',
        bedrooms: 3,
        suites: 1,
        parkingSpaces: 2,
        areaFrom: 102.16,
        areaTo: 104.64,
        priceFrom: null,
      },
    ],
    amenities: [
      'Rooftop com vista panorâmica',
      'Piscina aquecida com vista panorâmica',
      'Lounge',
      'Espaço gourmet',
      'Salão de festas com possibilidade de integração',
      'Fireplace',
      'Espaço fitness completo',
    ],
    specs: ['Orientação solar privilegiada', 'Duas vagas de garagem por apartamento'],
    // O valor no MSYS é de uma unidade específica, não o piso da tabela.
    // Anunciar como "a partir de" seria enganoso: fica sob consulta.
    priceFrom: null,
    deliveryLabel: null,
    mediaStatus: 'final',
    listingCode: '33099',
    updatedAt: '2026-08-05',
  },
  {
    slug: 'vietro-centro-profissional',
    name: 'Vietro Centro Profissional',
    tagline: 'Salas comerciais no coração de Farroupilha',
    stage: 'em-obras',
    use: 'comercial',
    builder: null,
    location: {
      addressLine: 'Rua Marechal Deodoro da Fonseca',
      neighborhood: 'Centro',
      city: 'Farroupilha',
      citySlug: 'farroupilha',
      state: 'RS',
      mapsQuery: 'Rua Marechal Deodoro da Fonseca, Centro, Farroupilha, RS',
      surroundings: 'Área central de Farroupilha, junto à Marechal Deodoro da Fonseca.',
    },
    summary:
      'Salas comerciais em construção na área central de Farroupilha, com infraestrutura completa para o trabalho híbrido.',
    story: [
      'O Vietro reúne salas comerciais modernas e funcionais em fase de construção, localizadas estrategicamente na área central de Farroupilha, junto à rua Marechal Deodoro da Fonseca.',
      'O projeto foi desenhado para elevar a qualidade e o bem-estar da rotina de trabalho, com um ambiente contemporâneo pensado para jornadas híbridas e espaços corporativos modernos.',
    ],
    facts: [
      { label: 'Salas', value: 'a partir de 59,72 m²' },
      { label: 'Vagas', value: '1 por sala' },
      { label: 'Situação', value: 'Em construção' },
    ],
    unitTypes: [
      {
        name: 'Sala comercial',
        bedrooms: null,
        suites: null,
        parkingSpaces: 1,
        areaFrom: 59.72,
        areaTo: 59.72,
        priceFrom: 326300,
      },
    ],
    amenities: [
      'Business center',
      'Coworking',
      'Elevador social e de serviço',
      'Guarita com biometria',
      'Estacionamento coberto',
      'Infraestrutura de internet e cabeamento estruturado',
    ],
    specs: [
      'Medição de água individualizada',
      'Medidores de energia individuais',
      'Alarme e interfone',
    ],
    deliveryLabel: null,
    mediaStatus: 'final',
    listingCode: '31832',
    updatedAt: '2026-08-05',
  },
  {
    slug: 'alba',
    name: 'Alba',
    tagline: 'Um apartamento por andar, vista de 360 graus',
    stage: 'lancamento',
    use: 'residencial',
    builder: null,
    location: {
      // TODO(cliente): confirmar endereço e cidade. Inferido do WhatsApp da matriz
      // na landing page atual, hospedada em subdomínio de terceiro.
      addressLine: null,
      neighborhood: 'Centro',
      city: 'Farroupilha',
      citySlug: 'farroupilha',
      state: 'RS',
      mapsQuery: 'Centro, Farroupilha, RS',
      surroundings: null,
    },
    summary:
      'Dezenove unidades de 260 m² com três suítes, um apartamento por andar e vista de 360 graus.',
    story: [
      'O Alba é o oposto do prédio grande: são 19 unidades, um apartamento por andar e 260 m² de área privativa com três suítes.',
      'A vista de 360 graus e o pé-direito de 2,70 m definem o clima da casa, e o padrão construtivo foi escolhido para o silêncio e o conforto térmico de quem mora, não para a planilha da obra.',
    ],
    facts: [
      { label: 'Unidades', value: '19' },
      { label: 'Por andar', value: '1 apartamento' },
      { label: 'Área privativa', value: '260 m²' },
      { label: 'Pé-direito', value: '2,70 m' },
    ],
    unitTypes: [
      {
        name: '3 suítes',
        bedrooms: 3,
        suites: 3,
        parkingSpaces: null,
        areaFrom: 260,
        areaTo: 260,
        priceFrom: null,
      },
    ],
    amenities: [],
    specs: [
      'Contrapiso flutuante',
      'Laje de 30 cm',
      'Esquadria de PVC',
      'Parede dupla',
      'Pé-direito de 2,70 m',
    ],
    priceFrom: null,
    deliveryLabel: null,
    // The launch material still lives on a third-party subdomain; bringing the
    // photography over is what closes this page.
    mediaStatus: 'pending',
    photos: [],
    listingCode: null,
    updatedAt: '2026-08-05',
  },
];
