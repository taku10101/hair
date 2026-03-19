export type UserRole = "ADMIN" | "SALARY";

export interface DbUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  firebaseUid: string | null;
  photoUrl: string | null;
  emailVerified: boolean;
  lastSignInMethod: string | null;
  createdAt: string;
  updatedAt: string;
}
