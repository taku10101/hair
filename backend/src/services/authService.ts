import { getAuth } from "@/lib/auth/firebase";
import { generateSecurePassword } from "@/lib/helpers/password";
import type { UserRepository } from "@/repositories/userRepository";
import type {
  ChangePasswordInput,
  InviteUserInput,
  SignupInput,
  UpdateProfileInput,
} from "@/schemas/authSchema";
import type { User } from "@/schemas/userSchema";

/**
 * Error classes
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * Authentication service factory
 * Handles user creation and Firebase UID synchronization
 */
export const createAuthService = (userRepository: UserRepository) => {
  return {
    /**
     * Create a new user with Firebase UID
     */
    async createUser(data: SignupInput, firebaseUid: string): Promise<User> {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ValidationError("Email already exists");
      }

      const existingFirebaseUser = await userRepository.findByFirebaseUid(firebaseUid);
      if (existingFirebaseUser) {
        throw new ValidationError("Firebase UID already registered");
      }

      return await userRepository.create({
        email: data.email,
        name: data.name,
        role: "SALARY",
        firebaseUid,
        emailVerified: false,
        lastSignInMethod: "email",
      });
    },

    /**
     * Get or create user by Firebase UID
     * Used for login flow
     */
    async getOrCreateUserByFirebaseUid(
      firebaseUid: string,
      email: string,
      name?: string,
      emailVerified?: boolean
    ): Promise<User> {
      let user = await userRepository.findByFirebaseUid(firebaseUid);

      if (!user) {
        user = await userRepository.findByEmail(email);

        if (user) {
          if (user.firebaseUid && user.firebaseUid !== firebaseUid) {
            throw new ValidationError("Email is already associated with a different account");
          }

          user = await userRepository.update(user.id, {
            firebaseUid,
            lastSignInMethod: "email",
            ...(emailVerified !== undefined && { emailVerified }),
          });
        } else {
          user = await userRepository.create({
            email,
            name: name || email.split("@")[0],
            role: "SALARY",
            firebaseUid,
            emailVerified: emailVerified ?? false,
            lastSignInMethod: "email",
          });
        }
      } else {
        user = await userRepository.update(user.id, {
          lastSignInMethod: "email",
          ...(emailVerified !== undefined && { emailVerified }),
        });
      }

      return user;
    },

    /**
     * Get user by Firebase UID
     */
    async getUserByFirebaseUid(firebaseUid: string): Promise<User> {
      const user = await userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      return user;
    },

    /**
     * Sync user from Firebase authentication
     * Used for new signup flow where Firebase user is created first
     */
    async syncUserFromFirebase(
      firebaseUid: string,
      email: string,
      name?: string,
      emailVerified?: boolean
    ): Promise<User> {
      // Validate firebaseUid
      if (!firebaseUid || firebaseUid.trim() === "") {
        throw new ValidationError("Firebase UIDは必須です");
      }

      // Use existing method to get or create user
      return await this.getOrCreateUserByFirebaseUid(firebaseUid, email, name, emailVerified);
    },

    /**
     * Update user's last sign-in method
     */
    async updateSignInMethod(firebaseUid: string, method: string): Promise<User> {
      const user = await userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      return await userRepository.update(user.id, {
        lastSignInMethod: method,
      });
    },

    /**
     * 管理者がユーザーを招待（Firebase作成 + DB登録）
     */
    async inviteUser(data: InviteUserInput): Promise<{
      user: User;
    }> {
      // 1. メール重複チェック
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ValidationError("Email already exists");
      }

      // 2. Firebase ユーザー作成（管理者指定のパスワードを使用）
      const auth = getAuth();
      const userRecord = await auth.createUser({
        email: data.email,
        password: data.password,
        displayName: data.name,
        emailVerified: false,
      });

      // 3. DB にユーザー登録
      const user = await userRepository.create({
        email: data.email,
        name: data.name,
        role: data.role || "SALARY",
        firebaseUid: userRecord.uid,
        emailVerified: false,
      });

      return { user };
    },

    /**
     * Update user profile
     */
    async updateProfile(firebaseUid: string, data: UpdateProfileInput): Promise<User> {
      const user = await userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Update Firebase user profile if display name is being changed
      if (data.name) {
        const auth = getAuth();
        await auth.updateUser(firebaseUid, {
          displayName: data.name,
        });
      }

      // Update database
      return await userRepository.update(user.id, {
        ...(data.name && { name: data.name }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
      });
    },

    /**
     * Change user password
     */
    async changePassword(firebaseUid: string, data: ChangePasswordInput): Promise<void> {
      const user = await userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Verify current password by attempting to sign in
      const auth = getAuth();
      try {
        // Firebase Admin SDK doesn't have a direct way to verify password
        // The client should verify the current password before calling this endpoint
        // Here we just update to the new password
        await auth.updateUser(firebaseUid, {
          password: data.newPassword,
        });
      } catch (_error) {
        throw new ValidationError("Failed to update password");
      }
    },
  };
};

export type AuthService = ReturnType<typeof createAuthService>;
