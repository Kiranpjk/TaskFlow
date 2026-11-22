import mongoose from 'mongoose';
import config from './config.js';
import connectDB from './models/database.js';
import createApp from './app.js';

await connectDB();

const server = createApp().listen(config.port, () => {
  console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
});

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
