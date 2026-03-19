/**
 * Firebase認証エラーを日本語メッセージに変換するユーティリティ
 */
export const getAuthErrorMessage = (
  err: unknown
): { field?: "email" | "password" | "root"; message: string } => {
  if (err && typeof err === "object" && "code" in err) {
    const firebaseError = err as { code: string; message: string };

    switch (firebaseError.code) {
      // ログインエラー
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return {
          field: "root",
          message: "メールアドレスまたはパスワードが正しくありません",
        };

      case "auth/invalid-email":
        return {
          field: "email",
          message: "メールアドレスの形式が正しくありません",
        };

      case "auth/user-disabled":
        return {
          field: "root",
          message: "このアカウントは無効化されています",
        };

      case "auth/too-many-requests":
        return {
          field: "root",
          message: "ログイン試行回数が多すぎます。しばらく待ってから再度お試しください。",
        };

      // サインアップエラー
      case "auth/email-already-in-use":
        return {
          field: "root",
          message: "このメールアドレスは既に登録されています",
        };

      case "auth/operation-not-allowed":
        return {
          field: "root",
          message: "メール/パスワード認証が有効化されていません。管理者に連絡してください。",
        };

      case "auth/weak-password":
        return {
          field: "password",
          message: "パスワードが弱すぎます。より強力なパスワードを設定してください。",
        };

      case "auth/configuration-not-found":
        return {
          field: "root",
          message: "Firebase認証の設定が見つかりません。環境変数を確認してください。",
        };

      default:
        return {
          field: "root",
          message: `エラー: ${firebaseError.code} - ${firebaseError.message}`,
        };
    }
  }

  if (err instanceof Error) {
    return { field: "root", message: err.message };
  }

  return { field: "root", message: "認証に失敗しました" };
};
