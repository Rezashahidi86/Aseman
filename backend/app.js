import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import AppError from './utils/AppError.js';
import env from './config/env.js';
import API_PREFIX from './constants/api.js';
import router from './routes/index.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import notFoundMiddleware from './middlewares/notFoundMiddleware.js';

const app = express();
const allowedOrigins = env.CORS_ORIGINS.split(',').map((origin) =>
  origin.trim(),
);

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new AppError('Origin is not allowed by CORS', 403));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(API_PREFIX, router);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
