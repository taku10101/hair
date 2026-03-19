import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
  type UserCredential,
} from "firebase/auth";
import React, { createContext, type ReactNode, useEffect, useState } from "react";
import { useFetchUserData } from "@/hooks/auth/useFetchUserData";
import { getFirebaseAuth } from "@/lib/auth/firebase";
import type { DbUser, UserRole } from "@/types/auth";

interface AuthContextType {
  currentUser: User | null;
  dbUser: DbUser | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Firebase認証の状態を管理するProvider
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getFirebaseAuth();
  const { fetchUserData: fetchUserDataHook } = useFetchUserData();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        await fetchUserDataHook(user, {
          onSuccess: (userData, userRole) => {
            setDbUser(userData);
            setRole(userRole);
          },
        });
      } else {
        setDbUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [auth, fetchUserDataHook]);

  /**
   * メールアドレスとパスワードでサインイン
   */
  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * メールアドレスとパスワードで新規登録
   */
  const signUp = async (email: string, password: string): Promise<UserCredential> => {
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  /**
   * サインアウト
   */
  const signOut = async (): Promise<void> => {
    return firebaseSignOut(auth);
  };

  /**
   * ユーザーデータを再取得
   */
  const refreshUserData = async () => {
    if (currentUser) {
      await fetchUserDataHook(currentUser, {
        onSuccess: (userData, userRole) => {
          setDbUser(userData);
          setRole(userRole);
        },
      });
    }
  };

  const value: AuthContextType = {
    currentUser,
    dbUser,
    role,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
