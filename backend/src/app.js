import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import config from './config.js';
import basicAuth from './middleware/auth.js';
import taskRoutes from './routes/taskRoutes.js';
import logRoutes from './routes/logRoutes.js';

const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Public, unauthenticated: used by Docker/compose healthchecks.
  app.get('/health', (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.status(dbConnected ? 200 : 503).json({
      status: dbConnected ? 'ok' : 'degraded',
      db: dbConnected ? 'connected' : 'disconnected',
      uptime: Math.round(process.uptime())
    });
  });

  app.use('/api', basicAuth);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/logs', logRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
    console.error('Server error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? err.message : undefined
    });
  });

  return app;
};

export default createApp;
