import users from '../users'
import utils from './rankingsUtils'
import dal from './rankingsDAL'
import interactions from '../interactions'
import usersUtils from '../users/usersUtils'

const calculatePositionByUser = async (user, isCoreTeam = false) => {
  const allUsers = await users.findAllToRanking(isCoreTeam, 0)
  return await getPositionFromUsers(allUsers, user)
}

const getGeneralRanking = async (rocketId, isCoreTeam) => {
  const user = await users.findOne({ rocketId })

  if (!user) {
    return { msg: 'Ops. Não conseguimos gerar o ranking nesse momento. :/' }
  }

  let response = {
    msg: 'Veja as primeiras pessoas do ranking:',
    attachments: []
  }

  const allUsers = await users.findAllToRanking(isCoreTeam, 5)
  const myPosition = await calculatePositionByUser(user, isCoreTeam)
  if (!allUsers.length) response.msg = 'Ops! Ainda ninguém pontuou. =/'

  response.attachments = allUsers.map((rankingUser, index) => ({
    text: `${index + 1}º lugar está ${
      rankingUser.uuid.toString() === user.uuid.toString()
        ? 'você'
        : rankingUser.name
    } com ${parseInt(rankingUser.score)} XP, no nível ${rankingUser.level}`
  }))

  response.attachments.push({
    text: `Ah, e você está na posição ${myPosition} do ranking`
  })

  return response
}

const getUserMessagePositionByMonth = async (user, month, rankingUsers) => {
  let message = `Opa, você não pontuou no game em ${month}`

  const position = await getPositionFromUsers(rankingUsers, user)
  if (position > 0)
    message = `Ah, e você está na posição ${position} do ranking de ${month}`

  return message
}

const getRankingMessageByMonth = async (user, month) => {
  if (!user) {
    return { msg: 'Ops. Não conseguimos gerar o ranking nesse momento. :/' }
  }

  const rankingMonthly = await getRankingByMonth(month)
  if (rankingMonthly.error) {
    return { msg: rankingMonthly.error }
  }

  const monthName = utils.getMonthName(month - 1)
  if (rankingMonthly.users.length === 0) {
    return { msg: `Ops! Ainda ninguém pontuou em ${monthName}. =/` }
  }

  let response = {
    msg: `Veja as primeiras pessoas do ranking em ${monthName}:`,
    attachments: []
  }

  response.attachments = await rankingMonthly.users
    .slice(0, 5)
    .map((user, index) => {
      return {
        text: `${index + 1}º lugar está ${user.user.name} com ${
          user.score
        } XP, no nível ${user.level}`
      }
    })

  const userMessage = await getUserMessagePositionByMonth(
    user,
    monthName,
    rankingMonthly.users
  )
  response.attachments.push({ text: userMessage })

  return response
}

const getRankingByMonth = async (month, year) => {
  if (!(await utils.isValidMonth(month)))
    return { error: 'Digite um mês válido Ex: *!ranking 1*' }

  if (!year) year = new Date(Date.now()).getFullYear()

  const ranking = await dal.findOneAndPopulate(
    {
      date: {
        $gte: new Date(year, month - 1, 1)
      }
    },
    'users.user'
  )

  if (!ranking) {
    const monthName = utils.getMonthName(month - 1)
    return {
      error: `Ranking do mês de ${monthName} não foi gerado ou encontrado`
    }
  }

  return ranking
}

const generateUsersPosition = async (
  usersFromRanking,
  team = false,
  limit = 20
) => {
  let allUsers = [...usersFromRanking]

  if (team) {
    allUsers = allUsers.filter(u => {
      let belongs = false
      if (u.user) belongs = u.user.teams.includes(team)
      if (u.teams) belongs = u.teams.includes(team)
      return belongs
    })
  }

  allUsers = allUsers.slice(0, limit)

  return allUsers.map((u, index) => ({
    name: u.name || u.user.name,
    xp: parseInt(u.score || u.xp, 10) || 0,
    level: u.level,
    avatar: u.user ? u.user.avatar : u.avatar,
    teams: u.teams || u.user.teams,
    slackId: u.user ? u.user.slackId : u.slackId,
    rocketId: u.user ? u.user.rocketId : u.rocketId,
    position: index + 1
  }))
}

const closePreviousRanking = async date => {
  let year = date.getFullYear()
  let month = date.getMonth()

  if (month == 0) {
    year -= 1
    month = 12
  }

  const ranking = await dal.findOne({
    date: {
      $gte: new Date(year, --month)
    }
  })

  if (ranking) {
    ranking.closed = true
    await dal.save(ranking)
  }
}

const getRankingUsersByMonth = async (month, year) => {
  const allInteractions = await interactions.findByDate(year, month)

  const rankingUsers = allInteractions.map(interaction => ({
    user: interaction._id.user,
    score: interaction.totalScore,
    level: usersUtils.calculateLevel(interaction.totalScore)
  }))

  return rankingUsers
}

const findOrCreate = async (year, month) => {
  let ranking = await getRankingByMonth(month, year)

  if (!ranking || ranking.error) {
    ranking = {
      isCoreTeam: false,
      users: [],
      date: new Date(year, month - 1, 1),
      isNew: true
    }
  }

  return ranking
}

const getMonthlyPositionByUser = async userId => {
  const today = new Date(Date.now())
  const monthlyRanking = await getRankingUsersByMonth(
    today.getMonth() + 1,
    today.getFullYear()
  )

  const monthlyPosition = monthlyRanking.findIndex(
    data => data.user.toString() === userId.toString()
  )
  return monthlyPosition + 1
}

const getPositionFromUsers = async (rankingUsers, user) => {
  const position = rankingUsers.findIndex(data => {
    const rankingUser = data.user || data
    return (
      user.uuid &&
      rankingUser.uuid &&
      rankingUser.uuid.toString() === user.uuid.toString()
    )
  })

  return position + 1
}

export default {
  calculatePositionByUser,
  getGeneralRanking,
  getRankingByMonth,
  getRankingMessageByMonth,
  generateUsersPosition,
  closePreviousRanking,
  getRankingUsersByMonth,
  findOrCreate,
  getMonthlyPositionByUser
}
