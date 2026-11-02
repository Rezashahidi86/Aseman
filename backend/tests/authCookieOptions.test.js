import { describe, expect, it } from 'vitest';
import { authCookieOptions } from '../constants/auth.js';

describe('Authentication cookie lifetime', () => {
  it('matches the configured JWT lifetime', () => {
    expect(authCookieOptions.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
