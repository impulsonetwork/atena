import config from 'config-yml'
import moment from 'moment-timezone'
import dal from './usersDAL'
import utils from './usersUtils'
import rocket from '../rocket'
import next from '../next'
import users from '../users'
import usersLevelsHistory from '../usersLevelsHistory'
import achievementsLevel from '../achievementsLevel'
import achievements from '../achievements'
import commandUtils from '../commands/commandsUtils'
import messages from '../messages'
import errors from '../errors'
import interactions from '../interactions'
import rankings from '../rankings'

const file = 'Users | Controller'

const today = moment(new Date())
  .utc()
  .endOf('day')

const findInactivities = async () => {
  const today = new Date()

  const dateRange = today.setDate(
    today.getDate() - config.xprules.inactive.mindays
  )
  return await dal.find(
    {
      rocketId: { $exists: true, $ne: null },
      lastInteraction: { $lt: dateRange },
      score: { $gt: 1 }
    },
    {
      score: -1
    }
  )
}

const receiveProPlan = data => {
  return data.current_plan && data.current_plan.name ? true : false
}

const getProBeginDate = data => {
  return data.current_plan && data.current_plan.begin_at
}

const getProFinishDate = data => {
  return data.current_plan && data.current_plan.finish_at
}

const updatePro = async user => {
  const canBePro = user.level > 2 || (await hasProRole(user))
  const wasPro = user.pro

  if (canBePro) {
    user = await setProPlan(user)
  } else {
    user = await removeProPlan(user)
  }

  if (canBePro !== wasPro) next.sendToQueue(user)

  return user
}

const setProPlan = user => {
  user.pro = true

  if (!user.proBeginAt && !user.proFinishAt) {
    user.proBeginAt = today.format()
    user.proFinishAt = today.add(5, 'years').format()
  } else if (
    user.proFinishAt &&
    moment(user.proFinishAt).isSameOrBefore(today)
  ) {
    user.proFinishAt = today.add(5, 'years').format()
  }

  return dal.save(user)
}

const removeProPlan = user => {
  user.pro = false

  if (user.proBeginAt && user.proFinishAt) {
    user.proFinishAt = today.format()
  }

  return dal.save(user)
}

const hasProRole = async user => {
  if (!user.rocketId) return

  const rocketUser = await rocket.getUserInfo(user.rocketId)
  const proRoles = ['moderator', 'owner', 'ambassador']
  const roles =
    rocketUser &&
    rocketUser.roles &&
    rocketUser.roles.filter(r => proRoles.includes(r))

  return roles.length > 0
}

const updateScore = async (user, score) => {
  if (!user || score === 0) return

  user.previousLevel = user.score === 0 ? 0 : user.level
  user.score += parseInt(score, 10)
  user.level = utils.calculateLevel(user.score)
  await user.save()
  await onChangeLevel(user)
  return user
}

const onChangeLevel = async user => {
  if (user.level !== user.previousLevel) {
    rocket.updateLevelRole(user)
    saveOnNewLevel(user)
    next.sendUserLevelToQueue(user)
  }
  if (user.level > user.previousLevel) messages.sendStorytelling(user)
}

const saveOnNewLevel = async user => {
  await usersLevelsHistory.save(user._id, user.previousLevel, user.level)
  await achievementsLevel.handle(user._id, user.previousLevel, user.level)
}

const isCoreTeam = async rocketId => {
  const user = await dal.findOne({ rocketId: rocketId })
  return user.isCoreTeam || false
}

const sendPoints = async data => {
  const { msg, u } = data

  try {
    const belongsCoreTeam = await isCoreTeam(u._id)
    if (!belongsCoreTeam) {
      return {
        msg: 'Ops! *Não tens acesso* a esta operação!'
      }
    }

    const regex = commandUtils.getCommandsRegex()
    const [, userList, , points, reason] = regex.sendPoints.exec(msg)

    const usernames = userList
      .trim()
      .split(' ')
      .map(username => username.substr(1))

    if (!usernames || !points || !reason) {
      return {
        msg: `Ops! Tem algo *errado* no seu comando. Tente desta forma:
				${'`!darpontos`'} ${'`@nome-usuario`'} ${'`pontos`'} ${'`"motivo"`'}
				Ah! E o motivo deve estar entre aspas!`
      }
    }

    const response = {
      msg: 'Eis o resultado do seu comando: ',
      attachments: []
    }
    for (const username of usernames) {
      if (username === u.username) {
        response.attachments.push({
          text: `Ops! *Não podes* dar pontos para ti mesmo.`
        })
        continue
      }

      const user = await users.findOne({ username })
      if (!user) {
        response.attachments.push({
          text: `Ops! Usuário *${username}* não encontrado.`
        })
        continue
      }

      const updatedScore = await users.updateScore(user, points)
      if (!updatedScore) {
        response.attachments.push({
          text: `Opa, aconteceu algo inesperado. A pontuação de ${username} não foi enviada!`
        })
        continue
      }

      messages.sendToUser(
        {
          msg: `Acabaste de receber *${points} pontos* de reputação por *${reason}*.`
        },
        user.username
      )

      response.attachments.push({
        text: `Sucesso! Enviaste *${points} pontos* de reputação para *${user.name}*!`
      })

      await interactions.saveManual({
        score: points,
        value: 0,
        type: 'manual',
        user: user._id,
        username: user.username,
        text: `você recebeu esses ${points} pontos de ${u.username}`
      })
    }

    return response
  } catch (e) {
    errors._throw(file, 'sendPoints', e)
  }
}

const getUserProfileByUuid = async uuid => {
  if (!uuid) return { error: 'UUID não enviado' }

  const user = await users.findOne({ uuid: uuid })
  if (!user) return { error: 'Usuário não encontrado' }

  const allAchievements = await achievements.findAllByUser(user._id)

  let response = {
    name: user.name,
    avatar: user.avatar || '',
    level: user.level,
    score: user.score,
    userAchievements: [
      {
        name: 'Network',
        achievements: allAchievements
      }
    ]
  }

  if (user.isCoreTeam) {
    response.generalPosition = 'coreTeam'
    response.monthlyPosition = 'coreTeam'
  } else {
    const { monthly, general } = await rankings.calculatePositionByUser(
      user._id
    )
    response.generalPosition = general.position
    response.monthlyPosition = monthly.position
  }

  return response
}

export default {
  findInactivities,
  receiveProPlan,
  getProBeginDate,
  getProFinishDate,
  updatePro,
  updateScore,
  isCoreTeam,
  sendPoints,
  saveOnNewLevel,
  getUserProfileByUuid
}
