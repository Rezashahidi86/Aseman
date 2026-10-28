import { z } from 'zod';

const customerSmsSettingsSchema = z
  .object({
    welcomeMessage: z.string().trim().max(1000),
  })
  .strict();

const sendCustomerSmsSchema = z
  .object({
    message: z.string().trim().min(1).max(1000),
  })
  .strict();

export { customerSmsSettingsSchema, sendCustomerSmsSchema };
