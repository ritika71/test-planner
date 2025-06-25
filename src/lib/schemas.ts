import { z } from 'zod';

export const signFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  uniqueId: z.string().min(1, { message: 'Unique ID is required.' }),
  signature: z.string().optional(),
});

export type SignFormValues = z.infer<typeof signFormSchema>;

export const adminLoginSchema = z.object({
  password: z.string().min(1, { message: 'Password is required.' }),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
