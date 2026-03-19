import { authenticatedFetch } from "@/lib/apiClient";

export interface UpdateProfileData {
  name: string;
}

export const updateProfile = async (data: UpdateProfileData): Promise<void> => {
  await authenticatedFetch("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};
