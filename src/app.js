import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import  apiRouter  from './routes/api.routes.js'

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Inyectamos prisma en el request para usarlo en cualquier ruta/controlador
app.use((req, res, next) => {
  req.db = prisma;
  next();
});

app.use('/api', apiRouter);

// Ruta de prueba para verificar que el backend funciona
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'WalTech API' });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

export { app, prisma };
