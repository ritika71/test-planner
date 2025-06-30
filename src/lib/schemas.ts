import { z } from 'zod';

export const signFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  uniqueId: z.string().min(1, { message: 'Unique ID is required.' }),
  signature: z.string().min(1, { message: 'A signature is required. Please draw your signature in the box.' }),
}).refine((data) => data.email === data.uniqueId, {
  message: "Email and Unique ID must match.",
  path: ["uniqueId"], // Display the error under the Unique ID field for better UX
});

export type SignFormValues = z.infer<typeof signFormSchema>;
