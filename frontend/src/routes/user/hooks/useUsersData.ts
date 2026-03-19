/**
 * User-specific data fetching hooks
 */

import useSWR, { type SWRConfiguration } from "swr";
import { authenticatedFetch, buildQueryString } from "@/lib/apiClient";
import type { QueryParams } from "@/lib/apiTypes";
import type { DbUser } from "@/types/auth";

/**
 * Authenticated fetcher for users endpoint
 */
const authenticatedUsersFetcher = async (url: string) => {
  return authenticatedFetch<DbUser[]>(url);
};

/**
 * Hook to fetch users
 */
export function useUsers(params?: QueryParams, config?: SWRConfiguration) {
  const queryString = params ? buildQueryString(params) : "";
  const { data, error, isLoading, mutate } = useSWR<DbUser[]>(
    `/api/users${queryString}`,
    authenticatedUsersFetcher,
    config
  );

  return {
    users: data,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Authenticated fetcher for single user endpoint
 */
const authenticatedUserFetcher = async (url: string) => {
  return authenticatedFetch<DbUser>(url);
};

/**
 * Hook to fetch a single user
 */
export function useUser(id: number | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<DbUser>(
    id ? `/api/users/${id}` : null,
    authenticatedUserFetcher,
    config
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}
