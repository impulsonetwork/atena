import { Router } from 'express'

import RankingController from '../controllers/RankingController'
import apiRoutes from './api'

const router = new Router()

router.use('/api/v1', apiRoutes)

router.get('/createRanking', async (request, response) => {
  const ranking = await RankingController.createMonthlyRanking()

  return response.json({ ranking: ranking[0], total: ranking.length })
})

export default router
