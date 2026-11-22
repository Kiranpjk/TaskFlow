import 'dotenv/config';

const toInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
};

// All runtime configuration comes from environment variables.
// Defaults are for local development only; override them in production.
const config = {
  nodeEnv: process.env.NODE_ENV || 'production',
  port: toInt(process.env.PORT, 5000),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager',
  authUsername: process.env.AUTH_USERNAME || 'admin',
  authPassword: process.env.AUTH_PASSWORD || 'password123',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

export default config;
