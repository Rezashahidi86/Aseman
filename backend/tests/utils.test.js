import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import pagination from '../utils/pagination.js';
import formatZodError from '../utils/formatZodError.js';
import validateMongoId from '../utils/validateMongoId.js';
import {
  getTehranDateKey,
  getTehranMonthKey,
  shiftDateKey,
  getTehranDateRange,
} from '../utils/dateKeys.js';

describe('Pagination helper', () => {
  it('should use default values for invalid inputs', () => {
    expect(pagination('invalid', 'invalid')).toEqual({
      page: 1,
      limit: 10,
      skip: 0,
    });
  });

  it('should calculate skip correctly', () => {
    expect(pagination('3', '20')).toEqual({
      page: 3,
      limit: 20,
      skip: 40,
    });
  });

  it('should limit maximum page size to 100', () => {
    expect(pagination('1', '500').limit).toBe(100);
  });
});

describe('Zod error formatter', () => {
  it('should return field names and readable messages', () => {
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
    });

    const result = schema.safeParse({ name: '' });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(formatZodError(result.error)).toEqual([
        {
          field: 'name',
          message: 'Name is required',
        },
      ]);
    }
  });
});

describe('MongoDB ID validator', () => {
  it('should reject invalid IDs with status code 400', () => {
    expect(() => validateMongoId('invalid-id')).toThrow('Invalid MongoDB ID');

    try {
      validateMongoId('invalid-id');
    } catch (error) {
      expect(error.statusCode).toBe(400);
    }
  });
});


describe('Tehran date helpers', () => {
  it('should derive the business date using Tehran time near midnight', () => {
    const date = new Date('2026-10-29T21:00:00.000Z');

    expect(getTehranDateKey(date)).toBe('2026-10-30');
    expect(getTehranMonthKey(date)).toBe('2026-10');
  });

  it('should shift dates across month and year boundaries', () => {
    expect(shiftDateKey('2026-03-01', -1)).toBe('2026-02-28');
    expect(shiftDateKey('2027-01-01', -1)).toBe('2026-12-31');
    expect(shiftDateKey('2026-10-31', 1)).toBe('2026-11-01');
  });

  it('should convert full Tehran calendar days to UTC instants', () => {
    const range = getTehranDateRange('2026-01-31', '2026-02-01');

    expect(range.start.toISOString()).toBe('2026-01-30T20:30:00.000Z');
    expect(range.end.toISOString()).toBe('2026-02-01T20:29:59.999Z');
  });
});
