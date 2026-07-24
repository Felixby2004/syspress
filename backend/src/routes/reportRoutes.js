import express from 'express';
import { getReport, generateReportPDF } from '../controllers/reportController.js';

const router = express.Router();

router.get('/', getReport);
router.get('/pdf', generateReportPDF);

export default router;