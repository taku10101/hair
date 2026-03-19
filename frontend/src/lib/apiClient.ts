/**
 * API Client
 * Provides authenticated and non-authenticated fetch methods for backend API
 */

import { getFirebaseAuth } from "@/lib/auth/firebase";
import { env } from "@/lib/env";
import { ApiError, NetworkError } from "@/lib/errors";

const API_BASE_URL = env.VITE_API_BASE_URL;

/**
 * Generic fetcher function for SWR
 */
export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`);

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the data.");
    // エラーオブジェクトに追加情報を添付
    throw error;
  }

  return response.json();
}

/**
 * Build query string from params object
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        // 配列の場合、カンマ区切りの値として送信
        if (value.length > 0) {
          searchParams.append(key, value.join(","));
        }
      } else {
        searchParams.append(key, String(value));
      }
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Authenticated fetch function
 * Automatically adds Firebase ID token to Authorization header
 */
export async function authenticatedFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new ApiError(401, "認証が必要です");
    }

    const token = await currentUser.getIdToken();

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.error?.message || errorData.error || "リクエストに失敗しました",
        errorData
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new NetworkError();
    }
    throw error;
  }
}

/**
 * API Client methods (Legacy - use authenticatedFetch instead)
 * @deprecated These methods do not include authentication. Use authenticatedFetch for all API calls.
 */
export const apiClient = {
  /**
   * GET request (Legacy)
   * @deprecated Use authenticatedFetch instead
   */
  get: async <T>(endpoint: string, params?: Record<string, unknown>): Promise<T> => {
    const queryString = params ? buildQueryString(params) : "";
    return fetcher<T>(`${endpoint}${queryString}`);
  },

  /**
   * POST request (Legacy)
   * @deprecated Use authenticatedFetch instead
   */
  post: async <T>(endpoint: string, data: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("An error occurred while creating the data.");
    }

    return response.json();
  },

  /**
   * PATCH request (partial update) (Legacy)
   * @deprecated Use authenticatedFetch instead
   */
  patch: async <T>(endpoint: string, data: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("An error occurred while updating the data.");
    }

    return response.json();
  },

  /**
   * DELETE request (Legacy)
   * @deprecated Use authenticatedFetch instead
   */
  delete: async (endpoint: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("An error occurred while deleting the data.");
    }
  },
};
