"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { auth } from "@/lib/firebase/client";
import { signOut as firebaseSignOut } from "firebase/auth";

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  picture: string | null;
  promptsRemaining: number;
  referralCode: string | null;
};

type AuthContextType = {
  user: UserProfile | null;
  promptsRemaining: number;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [promptsRemaining, setPromptsRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setPromptsRemaining(data.user.promptsRemaining);
      } else {
        setUser(null);
        setPromptsRemaining(0);
      }
    } catch {
      setUser(null);
      setPromptsRemaining(0);
    }
    setIsLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile();
    }
  }, [user, fetchProfile]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
    setPromptsRemaining(0);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, promptsRemaining, isLoading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
