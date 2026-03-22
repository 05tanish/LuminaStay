import { Router } from 'express'
import { login, logout } from './Auth.Controller.js'
import { googleLogin } from './GoogleAuth.Controller.js'


const router = Router()

router.post('/login', login)
router.post('/logout', logout)
router.post('/google', googleLogin)


export default router
