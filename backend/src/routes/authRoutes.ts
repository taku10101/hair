import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AuthController } from "@/controllers/authController";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { requireAdmin } from "@/middlewares/roleMiddleware";
import {
  ChangePasswordSchema,
  InviteUserSchema,
  LoginSchema,
  SignupSchema,
  SyncUserSchema,
  UpdateProfileSchema,
  UserResponseSchema,
} from "@/schemas/authSchema";
import { UserRoleEnum } from "@/schemas/userSchema";

/**
 * Signup route definition
 */
const signupRoute = createRoute({
  method: "post",
  path: "/signup",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignupSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: z.object({
            user: UserResponseSchema,
          }),
        },
      },
      description: "User created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Bad request",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Internal server error",
    },
  },
  tags: ["Authentication"],
});

/**
 * Login route definition
 */
const loginRoute = createRoute({
  method: "post",
  path: "/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: "Login information received",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Bad request",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Internal server error",
    },
  },
  tags: ["Authentication"],
});

/**
 * Sync user route definition
 * Syncs Firebase authenticated user with database
 */
const syncUserRoute = createRoute({
  method: "post",
  path: "/sync",
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SyncUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: z.object({
            user: UserResponseSchema,
          }),
        },
      },
      description: "User synced successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Bad request",
    },
    401: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Unauthorized",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Internal server error",
    },
  },
  tags: ["Authentication"],
});

/**
 * Get current user route definition
 */
const meRoute = createRoute({
  method: "get",
  path: "/me",
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            user: UserResponseSchema,
          }),
        },
      },
      description: "Current user retrieved successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Bad request",
    },
    401: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Unauthorized",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Internal server error",
    },
  },
  tags: ["Authentication"],
});

/**
 * Invite user route definition
 */
const inviteUserRoute = createRoute({
  method: "post",
  path: "/invite",
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: InviteUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: z.object({
            user: z.object({
              id: z.number(),
              email: z.string(),
              name: z.string(),
              role: UserRoleEnum,
              emailVerified: z.boolean(),
            }),
            message: z.string(),
          }),
        },
      },
      description: "User invited successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Bad request",
    },
    401: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Unauthorized",
    },
    403: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Forbidden - Admin role required",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Internal server error",
    },
  },
  tags: ["Authentication"],
});

/**
 * Update profile route definition
 */
const updateProfileRoute = createRoute({
  method: "patch",
  path: "/profile",
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateProfileSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            user: UserResponseSchema,
          }),
        },
      },
      description: "Profile updated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Bad request",
    },
    401: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Unauthorized",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Internal server error",
    },
  },
  tags: ["Authentication"],
});

/**
 * Change password route definition
 */
const changePasswordRoute = createRoute({
  method: "post",
  path: "/change-password",
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChangePasswordSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: "Password changed successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Bad request",
    },
    401: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Unauthorized",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Internal server error",
    },
  },
  tags: ["Authentication"],
});

/**
 * Create authentication routes
 */
export const createAuthRoutes = (controller: AuthController) => {
  const app = new OpenAPIHono();

  app.openapi(signupRoute, controller.signup);
  app.openapi(loginRoute, controller.login);

  app.use("/sync", authMiddleware);
  app.openapi(syncUserRoute, controller.syncUser);

  app.use("/me", authMiddleware);
  app.openapi(meRoute, controller.me);

  // 新規追加: 招待エンドポイント（認証 + 管理者権限必要）
  app.use("/invite", authMiddleware);
  app.use("/invite", requireAdmin);
  app.openapi(inviteUserRoute, controller.inviteUser);

  // プロフィール更新エンドポイント（認証必要）
  app.use("/profile", authMiddleware);
  app.openapi(updateProfileRoute, controller.updateProfile);

  // パスワード変更エンドポイント（認証必要）
  app.use("/change-password", authMiddleware);
  app.openapi(changePasswordRoute, controller.changePassword);

  return app;
};
