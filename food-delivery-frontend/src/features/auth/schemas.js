import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    password_confirmation: z.string().min(8, 'Password confirmation is required.'),
  })
  .refine((value) => value.password === value.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Passwords do not match.',
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});
