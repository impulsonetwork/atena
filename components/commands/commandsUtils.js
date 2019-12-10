const getCommandsText = () => {
  return [
    {
      text:
        'Digite *!meuspontos* para verificar teus pontos de reputação e nível!'
    },
    { text: 'Digite *!minhasconquistas* para verificar tuas conquistas!' },
    {
      text: 'Digite *!pro* para verificar o status do teu plano Impulser Pro!'
    },
    {
      text:
        'Digite *!rankinggeral* e veja o ranking geral e a tua posição nele!'
    },
    {
      text:
        'Digite *!ranking* e veja o ranking do mês atual e tua posição nele! Além disso, podes escolher um mês específico ao adicionar um número de 1 à 12 após o comando! Ex: !ranking 2 para o mês de Fevereiro.'
    }
  ]
}

const getCoreTeamCommandsText = () => {
  return [
    {
      text: `Digite ${'`!darpontos`'} ${'`@lista @usuários`'} ${'`pontos`'} ${'`motivo`'} para dar pontos de reputação ao usuário. `
    },
    {
      text: `Digite ${'`!checkinfos`'} ${'`@nome-usuario`'} para checar dados relevantes do usuário. `
    }
  ]
}

const getCommandsRegex = () => {
  return {
    ranking: /^!ranking[ 1234567890]*$/g,
    rankingGeral: /^!rankinggeral$/g,
    myPoints: /^!meuspontos$/g,
    myAchievements: /^!minhasconquistas$/g,
    isPro: /^!pro$/g,
    commands: /^!comandos$/g,
    sendPoints: /^!darpontos\s(([@][\w\d-]+\s?)+\s?)\s(\d{1,5})\s"([\w\d\s]+)"$/g,
    checkInfos: /^!checkinfos/g,
    openSource: /^!opensource$/g,
    openSourceAddRepository: /^!addrepositorio[ \d\w]*$/g,
    openSourceRemoveRepositoryUser: /^!removerepositoriousuario[ \d\w @a-z-A-Z]*$/g,
    sendMessageThroughAtena: /^!hey\s(([@#][\w\d-]+\s?)+\s?)\n.+$/gm
  }
}

const getUsernameByMessage = message => {
  const checkFields = /(@[a-z0-9\-]+)/g
  const result = checkFields.exec(message)
  return result ? result[1].replace('@', '') : false
}

export default {
  getCommandsText,
  getCoreTeamCommandsText,
  getCommandsRegex,
  getUsernameByMessage
}
