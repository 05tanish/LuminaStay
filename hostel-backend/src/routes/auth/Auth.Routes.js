

import { Router } from 'express'
import { login, logout, getMe } from './auth.controller.js'
import { googleLogin } from '../../controllers/auth/GoogleAuth.Controller.js'
import { protect } from '../../middlewares/auth.middleware.js'

const router = Router()

router.post('/login', login)
router.post('/logout', logout)
router.get('/me', protect, getMe)
router.post('/google', googleLogin)


export default router
