import dotenv from 'dotenv';
import { z } from 'zod';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(currentDirectory, '../../.env') });

const isTestEnvironment = process.env.NODE_ENV === 'test';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: isTestEnvironment
    ? z.string().min(1).default('mongodb://127.0.0.1:27017/aseman-test')
    : z.string().min(1, 'DATABASE_URL is required'),
  CORS_ORIGINS: isTestEnvironment
    ? z.string().min(1).default('http://localhost:5173')
    : z.string().min(1, 'CORS_ORIGINS is required'),
  JWT_SECRET: isTestEnvironment
    ? z.string().min(32).default('aseman-test-only-secret-not-for-production-123456')
    : z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  SMS_API_KEY: z.string().optional(),
  SMS_SENDER: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment variables:');
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

const env = result.data;

export default env;
