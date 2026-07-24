import express from 'express';
import { getReadings, createReading, updateReading, deleteReading, restoreReading } from '../controllers/readingController.js';

const router = express.Router();

router.get('/', getReadings);
router.post('/', createReading);
router.put('/:id', updateReading);
router.delete('/:id', deleteReading);
router.patch('/:id/restore', restoreReading); // <-- después de declarar router

export default router;