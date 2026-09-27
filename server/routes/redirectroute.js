import express from 'express'
import { redirect } from '../controllers/redirectController.js'
import { protect } from '../middleware/protect.js'

const router = express.Router()


router.get('/:id', redirect)


export default router