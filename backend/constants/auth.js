import env from '../config/env.js';

export const AUTH_COOKIE_NAME = 'aseman_access_token';

const [, amount, unit] = env.JWT_EXPIRES_IN.match(/^(\d+)([smhd])$/);
const secondsPerUnit = { s: 1, m: 60, h: 3600, d: 86400 };
const tokenLifetimeMs = Number(amount) * secondsPerUnit[unit] * 1000;

export const authCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/v1',
  maxAge: tokenLifetimeMs,
};
