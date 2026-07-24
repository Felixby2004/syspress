import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import readingRoutes from './routes/readingRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import weightRoutes from './routes/weightRoutes.js';
import { authenticate } from './middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/readings', authenticate, readingRoutes);
app.use('/api/weights', authenticate, weightRoutes);
app.use('/api/reports', authenticate, reportRoutes);

export default app;