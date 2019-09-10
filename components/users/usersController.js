import moment from 'moment-timezone'
import utils from './usersUtils'
import dal from './usersDAL'
import service from './usersService'
import rankings from '../rankings'
import messages from '../messages'
import errors from '../errors'
import interactions from '../interactions'

const file = 'Users | Controller'

const save = user => {
  return dal.save(user)
}

const find = (query, sort, limit, skip) => {
  return dal.find(query, sort, limit, skip)
}

const findAll = () => {
  return dal.findAll()
}

const findOne = query => {
  return dal.findOne(query)
}

const findOneAndUpdate = (query, args, options) => {
  return dal.findOneAndUpdate(query, args, options)
}

const updateScore = async (user, score) => {
  return service.updateScore(user, score)
}

const saveOnNewLevel = async user => {
  return service.saveOnNewLevel(user)
}

const commandScore = async message => {
  const user = await dal.findOne({ username: message.u.username })
  if (!user) {
    response = {
      msg: 'Ops! Não conseguimos verificar seus pontos. :/'
    }
  }

  let response = {
    msg: 'Ops! Você ainda não tem pontos registrados.'
  }

  const position = await rankings.calculatePositionByUser(user, user.isCoreTeam)
  if (position > 0) {
    response = {
      msg: `Olá ${user.name}, atualmente você está no nível ${user.level} com ${user.score} XP`,
      attachments: [
        {
          text: `Ah, e você está na posição ${position} do ranking`
        }
      ]
    }
  }

  return response
}

const findAllToRanking = async (
  isCoreTeam = false,
  limit = 20,
  select = '-email -teams -_id -lastUpdate',
  team = null,
  sort = { score: -1 }
) => {
  let query = {
    score: { $gt: 0 },
    isCoreTeam: isCoreTeam
  }

  if (team) {
    query = {
      ...query,
      teams: team
    }
  }

  return dal.findAll(query, select, limit, sort)
}

const isCoreTeam = async rocketId => {
  return service.isCoreTeam(rocketId)
}

const commandPro = async message => {
  let response = {
    msg: 'Ops! Você não tem plano pro.'
  }

  const user = await dal.findOne({ rocketId: message.u._id })
  if (user.pro) {
    const beginDate = user.proBeginAt
      ? moment(user.proBeginAt).format('DD/MM/YYYY')
      : 'Sem data definida'

    const finishDate = user.proFinishAt
      ? moment(user.proFinishAt).format('DD/MM/YYYY')
      : 'Sem data definida'

    response = {
      msg: `Olá ${user.name}, você tem um plano pro.`,
      attachments: [
        {
          text: `Início do Plano: ${beginDate}`
        },
        {
          text: `Fim do Plano: ${finishDate}`
        }
      ]
    }
  }

  return response
}

const commandUserInfos = async message => {
  const coreTeam = await isCoreTeam(message.u._id)
  if (!coreTeam) return { msg: 'Ops! *Não tens acesso* a esta operação!' }

  const username = utils.getUsernameByMessage(message.msg)
  if (!username) return { msg: 'Ops! Você não nos mandou o *usuário*.' }

  const user = await dal.findOne({ username: username })
  if (!user) return { msg: 'Usuário *não* encontrado.' }

  const beginDate = user.proBeginAt
    ? moment(user.proBeginAt).format('L')
    : 'Sem data definida'

  const finishDate = user.proFinishAt
    ? moment(user.proFinishAt).format('L')
    : 'Sem data definida'

  return {
    msg: `*Usuário*: _${user.name}_`,
    attachments: [
      {
        text: `*Nível*: ${user.level}`
      },
      {
        text: `*XP*: ${user.score}`
      },
      {
        text: user.pro
          ? `Usuário *possui* plano pro.\n\
          Plano iniciou em *${beginDate}* e terminará em *${finishDate}*`
          : 'Usuário *não possui* plano pro!'
      }
    ]
  }
}

const sendWelcomeMessage = user => {
  const message = utils.getWelcomeMessage()
  return messages.sendToUser(message, user)
}

const findInactivities = async () => {
  return service.findInactivities()
}

const receiveProPlan = data => {
  return service.receiveProPlan(data)
}

const getProBeginDate = (user, plan) => {
  return service.getProBeginDate(user, plan)
}

const getProFinishDate = (user, plan) => {
  return service.getProFinishDate(user, plan)
}

const updatePro = async user => {
  return service.updatePro(user)
}

const findUsersWithSlack = async (req, res) => {
  try {
    return service.findUsersWithSlack()
  } catch (e) {
    errors._throw(file, 'findUsersWithSlack', e)
  }
}

const findRocketUsersByName = async name => {
  try {
    return service.findRocketUsersByName(name)
  } catch (err) {
    errors._throw(file, 'findRocketUserByName', e)
  }
}

const transferScore = async (userId, type, score) => {
  let user
  try {
    if (type === 'slack') {
      user = await service.transferScoreToSlackUser(userId, score)
    } else if (type === 'rocket') {
      user = await service.transferScoreToRocketUser(userId, score)
    }
  } catch (e) {
    errors._throw(file, 'transferScore', e)
  }

  return user
}

const getMostActives = async (begin, end) => {
  return interactions.getMostActivesUsers(begin, end)
}

const sendPoints = async data => {
  return service.sendPoints(data)
}

const getUserProfileByUuid = async uuid => {
  return service.getUserProfileByUuid(uuid)
}

export default {
  save,
  find,
  findAll,
  findOne,
  findOneAndUpdate,
  findInactivities,
  updateScore,
  commandScore,
  commandPro,
  findAllToRanking,
  isCoreTeam,
  commandUserInfos,
  sendWelcomeMessage,
  receiveProPlan,
  getProBeginDate,
  getProFinishDate,
  updatePro,
  findUsersWithSlack,
  findRocketUsersByName,
  transferScore,
  getMostActives,
  sendPoints,
  saveOnNewLevel,
  getUserProfileByUuid
}
