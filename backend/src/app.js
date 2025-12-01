import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { sessionConfig } from './config/session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS debe configurarse para permitir credenciales
app.use(cors({
  origin: 'http://localhost:5173', // URL del frontend
  credentials: true
}));

app.use(express.json());

// Configurar sesiones
app.use(session(sessionConfig));

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', router);

app.use(errorHandler);

export default app;
