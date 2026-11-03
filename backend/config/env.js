import dotenv from 'dotenv';
import { z } from 'zod';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(currentDirectory, '../../.env') });
const isTestEnvironment = process.env.NODE_ENV === 'test';

const jwtExpiresInSchema = z.string().regex(/^\d+[smhd]$/).refine((value) => {
  const [, amount, unit] = value.match(/^(\d+)([smhd])$/);
  const secondsPerUnit = { s: 1, m: 60, h: 3600, d: 86400 };
  const seconds = Number(amount) * secondsPerUnit[unit];
  return Number.isSafeInteger(seconds) && seconds >= 60 && seconds <= 604800;
}, 'JWT_EXPIRES_IN must be between 1 minute and 7 days');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: isTestEnvironment ? z.string().min(1).default('mongodb://127.0.0.1:27017/aseman-test') : z.string().min(1, 'DATABASE_URL is required'),
  CORS_ORIGINS: isTestEnvironment ? z.string().min(1).default('http://localhost:5173') : z.string().min(1, 'CORS_ORIGINS is required'),
  JWT_SECRET: isTestEnvironment ? z.string().min(32).default('aseman-test-only-secret-not-for-production-123456') : z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: jwtExpiresInSchema.default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  SMS_API_KEY: z.string().optional(),
  SMS_SENDER: z.string().optional(),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error('Invalid environment variables:');
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}
export default result.data;
