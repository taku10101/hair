/**
 * API request error
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Network connection error
 */
export class NetworkError extends Error {
  constructor(message = "ネットワークエラーが発生しました") {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Authentication error
 */
export class AuthError extends Error {
  constructor(message = "認証に失敗しました") {
    super(message);
    this.name = "AuthError";
  }
}
