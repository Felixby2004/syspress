import express from 'express';
import { getWeights, createWeight, updateWeight, deleteWeight } from '../controllers/weightController.js';

const router = express.Router();

router.get('/', getWeights);
router.post('/', createWeight);
router.put('/:id', updateWeight);
router.delete('/:id', deleteWeight);

export default router;