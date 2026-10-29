import mongoose from 'mongoose';
import app from './app.js';
import env from './config/env.js';

const startServer = async () => {
  try {
    await mongoose.connect(env.DATABASE_URL);

    const server = app.listen(env.PORT, () => {
      if (env.NODE_ENV !== 'test') {
        console.info(`Aseman API listening on port ${env.PORT}`);
      }
    });

    const shutdown = (signal) => {
      console.info(`${signal} received. Shutting down gracefully.`);

      server.close(async (error) => {
        if (error) {
          console.error('Failed to close HTTP server:', error.message);
          process.exitCode = 1;
        }

        try {
          await mongoose.disconnect();
        } catch (disconnectError) {
          console.error('Failed to disconnect from MongoDB:', disconnectError.message);
          process.exitCode = 1;
        }
      });
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exitCode = 1;
  }
};

if (env.NODE_ENV !== 'test') {
  startServer();
}

export { startServer };
