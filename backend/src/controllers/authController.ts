import type { Context } from "hono";
import { getAuth } from "@/lib/auth/firebase";
import type {
  ChangePasswordInput,
  InviteUserInput,
  SignupInput,
  SyncUserInput,
  UpdateProfileInput,
} from "@/schemas/authSchema";
import type { AuthService } from "@/services/authService";

/**
 * Authentication controller factory
 */
export const createAuthController = (authService: AuthService) => {
  return {
    /**
     * Signup endpoint
     * Creates Firebase user and syncs with database
     */
    async signup(c: Context) {
      try {
        const body = (await c.req.json()) as SignupInput;
        const { email, password, name } = body;

        const auth = getAuth();
        const userRecord = await auth.createUser({
          email,
          password,
          displayName: name,
        });

        const user = await authService.createUser(body, userRecord.uid);

        return c.json(
          {
            user: {
              id: user.id,
              firebaseUid: user.firebaseUid,
              email: user.email,
              name: user.name,
              role: user.role,
              photoUrl: user.photoUrl,
              emailVerified: user.emailVerified,
              lastSignInMethod: user.lastSignInMethod,
              createdAt: user.createdAt.toISOString(),
              updatedAt: user.updatedAt.toISOString(),
            },
          },
          201
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes("already exists")) {
            return c.json({ error: "Email already exists" }, 400);
          }
          return c.json({ error: error.message }, 400);
        }
        return c.json({ error: "Internal server error" }, 500);
      }
    },

    /**
     * Login endpoint
     * Note: Actual authentication is done on the client side with Firebase SDK
     * This endpoint just ensures the user exists in the database
     */
    async login(c: Context) {
      try {
        return c.json(
          {
            message: "Login successful. Use Firebase SDK on client to authenticate.",
          },
          200
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          return c.json({ error: error.message }, 400);
        }
        return c.json({ error: "Internal server error" }, 500);
      }
    },

    /**
     * Sync user endpoint
     * Syncs Firebase authenticated user with database
     * Requires authentication
     */
    async syncUser(c: Context) {
      try {
        const decodedToken = c.get("user");

        if (!decodedToken?.uid) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const body = (await c.req.json()) as SyncUserInput;
        const { name } = body;

        const user = await authService.syncUserFromFirebase(
          decodedToken.uid,
          decodedToken.email || "",
          name,
          decodedToken.email_verified
        );

        return c.json(
          {
            user: {
              id: user.id,
              firebaseUid: user.firebaseUid,
              email: user.email,
              name: user.name,
              role: user.role,
              photoUrl: user.photoUrl,
              emailVerified: user.emailVerified,
              lastSignInMethod: user.lastSignInMethod,
              createdAt: user.createdAt.toISOString(),
              updatedAt: user.updatedAt.toISOString(),
            },
          },
          201
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          return c.json({ error: error.message }, 400);
        }
        return c.json({ error: "Internal server error" }, 500);
      }
    },

    /**
     * Get current user endpoint
     * Requires authentication
     */
    async me(c: Context) {
      try {
        const decodedToken = c.get("user");

        if (!decodedToken?.uid) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const user = await authService.getOrCreateUserByFirebaseUid(
          decodedToken.uid,
          decodedToken.email || "",
          decodedToken.name,
          decodedToken.email_verified
        );

        return c.json(
          {
            user: {
              id: user.id,
              firebaseUid: user.firebaseUid,
              email: user.email,
              name: user.name,
              role: user.role,
              photoUrl: user.photoUrl,
              emailVerified: user.emailVerified,
              lastSignInMethod: user.lastSignInMethod,
              createdAt: user.createdAt.toISOString(),
              updatedAt: user.updatedAt.toISOString(),
            },
          },
          200
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          return c.json({ error: error.message }, 400);
        }
        return c.json({ error: "Internal server error" }, 500);
      }
    },

    /**
     * 管理者によるユーザー招待エンドポイント
     */
    async inviteUser(c: Context) {
      try {
        const body = (await c.req.json()) as InviteUserInput;

        const result = await authService.inviteUser(body);

        return c.json(
          {
            user: {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
              role: result.user.role,
              emailVerified: result.user.emailVerified,
            },
            message: "User invited successfully.",
          },
          201
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes("already exists")) {
            return c.json({ error: "Email already exists" }, 400);
          }
          return c.json({ error: error.message }, 400);
        }
        return c.json({ error: "Internal server error" }, 500);
      }
    },

    /**
     * Update profile endpoint
     * Requires authentication
     */
    async updateProfile(c: Context) {
      try {
        const decodedToken = c.get("user");

        if (!decodedToken?.uid) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const body = (await c.req.json()) as UpdateProfileInput;
        const user = await authService.updateProfile(decodedToken.uid, body);

        return c.json(
          {
            user: {
              id: user.id,
              firebaseUid: user.firebaseUid,
              email: user.email,
              name: user.name,
              role: user.role,
              photoUrl: user.photoUrl,
              emailVerified: user.emailVerified,
              lastSignInMethod: user.lastSignInMethod,
              createdAt: user.createdAt.toISOString(),
              updatedAt: user.updatedAt.toISOString(),
            },
          },
          200
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          return c.json({ error: error.message }, 400);
        }
        return c.json({ error: "Internal server error" }, 500);
      }
    },

    /**
     * Change password endpoint
     * Requires authentication
     */
    async changePassword(c: Context) {
      try {
        const decodedToken = c.get("user");

        if (!decodedToken?.uid) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const body = (await c.req.json()) as ChangePasswordInput;
        await authService.changePassword(decodedToken.uid, body);

        return c.json(
          {
            message: "Password changed successfully",
          },
          200
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          return c.json({ error: error.message }, 400);
        }
        return c.json({ error: "Internal server error" }, 500);
      }
    },
  };
};

export type AuthController = ReturnType<typeof createAuthController>;
