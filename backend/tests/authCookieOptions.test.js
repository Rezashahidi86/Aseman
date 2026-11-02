import { describe, expect, it } from 'vitest';
import env from '../config/env.js';
import { authCookieOptions } from '../constants/auth.js';

describe('Authentication cookie lifetime', () => {
  it('matches the configured JWT lifetime', () => {
    const [, amount, unit] = env.JWT_EXPIRES_IN.match(/^(\d+)([smhd])$/);
    const secondsPerUnit = { s: 1, m: 60, h: 3600, d: 86400 };
    const expectedLifetime = Number(amount) * secondsPerUnit[unit] * 1000;

    expect(authCookieOptions.maxAge).toBe(expectedLifetime);
  });
});
