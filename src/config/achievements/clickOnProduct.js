export const products = {
  Chat: 'chatAccess',
  'Eventos Externos': 'externalEventsAccess',
  'Meetups Internos': 'internalMeetupsAccess',
  Oportunidades: 'opportunitiesAccess',
  'Impulso TV': 'impulsoTVAccess',
  Blog: 'blogAccess',
  Curadoria: 'curationAccess',
  'Clube de Benefícios': 'benefitsClubAccess',
  'Comunidades.tech': 'ctechAccess',
  'Impulso Comunidades': 'impulsoComunidadesAccess',
  Atena: 'atenaAccess',
  'E-mail @impulso.network': 'impulsoEmailAccess',
  Ajuda: 'helpAccess'
}

export const clickOnProduct = name => {
  const medals = [
    {
      name: 'iron',
      displayMedal: 'Ferro',
      targets: [1, 3, 6, 11, 17],
      score: 5
    },
    {
      name: 'bronze',
      displayMedal: 'Bronze',
      targets: [33, 54, 81, 113, 150],
      score: 10
    },
    {
      name: 'silver',
      displayMedal: 'Prata',
      targets: [216, 294, 384, 486, 600],
      score: 15
    },
    {
      name: 'gold',
      displayMedal: 'Ouro',
      targets: [771, 963, 1176, 1411, 1667],
      score: 20
    },
    {
      name: 'diamond',
      displayMedal: 'Diamante',
      targets: [2017, 2400, 2817, 3267, 3750, null],
      score: 25
    }
  ]

  const [product] = Object.entries(products).find(([, type]) => type === name)

  return {
    displayAchievement: `Acesso em ${product}`,
    medals,
    name
  }
}
