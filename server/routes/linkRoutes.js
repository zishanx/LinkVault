import express from 'express';
import { createLink } from "../controllers/linkController.js";
import { protect } from '../middleware/protect.js';

const router  = express.Router()

router.post('/createLink',protect,createLink)


export default router