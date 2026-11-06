import { describe, expect, it } from 'vitest';
import { createUserSchema } from '../validators/userValidators.js';

describe('User creation validation', () => {
  const baseUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
  };

  it('accepts an admin without a branch', () => {
    const result = createUserSchema.safeParse({
      ...baseUser,
      role: 'ADMIN',
      branch: null,
    });

    expect(result.success).toBe(true);
    expect(result.data.role).toBe('ADMIN');
  });

  it('accepts a seller with a valid branch', () => {
    const result = createUserSchema.safeParse({
      ...baseUser,
      role: 'SELLER',
      branch: '507f1f77bcf86cd799439011',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a seller without a branch', () => {
    const result = createUserSchema.safeParse({
      ...baseUser,
      role: 'SELLER',
      branch: null,
    });

    expect(result.success).toBe(false);
  });

  it('rejects an admin assigned to a branch', () => {
    const result = createUserSchema.safeParse({
      ...baseUser,
      role: 'ADMIN',
      branch: '507f1f77bcf86cd799439011',
    });

    expect(result.success).toBe(false);
  });

  it('keeps seller as the default role for legacy payloads', () => {
    const result = createUserSchema.safeParse({
      ...baseUser,
      branch: '507f1f77bcf86cd799439011',
    });

    expect(result.success).toBe(true);
    expect(result.data.role).toBe('SELLER');
  });
});
