import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import errorMiddleware from './middlewares/errorMiddleware.js';
import notFoundMiddleware from './middlewares/notFoundMiddleware.js';
import env from './config/env.js';
import API_PREFIX from './constants/api.js';
import router from './routes/index.js';

const app = express();
const allowedOrigins = env.CORS_ORIGINS.split(',').map((origin) =>
  origin.trim(),
);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(API_PREFIX, router);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const startServer = async () => {
  try {
    await mongoose.connect(env.DATABASE_URL);

    console.log('Database connected successfully');

    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
