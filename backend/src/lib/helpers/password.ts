import crypto from "node:crypto";

/**
 * ランダムで強力なパスワードを生成
 * - 長さ: 20文字
 * - 文字種: 大文字、小文字、数字、記号
 */
export function generateSecurePassword(): string {
  const length = 20;
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }

  return password;
}
