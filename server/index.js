import dotenv from 'dotenv';
dotenv.config();

import './config/firebase-admin.js'; // Initialize Firebase FIRST
import express from 'express';
import cors from 'cors';
import { existsSync } from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import chatRouter from './routes/chat.js';
import aiRouter from './routes/aiRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';
import { initializeSocket } from './services/socketService.js';

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...String(process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  },
  credentials: true,
}));
app.use(express.json());
const httpServer = http.createServer(app);
initializeSocket(httpServer);

const PORT = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');
const indexHtmlPath = path.join(distPath, 'index.html');

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.use('/api/chat', chatRouter);
app.use('/api/ai', aiRouter);
app.use('/api/notifications', notificationRouter);

if (existsSync(indexHtmlPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(indexHtmlPath);
  });
}

app.use((error, _req, res, _next) => {
  console.error('Unhandled server error:', error);
  res.status(500).json({ error: 'Unexpected server error.' });
});

httpServer.listen(PORT, () => {
  console.log(`ReliefSync backend listening on port ${PORT}`);
});
