import type { User } from "@/schemas/userSchema";

/**
 * ユーザー関連のヘルパー関数
 */

/**
 * メールアドレスが変更可能かどうかを判定
 * @param user ユーザーデータ
 * @param newEmail 新しいメールアドレス
 * @returns 変更可能な場合true
 */
export const canUpdateEmail = (user: User, newEmail: string): boolean => {
  return newEmail !== user.email && isValidEmail(newEmail);
};

/**
 * メールアドレスのバリデーション
 * @param email メールアドレス
 * @returns 有効な場合true
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * ユーザー名が有効かどうかを判定
 * @param user ユーザーデータ
 * @returns 有効な場合true
 */
export const isValidName = (user: User): boolean => {
  return user.name.length > 0 && user.name.length <= 255;
};

/**
 * Prismaのユーザーオブジェクトからユーザー型に変換
 * @param data Prismaから取得したユーザーデータ
 * @returns User型
 */
export const fromPrisma = (data: {
  id: number;
  firebaseUid: string | null;
  email: string;
  name: string;
  role: "ADMIN" | "SALARY";
  photoUrl: string | null;
  emailVerified: boolean;
  lastSignInMethod: string | null;
  createdAt: Date;
  updatedAt: Date;
}): User => {
  return {
    id: data.id,
    firebaseUid: data.firebaseUid,
    email: data.email,
    name: data.name,
    role: data.role,
    photoUrl: data.photoUrl,
    emailVerified: data.emailVerified,
    lastSignInMethod: data.lastSignInMethod,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

/**
 * ユーザーをJSON形式に変換
 * @param user ユーザーデータ
 * @returns プレーンオブジェクト
 */
export const toJSON = (user: User) => {
  return {
    id: user.id,
    firebaseUid: user.firebaseUid,
    email: user.email,
    name: user.name,
    photoUrl: user.photoUrl,
    emailVerified: user.emailVerified,
    lastSignInMethod: user.lastSignInMethod,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
