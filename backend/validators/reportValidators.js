import { z } from 'zod';

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, 'Invalid calendar date');

const reportRangeSchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .strict()
  .refine(({ startDate, endDate }) => startDate <= endDate, {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  });

const dailyReportSchema = z
  .object({
    date: dateSchema.optional(),
  })
  .strict();

const weeklyReportSchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .strict()
  .refine(({ startDate, endDate }) => {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T00:00:00.000Z`);
    const days = (end.getTime() - start.getTime()) / 86400000;

    return days === 6;
  }, {
    message: 'A weekly report must cover exactly seven days',
    path: ['endDate'],
  });

const monthlyReportSchema = z
  .object({
    month: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must use YYYY-MM format'),
  })
  .strict();

export {
  reportRangeSchema,
  dailyReportSchema,
  weeklyReportSchema,
  monthlyReportSchema,
};