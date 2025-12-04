import { z } from 'zod';

/**
 * Validation schema for updating user profile information
 */
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .trim(),
  lastName: z
    .string()
    .max(50, 'Last name must be less than 50 characters')
    .trim()
    .optional()
    .nullable(),
});

/**
 * Validation schema for account deletion confirmation
 */
export const deleteAccountSchema = z.object({
  confirmationText: z
    .string()
    .refine((val) => val === 'DELETE', {
      message: 'You must type DELETE to confirm account deletion',
    }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
