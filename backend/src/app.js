import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import readingRoutes from './routes/readingRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import weightRoutes from './routes/weightRoutes.js';
import { authenticate } from './middleware/auth.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Configuración CORS
const allowedOrigins = [
  process.env.FRONTEND_URL, // URL del frontend en producción
  'http://localhost:5173', // desarrollo local
  'http://localhost:3000', // si usas otro puerto
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`Origen bloqueado por CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/readings', authenticate, readingRoutes);
app.use('/api/reports', authenticate, reportRoutes);
app.use('/api/weights', authenticate, weightRoutes);

// Ruta de prueba (para verificar que el servidor está activo)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', environment: process.env.NODE_ENV });
});

export default app;