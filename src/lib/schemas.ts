import { z } from 'zod';

export const signFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  signature: z.string().min(1, { message: 'A signature is required. Please draw or upload your signature.' }),
});

export type SignFormValues = z.infer<typeof signFormSchema>;

export const adminLoginSchema = z.object({
  password: z.string().min(1, { message: 'Password is required.' }),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
