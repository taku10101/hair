/**
 * カスタムエラークラス
 * HTTPステータスコードと共に使用するエラークラスを定義
 */

/**
 * リソースが見つからない場合のエラー
 * HTTPステータス: 404
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
    // TypeScriptでのエラークラス継承のベストプラクティス（プロトタイプ設定）
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * リソースが既に存在する場合のエラー
 * HTTPステータス: 409
 */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * バリデーションエラー
 * HTTPステータス: 400
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 認証エラー
 * HTTPステータス: 401
 */
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 権限エラー
 * HTTPステータス: 403
 */
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
