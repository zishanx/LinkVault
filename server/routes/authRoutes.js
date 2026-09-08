import express from 'express'
import { register, login, verifyAuth } from "../controllers/authController.js"
import { protect } from '../middleware/protect.js'

const router = express.Router()

router.post('/register', register)

router.post('/login', login)

router.get('/verify',protect, verifyAuth)


export default router