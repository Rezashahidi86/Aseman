import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import Branch from '../models/Branch.js';
import User from '../models/User.js';
import AppSettings from '../models/AppSettings.js';
import ROLES from '../constants/roles.js';

describe('Branch model', () => {
  it('should reject a branch without required fields', async () => {
    const branch = new Branch({});

    await expect(branch.validate()).rejects.toThrow();
  });

  it('should define a unique index for code', () => {
    const index = Branch.schema.indexes().find(([fields, options]) => {
      return fields.code === 1 && options.unique === true;
    });

    expect(index).toBeDefined();
  });
});

describe('User model', () => {
  it('should reject a user without required fields', async () => {
    const user = new User({});

    await expect(user.validate()).rejects.toThrow();
  });

  it('should accept only defined roles', async () => {
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      role: 'INVALID_ROLE',
    });

    await expect(user.validate()).rejects.toThrow();
  });

  it('should hide passwordHash by default', () => {
    expect(User.schema.path('passwordHash').options.select).toBe(false);
  });

  it('should define a unique index for email', () => {
    const index = User.schema.indexes().find(([fields, options]) => {
      return fields.email === 1 && options.unique === true;
    });

    expect(index).toBeDefined();
  });

  it('should use the configured role constants', () => {
    expect(User.schema.path('role').enumValues).toEqual(Object.values(ROLES));
  });

  it('should reference the Branch model', () => {
    expect(User.schema.path('branch').options.ref).toBe('Branch');
    expect(User.schema.path('branch').instance).toBe('ObjectId');
  });
});

describe('AppSettings model', () => {
  it('should apply the default low-stock threshold', () => {
    const settings = new AppSettings();

    expect(settings.lowStockThreshold).toBe(10);
  });

  it('should reject a negative low-stock threshold', async () => {
    const settings = new AppSettings({
      lowStockThreshold: -1,
    });

    await expect(settings.validate()).rejects.toThrow();
  });
});
