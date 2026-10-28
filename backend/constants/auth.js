import env from '../config/env.js';

export const AUTH_COOKIE_NAME = 'aseman_access_token';

export const authCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/v1',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
