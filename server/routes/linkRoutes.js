import express from 'express';
import { createLink, updateLink, deleteLink, getLinks } from "../controllers/linkController.js";
import { protect } from '../middleware/protect.js';

const router = express.Router()
router.get('/', protect, getLinks)
router.post('/', protect, createLink)
router.put('/:id', protect, updateLink)
router.delete('/:id', protect, deleteLink)



export default router