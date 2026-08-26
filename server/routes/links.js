import express from 'express';
import { createLink } from "../controllers/linkController";

const router  = express.Router()

router.post('/createLink',createLink)


export default router