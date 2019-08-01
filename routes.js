import express from 'express'
import achievementsTemporyData from './components/achievementsTemporaryData'
import blog from './components/blog'
import users from './components/users'
import rankings from './components/rankings'
import interactions from './components/interactions'
import miner from './components/miner'
import checkpoints from './components/checkpoints'
import github from './components/github'
import auth from './components/auth'
import middlewares from './middlewares'

const router = express.Router()

router.use('/achievements/temporary/data', achievementsTemporyData.routes)
router.use('/blog', blog.routes)
router.use('/users', users.routes)
router.use('/interactions', interactions.routes)
router.use('/miner', middlewares.miner.auth, miner.routes)
router.use('/checkpoints', checkpoints.routes)
router.use('/integrations/github', github.routes)
router.use('/api/v1/users', middlewares.api.auth, users.routes)
router.use('/api/v1/ranking', middlewares.api.auth, rankings.routes)
router.use('/api/v1/auth', auth.routes)

export default router
