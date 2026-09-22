import express from 'express'
import { redirect } from '../controllers/redirectController'

const router = express.Router()


router.get('/:id', redirect)


export default router