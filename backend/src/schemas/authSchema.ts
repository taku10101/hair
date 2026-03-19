import { z } from "zod";
import { UserRoleEnum } from "@/schemas/userSchema";

/**
 * Signup request schema
 */
export const SignupSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  name: z.string().min(1, { message: "Name is required" }),
});

/**
 * Login request schema
 */
export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" }),
});

/**
 * Sync user request schema
 * Used for syncing Firebase authenticated users with database
 */
export const SyncUserSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

/**
 * User response schema
 */
export const UserResponseSchema = z.object({
  id: z.number(),
  firebaseUid: z.string().nullable(),
  email: z.string(),
  name: z.string(),
  photoUrl: z.string().nullable(),
  emailVerified: z.boolean(),
  lastSignInMethod: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Auth response schema
 */
export const AuthResponseSchema = z.object({
  user: UserResponseSchema,
  message: z.string().optional(),
});

/**
 * Invite user request schema
 */
export const InviteUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  name: z.string().min(1, { message: "Name is required" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  role: UserRoleEnum.optional().default("SALARY"),
});

/**
 * Update profile request schema
 */
export const UpdateProfileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  photoUrl: z.string().url({ message: "Invalid URL format" }).nullable().optional(),
});

/**
 * Change password request schema
 */
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters" }),
});

/**
 * Type definitions
 */
export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type SyncUserInput = z.infer<typeof SyncUserSchema>;
export type InviteUserInput = z.infer<typeof InviteUserSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
