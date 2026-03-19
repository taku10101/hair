import { z } from "zod";

// UserRole enum
export const UserRoleEnum = z.enum(["ADMIN", "SALARY"]);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const UserSchema = z.object({
  id: z.number().int().positive().openapi({
    example: 1,
    description: "User ID",
  }),
  firebaseUid: z.string().nullable().openapi({
    example: "firebase-uid-xxx",
    description: "Firebase UID",
  }),
  email: z.string().email({ message: "Invalid email address" }).openapi({
    example: "user@example.com",
    description: "User email address",
  }),
  name: z.string().min(1).max(255).openapi({
    example: "John Doe",
    description: "User full name",
  }),
  role: UserRoleEnum.openapi({
    example: "SALARY",
    description: "User role",
  }),
  photoUrl: z.string().nullable().openapi({
    example: "https://example.com/photo.jpg",
    description: "User photo URL",
  }),
  emailVerified: z.boolean().openapi({
    example: false,
    description: "Email verification status",
  }),
  lastSignInMethod: z.string().nullable().openapi({
    example: "email",
    description: "Last sign-in method",
  }),
  createdAt: z.coerce.date().openapi({
    example: "2024-01-01T00:00:00Z",
    description: "Creation timestamp",
  }),
  updatedAt: z.coerce.date().openapi({
    example: "2024-01-01T00:00:00Z",
    description: "Last update timestamp",
  }),
});

/**
 * Schema for creating a new user
 */
export const CreateUserSchema = z.object({
  firebaseUid: z.string().optional().openapi({
    example: "firebase-uid-xxx",
    description: "Firebase UID (optional)",
  }),
  email: z.string().email({ message: "Invalid email address" }).openapi({
    example: "user@example.com",
    description: "User email address",
  }),
  name: z.string().min(1).max(255).openapi({
    example: "John Doe",
    description: "User full name",
  }),
  role: UserRoleEnum.optional().default("SALARY").openapi({
    example: "SALARY",
    description: "User role (optional, defaults to SALARY)",
  }),
  photoUrl: z.string().optional().openapi({
    example: "https://example.com/photo.jpg",
    description: "User photo URL (optional)",
  }),
  emailVerified: z.boolean().optional().openapi({
    example: false,
    description: "Email verification status (optional)",
  }),
  lastSignInMethod: z.string().optional().openapi({
    example: "email",
    description: "Last sign-in method (optional)",
  }),
});

/**
 * Schema for updating a user
 */
export const UpdateUserSchema = z.object({
  firebaseUid: z.string().optional().openapi({
    example: "firebase-uid-xxx",
    description: "Firebase UID",
  }),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .openapi({
      example: "user@example.com",
      description: "User email address",
    })
    .optional(),
  name: z.string().min(1).max(255).optional().openapi({
    example: "John Doe",
    description: "User full name",
  }),
  role: UserRoleEnum.optional().openapi({
    example: "ADMIN",
    description: "User role (optional)",
  }),
  photoUrl: z.string().nullable().optional().openapi({
    example: "https://example.com/photo.jpg",
    description: "User photo URL",
  }),
  emailVerified: z.boolean().optional().openapi({
    example: false,
    description: "Email verification status",
  }),
  lastSignInMethod: z.string().nullable().optional().openapi({
    example: "email",
    description: "Last sign-in method",
  }),
});

// 型エクスポート
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
